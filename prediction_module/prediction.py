import datetime
import io
import json
import logging
from typing import Any, Dict, List, Optional

import numpy as np
import pdfplumber
import torch
from fastapi import (
    Body,
    FastAPI,
    File,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, constr
from transformers import AutoModelForSequenceClassification, AutoTokenizer

from explainability import generate_explanation as generate_explanation_sentences


# -------------------------------
# App Initialization
# -------------------------------
app = FastAPI(
    title="InLegalBERT Legal Outcome Predictor",
    description="Service for predicting legal case outcomes (ACCEPT / REJECT) from PDFs or raw text.",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Consider restricting in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------
# Global Configuration
# -------------------------------
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_PATH = "inlegalbert_final"
MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
MIN_TEXT_LENGTH = 200  # Minimum characters required for a meaningful prediction


# -------------------------------
# Logging Configuration
# -------------------------------
LOGGER = logging.getLogger("prediction_service")
LOGGER.setLevel(logging.INFO)

_file_handler = logging.FileHandler("prediction_service.log")
_formatter = logging.Formatter(
    "%(asctime)s - %(levelname)s - %(name)s - %(message)s"
)
_file_handler.setFormatter(_formatter)
LOGGER.addHandler(_file_handler)


def log_prediction_to_file(filename: str, result: Dict[str, Any]) -> None:
    """Append prediction information to JSONL audit log."""
    log_entry = {
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "filename": filename,
        "prediction": result.get("prediction"),
        "confidence": result.get("confidence"),
        "result": result,
    }

    try:
        with open("prediction_logs.jsonl", "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry) + "\n")
    except Exception as exc:  # pragma: no cover - logging must not break API
        LOGGER.error("Failed to write prediction log: %s", exc)

    LOGGER.info(
        "Prediction logged | filename=%s | prediction=%s | confidence=%s",
        filename,
        log_entry["prediction"],
        log_entry["confidence"],
    )


# -------------------------------
# Pydantic Models
# -------------------------------
class ChunkPrediction(BaseModel):
    """Per-chunk prediction details."""

    chunk_id: int
    prediction: str
    confidence: float


class PredictionResponse(BaseModel):
    """Unified prediction response for both PDF and text endpoints."""

    prediction: str
    confidence: float
    confidence_level: str
    num_chunks: int
    avg_chunk_confidence: float
    min_chunk_confidence: float
    max_chunk_confidence: float
    chunk_predictions: List[ChunkPrediction]
    explanation: str
    note: Optional[str] = None


class TextPredictionRequest(BaseModel):
    """Request body for raw-text predictions."""

    text: constr(min_length=MIN_TEXT_LENGTH) = Field(
        ...,
        description=(
            "Raw legal text to be evaluated. "
            f"Must be at least {MIN_TEXT_LENGTH} characters long."
        ),
    )
    threshold: float = Field(
        0.5,
        ge=0.0,
        le=1.0,
        description="Optional confidence threshold. Below this, prediction will be forced to REJECT.",
    )


class HealthResponse(BaseModel):
    """Basic health information for monitoring."""

    model_name: str
    device: str


# -------------------------------
# Model Loading
# -------------------------------
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_PATH,
    use_safetensors=True,
).to(DEVICE)
model.eval()


# -------------------------------
# Utility Functions
# -------------------------------
def confidence_level(score: float) -> str:
    """Map a confidence score in [0, 1] to a qualitative level."""
    if score >= 0.80:
        return "Very High"
    if score >= 0.65:
        return "High"
    if score >= 0.55:
        return "Medium"
    return "Low"


def extract_pdf_text(file_bytes: bytes) -> str:
    """Extract text from a PDF file represented as raw bytes."""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        pages_text: List[str] = []
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                pages_text.append(page_text)
    return " ".join(pages_text).strip()


@torch.no_grad()
def chunk_predict(text: str, stride: int = 256) -> Dict[str, Any]:
    """Run the model over long text using sliding-window chunking."""
    encodings = tokenizer(
        text,
        truncation=True,
        padding="max_length",
        max_length=512,
        stride=stride,
        return_overflowing_tokens=True,
        return_tensors="pt",
    )

    probs_list: List[np.ndarray] = []
    chunk_predictions: List[Dict[str, Any]] = []

    for i in range(encodings["input_ids"].shape[0]):
        inputs = {
            "input_ids": encodings["input_ids"][i : i + 1].to(DEVICE),
            "attention_mask": encodings["attention_mask"][i : i + 1].to(DEVICE),
        }

        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1).cpu().numpy()[0]

        label_id = int(np.argmax(probs))
        label = "ACCEPT" if label_id == 1 else "REJECT"
        confidence = float(np.max(probs))

        probs_list.append(probs)
        chunk_predictions.append(
            {
                "chunk_id": i + 1,
                "prediction": label,
                "confidence": round(confidence, 4),
            }
        )

    avg_probs = np.mean(probs_list, axis=0)
    final_label_id = int(np.argmax(avg_probs))
    final_confidence = float(np.max(avg_probs))
    final_label = "ACCEPT" if final_label_id == 1 else "REJECT"

    result: Dict[str, Any] = {
        "prediction": final_label,
        "confidence": round(final_confidence, 4),
        "confidence_level": confidence_level(final_confidence),
        "num_chunks": len(probs_list),
        "avg_chunk_confidence": round(
            float(np.mean([c["confidence"] for c in chunk_predictions])),
            4,
        ),
        "min_chunk_confidence": round(
            float(np.min([c["confidence"] for c in chunk_predictions])),
            4,
        ),
        "max_chunk_confidence": round(
            float(np.max([c["confidence"] for c in chunk_predictions])),
            4,
        ),
        "chunk_predictions": chunk_predictions,
    }

    return result


def _fallback_explanation(result: Dict[str, Any]) -> str:
    """
    Fallback, global explanation if sentence-level extraction is unavailable.
    """
    prediction = result.get("prediction")
    confidence = result.get("confidence", 0.0)
    confidence_level_str = result.get("confidence_level", "Unknown")
    num_chunks = result.get("num_chunks", 0)

    if num_chunks <= 0:
        return (
            "The document did not contain enough readable text for a reliable analysis. "
            "Please provide a longer or clearer document."
        )

    confidence_pct = round(confidence * 100, 1)
    return (
        f"The model predicts an overall outcome of '{prediction}' with "
        f"{confidence_pct}% confidence ({confidence_level_str} confidence level) "
        f"based on analysis of {num_chunks} text segment(s). "
        "This assessment is derived from InLegalBERT's learned patterns across similar legal cases, "
        "but it should always be reviewed by a qualified legal professional."
    )


# -------------------------------
# API Endpoints
# -------------------------------
@app.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    """Return basic health and model/device information."""
    return HealthResponse(model_name="InLegalBERT", device=DEVICE)


@app.post("/predict-pdf", response_model=PredictionResponse)
async def predict_pdf(
    file: UploadFile = File(..., description="PDF file containing the legal document."),
    threshold: float = Body(
        0.5,
        embed=True,
        ge=0.0,
        le=1.0,
        description=(
            "Optional confidence threshold. Below this, prediction will be forced to REJECT."
        ),
    ),
) -> PredictionResponse:
    """Predict outcome from an uploaded PDF file."""
    if file.content_type != "application/pdf" and not (
        file.filename and file.filename.lower().endswith(".pdf")
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported.",
        )

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    if len(file_bytes) > MAX_PDF_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="PDF file size exceeds 10 MB limit.",
        )

    try:
        text = extract_pdf_text(file_bytes)
    except Exception as exc:
        LOGGER.error("Failed to extract text from PDF: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to read PDF content. Ensure the file is a valid, non-corrupted PDF.",
        ) from exc

    if len(text) < MIN_TEXT_LENGTH:
        # Return a structured response rather than raising an error for short text
        base_result: Dict[str, Any] = {
            "prediction": "TEXT_TOO_SHORT",
            "confidence": 0.0,
            "confidence_level": "Low",
            "num_chunks": 0,
            "avg_chunk_confidence": 0.0,
            "min_chunk_confidence": 0.0,
            "max_chunk_confidence": 0.0,
            "chunk_predictions": [],
        }
        base_result["explanation"] = (
            f"Provided document text is too short for reliable prediction. "
            f"Please supply at least {MIN_TEXT_LENGTH} characters of text."
        )

        response = PredictionResponse(**base_result)
        log_prediction_to_file(file.filename or "uploaded.pdf", response.dict())
        return response

    result = chunk_predict(text)

    # Apply user-defined threshold
    if result["confidence"] < threshold:
        result["prediction"] = "REJECT"
        result["note"] = "Prediction forced to REJECT due to confidence below threshold."

    # Sentence-level explainability: select top influential sentences.
    try:
        top_sentences = generate_explanation_sentences(text)
        if top_sentences:
            result["explanation"] = "\n".join(
                f"- {sentence}" for sentence in top_sentences
            )
        else:
            result["explanation"] = _fallback_explanation(result)
    except Exception as exc:  # pragma: no cover - explanation must not break API
        LOGGER.error("Failed to generate explanation sentences: %s", exc)
        result["explanation"] = _fallback_explanation(result)

    response = PredictionResponse(**result)
    log_prediction_to_file(file.filename or "uploaded.pdf", response.dict())
    return response


