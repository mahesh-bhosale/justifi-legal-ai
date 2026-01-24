from fastapi import FastAPI, UploadFile, File
import torch
import numpy as np
import pdfplumber
import datetime
import json

from transformers import AutoTokenizer, AutoModelForSequenceClassification

# -------------------------------
# App Initialization
# -------------------------------
app = FastAPI(
    title="InLegalBERT Legal Outcome Predictor",
    description="Upload a legal PDF and get ACCEPT / REJECT prediction",
    version="1.0"
)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

MODEL_PATH = "inlegalbert_final"

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_PATH,
    use_safetensors=True
).to(DEVICE)

model.eval()

# -------------------------------
# Utility Functions
# -------------------------------
def confidence_level(score: float) -> str:
    if score >= 0.80:
        return "Very High"
    elif score >= 0.65:
        return "High"
    elif score >= 0.55:
        return "Medium"
    else:
        return "Low"


def read_pdf(file) -> str:
    text = ""
    with pdfplumber.open(file) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + " "
    return text.strip()


# -------------------------------
# Core Prediction Logic
# -------------------------------
@torch.no_grad()
def predict_chunks(text: str, stride: int = 256):
    encodings = tokenizer(
        text,
        truncation=True,
        padding="max_length",
        max_length=512,
        stride=stride,
        return_overflowing_tokens=True,
        return_tensors="pt"
    )

    probs_list = []
    chunk_predictions = []

    for i in range(encodings["input_ids"].shape[0]):
        inputs = {
            "input_ids": encodings["input_ids"][i:i+1].to(DEVICE),
            "attention_mask": encodings["attention_mask"][i:i+1].to(DEVICE)
        }

        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1).cpu().numpy()[0]

        label_id = int(np.argmax(probs))
        label = "ACCEPT" if label_id == 1 else "REJECT"
        confidence = float(np.max(probs))

        probs_list.append(probs)
        chunk_predictions.append({
            "chunk_id": i + 1,
            "prediction": label,
            "confidence": round(confidence, 4)
        })

    avg_probs = np.mean(probs_list, axis=0)
    final_label_id = int(np.argmax(avg_probs))
    final_confidence = float(np.max(avg_probs))

    final_label = "ACCEPT" if final_label_id == 1 else "REJECT"

    result = {
        "prediction": final_label,
        "confidence": round(final_confidence, 4),
        "confidence_level": confidence_level(final_confidence),
        "num_chunks": len(probs_list),
        "avg_chunk_confidence": round(float(np.mean([c["confidence"] for c in chunk_predictions])), 4),
        "min_chunk_confidence": round(float(np.min([c["confidence"] for c in chunk_predictions])), 4),
        "max_chunk_confidence": round(float(np.max([c["confidence"] for c in chunk_predictions])), 4),
        "chunk_predictions": chunk_predictions
    }

    # Optional audit log (VERY good for legal domain)
    with open("prediction_logs.jsonl", "a", encoding="utf-8") as f:
        f.write(json.dumps({
            "timestamp": str(datetime.datetime.now()),
            "result": result
        }) + "\n")

    return result


# -------------------------------
# API Endpoints
# -------------------------------
@app.get("/health")
def health_check():
    return {
        "status": "OK",
        "model": "InLegalBERT",
        "device": DEVICE
    }


@app.post("/predict-pdf")
async def predict_pdf(
    file: UploadFile = File(...),
    threshold: float = 0.5
):
    text = read_pdf(file.file)

    if len(text) < 200:
        return {
            "prediction": "TEXT_TOO_SHORT",
            "confidence": 0.0,
            "confidence_level": "Low",
            "num_chunks": 0
        }

    result = predict_chunks(text)

    # Apply user-defined threshold
    if result["confidence"] < threshold:
        result["prediction"] = "REJECT"
        result["note"] = "Rejected due to confidence below threshold"

    return result
