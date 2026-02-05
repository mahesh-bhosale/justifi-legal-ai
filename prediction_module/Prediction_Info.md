⚖️ JustiFi – AI-Powered Legal Decision Support System

JustiFi is an AI-driven legal intelligence platform designed to assist legal professionals by predicting case outcomes, retrieving similar legal cases, and providing explainability for decisions using state-of-the-art InLegalBERT and NLP techniques.

This project is developed as a final-year major project and focuses on real-world scalability, explainability, and deployment readiness.

🚀 Key Features
🔹 1. Legal Outcome Prediction

Predicts ACCEPT / REJECT for legal cases

Powered by InLegalBERT

Uses chunk-based inference to handle long legal documents (beyond 512 tokens)

🔹 2. Chunk-Based Document Processing

Splits long judgments into overlapping chunks

Aggregates predictions using probability averaging

Ensures full-document understanding

🔹 3. Similar Case Retrieval

Finds legally similar past cases

Uses sentence embeddings + cosine similarity

Works on entire documents, not just first 512 tokens

🔹 4. Explainability (Why This Prediction?)

Shows:

Confidence score

Number of chunks considered

Similar cases that influenced the decision

Designed for legal transparency

🔹 5. PDF Upload & Processing

Upload any legal PDF

Extracts text automatically

Runs prediction + similarity search

🔹 6. API-Based Architecture

FastAPI backend

Modular, production-ready structure

Can be integrated with frontend or mobile apps

🧠 Model & Dataset
🔸 Model Used

InLegalBERT (Legal-domain BERT model)

Fine-tuned on Indian legal judgments

Binary classification: ACCEPT (1) / REJECT (0)

🔸 Dataset

Source: CJPE / NyayaAnumana legal datasets

Courts covered:

Supreme Court

High Courts

Tribunals

Dataset size: 300K+ legal cases

Labels:

0 → Rejected

1 → Accepted

⚠️ Datasets are NOT included in this repository due to size and licensing constraints.

📂 Project Structure
JUSTIFI-LEGAL-AI/
│
├── backend/                 # Backend services (FastAPI)
│
├── datasets/                # (Ignored) Raw legal datasets
│
├── ml_model/
│   ├── routes/              # API routes
│   ├── utils/               # PDF, text utilities
│   ├── model_loader.py      # Loads trained model
│   ├── summarizer.py
│   ├── run_server.py
│   └── requirements.txt
│
├── prediction_module/
│   ├── inlegalbert_final/   # (Ignored) Trained model
│   ├── bert_prediction.ipynb
│   ├── inlegalbert_inference.ipynb
│   ├── data_processing.ipynb
│   └── prediction.py        # FastAPI inference API
│
├── .gitignore
├── README.md
└── requirements.txt

🛠️ Tech Stack
Category	Tools
Language	Python 3.10
Model	InLegalBERT
NLP	HuggingFace Transformers
ML	PyTorch
API	FastAPI
PDF	pdfplumber
Similarity	Sentence Transformers
Deployment	Uvicorn
⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/your-username/justifi-legal-ai.git
cd justifi-legal-ai

2️⃣ Create Virtual Environment
python -m venv legal_env
legal_env\Scripts\activate   # Windows

3️⃣ Install Dependencies
pip install -r requirements.txt

▶️ Running the API Server
Start Prediction API
uvicorn prediction:app --reload


API will run at:

http://127.0.0.1:8000


Swagger UI:

http://127.0.0.1:8000/docs

📄 API Endpoints
🔹 Predict Case Outcome (PDF)

POST /predict/pdf

Response:

{
  "prediction": "ACCEPT",
  "confidence": 0.73,
  "num_chunks": 8
}

🔹 Predict Case Outcome (Text)

POST /predict/text

🔹 Similar Case Retrieval

POST /similar_cases

Returns:

Top similar judgments

Similarity score

Reason for similarity

📊 Model Performance (Chunk-Based)
Metric	Score
Accuracy	0.735
Precision	0.70
Recall	0.76
F1-score	0.73

Chunk-based inference significantly improves performance over 512-token limitation.

🔍 Explainability Strategy

JustiFi provides explainability by:

Chunk-level predictions

Confidence aggregation

Similar case evidence

Transparent scoring

This makes predictions interpretable and trustworthy for legal use.

❗ Why Chunking?

Legal judgments are very long (10k–30k words).

BERT limit = 512 tokens

✔ Chunking ensures:

No loss of legal reasoning

Full-document context

Better real-world accuracy

📌 Why Datasets & Models Are Ignored

Extremely large size (GBs)

Licensing restrictions

Can be regenerated via scripts

All training and preprocessing code is included.

🔮 Future Enhancements

Multilingual legal support

Advanced legal reasoning graphs

RAG-based legal chatbot

Timeline extraction

Citation analysis

👨‍🎓 Academic Note

This project is developed as a final-year engineering major project focusing on:

Applied AI

Legal NLP

Explainable ML

Production deployment


⭐ If You Like This Project

Give it a ⭐ on GitHub — it really helps!