@app.post("/predict-text", response_model=PredictionResponse)
async def predict_text(payload: TextPredictionRequest) -> PredictionResponse:
    """Predict outcome from raw legal text provided in the request body."""
    text = payload.text.strip()

    if len(text) < MIN_TEXT_LENGTH:
        base_result: Dict[str, Any] = {
            "prediction": "TEXT_TOO_SHORT",
            "confidence": 0.0,
            "confidence_level": "Low",
            "num_chunks": 0,
            "avg_chunk_confidence": 0.0,
            "min_chunk_confidence": 0.0,
            "max_chunk_confidence": 0.0,
            "chunk_predictions": [],
        }
        base_result["explanation"] = (
            f"Provided text is too short for reliable prediction. "
            f"Please supply at least {MIN_TEXT_LENGTH} characters of text."
        )

        response = PredictionResponse(**base_result)
        log_prediction_to_file("raw_text", response.dict())
        return response

    result = chunk_predict(text)

    if result["confidence"] < payload.threshold:
        result["prediction"] = "REJECT"
        result["note"] = "Prediction forced to REJECT due to confidence below threshold."

    try:
        top_sentences = generate_explanation_sentences(text)
        if top_sentences:
            result["explanation"] = "\n".join(
                f"- {sentence}" for sentence in top_sentences
            )
        else:
            result["explanation"] = _fallback_explanation(result)
    except Exception as exc:  # pragma: no cover
        LOGGER.error("Failed to generate explanation sentences: %s", exc)
        result["explanation"] = _fallback_explanation(result)

    response = PredictionResponse(**result)
    log_prediction_to_file("raw_text", response.dict())
    return response


if __name__ == "__main__":
    import uvicorn

    print("\nInLegalBERT Prediction Server Starting...")
    print("Local URL: http://localhost:8001")
    print("API Docs: http://localhost:8001/docs")
    print("Health Check: http://localhost:8001/health\n")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        log_level="info",
    )