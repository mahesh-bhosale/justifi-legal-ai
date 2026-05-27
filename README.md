<div align="center">

# ⚖️ JustiFi: AI-Powered Legal Simplifier & Case Outcome Predictor

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Now-blue?style=for-the-badge)](https://justifi-legal-ai.vercel.app/)
![Status](https://img.shields.io/badge/Status-Development-yellow?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![Python](https://img.shields.io/badge/Python-3.9+-blue?style=for-the-badge&logo=python)

An end-to-end AI-powered legal platform that simplifies complex legal documents and predicts possible case outcomes using **NLP, ML, and LLMs**.

*Built as a Major Project (B.E. Computer Engineering) under the University of Mumbai, 2025-2026.*

<br/>

### 📖 Published Research Paper
Our work, **"AI Based Legal Simplification and Case Outcome Prediction"**, has been officially published in the *International Journal of Advanced Research in Computer and Communication Engineering (IJARCCE)* (Peer-reviewed & Refereed).

**DOI:** [10.17148/IJARCCE.2026.153112](https://doi.org/10.17148/IJARCCE.2026.153112) | **Volume:** 15, Issue 3 (March 2026) | **Impact Factor:** 8.471

</div>

<br />

## 📖 Overview & Problem Statement

The legal domain generates a vast amount of complex textual data such as court judgments, petitions, contracts, and case files. These documents are written in technical language, making them difficult for common citizens to understand. Even legal professionals spend significant time analyzing lengthy documents and predicting case outcomes.

**JustiFi** bridges this gap by providing an intelligent, user-friendly legal assistance system. The platform integrates Natural Language Processing (NLP) and Machine Learning (ML) techniques to perform two primary tasks: 
1. **Legal Document Summarization:** Generates concise and context-aware summaries from lengthy legal documents using transformer-based models (LED).
2. **Case Outcome Prediction:** Analyzes legal texts and classifies case outcomes as ACCEPT or REJECT using a chunking and probability aggregation strategy via the **InLegalBERT** model.

---

## ✨ Key Features & Capabilities

### 🤖 AI Capabilities
- **Legal Document Summarization:** Condenses lengthy legal texts using transformer models.
- **Case Outcome Prediction:** ML-powered predictions with confidence scores.
- **Explainable AI:** Rationales and evidence provided alongside predictions.

### 👥 Multi-Role System
- **Citizens:** Upload documents, create cases, search lawyers, and receive AI predictions.
- **Lawyers:** Manage professional profiles, submit proposals to citizens, interact with clients, and publish blogs.
- **Admins:** Verify lawyer registrations, manage users, and monitor platform integrity.

### 🔧 Platform Features
- **Real-time Chat:** Secure messaging between lawyers and citizens.
- **Document Management:** Upload, store, and process legal documents securely.
- **Search & Discovery:** Find lawyers based on expertise, ratings, and location.

---

## 📊 Results & Performance Metrics

Our case outcome prediction model (**InLegalBERT**) was trained and evaluated on real-world legal case documents. The model uses a chunking approach to overcome token limits, averaging probabilities across document segments to generate a final prediction. 

* **Overall Accuracy:** ~70%
* **Classification:** Binary (ACCEPT / REJECT)

### Model Evaluation Results

<div align="center">
  <img src="prediction_module/results/accuracy_vs_epoch.png" alt="Accuracy vs Epoch" width="45%" />
  <img src="prediction_module/results/precision_vs_recall.png" alt="Precision vs Recall" width="45%" />
</div>

<div align="center">
  <img src="prediction_module/results/confusion_matrix.png" alt="Confusion Matrix" width="45%" />
  <img src="prediction_module/results/confidence_distribution.png" alt="Confidence Distribution" width="45%" />
</div>

<div align="center">
  <br/>
  <img src="prediction_module/results/response_time_vs_doc_length.png" alt="Response Time vs Document Length" width="60%" />
</div>

### Training Progression

<div align="center">
  <img src="docs/images/Fig.%206.2.1%20Training%20vs%20Validation%20Loss.png" alt="Training vs Validation Loss" width="45%" />
  <img src="docs/images/Fig.%206.2.2%20Precision–Recall%20Trade-off%20During%20Training.png" alt="Precision-Recall Trade-off During Training" width="45%" />
</div>

---

## 💻 Application Interface (UI)

*Our responsive web interface is built using Next.js and Tailwind CSS. Since some of these pages contain a lot of information, they are placed in collapsible sections below.*

<details>
<summary><strong>1. Landing Page (Click to expand)</strong></summary>
<br/>
<div align="center">
  <img src="docs/images/Fig.%206.1.1%20Landing%20Page.png" alt="Landing Page" width="80%" />
</div>
</details>

<details>
<summary><strong>2. Citizen Cases Page (Click to expand)</strong></summary>
<br/>
<div align="center">
  <img src="docs/images/Fig.%206.1.4%20Citizen%20Cases%20Pages.png" alt="Citizen Cases Page" width="80%" />
</div>
</details>

<details>
<summary><strong>3. Authentication (Signup & Login)</strong></summary>
<br/>
<div align="center">
  <img src="docs/images/Fig.%206.1.2%20Signup%20Page.png" alt="Signup Page" width="45%" />
  <img src="docs/images/Fig.%206.1.3%20Login%20Page.png" alt="Login Page" width="45%" />
</div>
</details>

<details>
<summary><strong>4. AI Summarizer & QA Assistant</strong></summary>
<br/>
<div align="center">
  <img src="docs/images/Fig.%206.1.5%20AI%20Summarizer%20and%20QA.png" alt="AI Summarizer" width="80%" />
</div>
</details>

<details>
<summary><strong>5. Chatbot Assistant & Communication</strong></summary>
<br/>
<div align="center">
  <img src="docs/images/Fig.%206.1.6%20Chatbot%20Assistant.png" alt="Chatbot Assistant" width="80%" />
</div>
</details>

<details>
<summary><strong>6. Case Outcome Prediction Interface</strong></summary>
<br/>
<div align="center">
  <img src="docs/images/Fig.%206.1.7%20Case%20Outcome%20Prediction.png" alt="Case Outcome Prediction" width="80%" />
</div>
</details>

<br/>

### 🎥 Live Video Demonstration

*Click below to watch the complete project demonstration on YouTube!*

<div align="center">
  <a href="https://youtu.be/xKsWNeTxwfs" target="_blank">
    <img 
      src="https://img.youtube.com/vi/xKsWNeTxwfs/maxresdefault.jpg" 
      alt="JustiFi Project Demo"
      width="80%"
    />
  </a>

  <br/>
  <br/>

</div>
---

## 🏗 System Architecture & Design

Our system follows an **Incremental Software Model** (see <a href="docs/images/Fig%203.1%20Development%20Model.png">Fig 3.1 Development Model</a>), combining a React/Next.js frontend with a Node.js/Express backend, all interacting with Python-based AI services.

### High-Level Architecture
<div align="center">
  <img src="docs/images/Fig.%203.3.2%20System%20Architecture.png" alt="System Architecture" width="80%" />
</div>

### System Flow & Documentation

<details>
<summary><strong>Data Flow Diagrams (DFD)</strong></summary>
<br/>
<div align="center">
  <img src="docs/images/Fig.%203.3.3(a)%20DFD%20Level%200.png" alt="DFD Level 0" width="45%" />
  <img src="docs/images/Fig%203.3.3(b)%20DFD%20Level%201.png" alt="DFD Level 1" width="45%" />
</div>
<br/>
<div align="center">
  <img src="docs/images/Fig.%203.3.3(c)%20DFD%20Level%202%20Summarization.png" alt="DFD Level 2 Summarization" width="45%" />
  <img src="docs/images/Fig.%203.3.3(d)%20DFD%20Level%202%20Prediction.png" alt="DFD Level 2 Prediction" width="45%" />
</div>
<br/>
<div align="center">
  <img src="docs/images/Fig.%203.3.3(e)%20DFD%20Level%202%20Lawyer%20Profile.png" alt="DFD Level 2 Lawyer Profile" width="60%" />
</div>
</details>

<details>
<summary><strong>System Design Diagrams (UML & Database)</strong></summary>
<br/>
<div align="center">
  <h4>Use-Case Diagram</h4>
  <img src="docs/images/Fig.%203.3.4%20Use-Case%20Diagram.png" alt="Use Case Diagram" width="70%" />
  <br/>
  <h4>Sequence Diagram</h4>
  <img src="docs/images/Fig.%203.3.5%20Sequence%20diagram.png" alt="Sequence Diagram" width="70%" />
  <br/>
  <h4>Deployment & Database Design</h4>
  <img src="docs/images/Fig.%203.3.6%20Deployment%20Diagram.png" alt="Deployment Diagram" width="45%" />
  <img src="docs/images/Fig.%203.3.7%20Database%20Design%20Diagram.png" alt="Database Diagram" width="45%" />
</div>
</details>


---

## 🛠 Tech Stack

### **Frontend**
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

### **Backend**
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white) ![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-000000?style=for-the-badge)

### **AI/ML Services**
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white) ![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white) ![Hugging Face](https://img.shields.io/badge/Hugging%20Face-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black) ![Scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white) ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)

### **Infrastructure & Tools**
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white) ![ngrok](https://img.shields.io/badge/ngrok-000000?style=for-the-badge)

---

## 🚀 Getting Started

### 1. Prerequisites & Services
Ensure you have Docker installed and run the following commands to start the required services (Redis, Kafka, etc.):
```bash
docker compose up -d
docker compose start

# Alternatively, to run Redis standalone:
docker run -d --name redis-server -p 6379:6379 redis
docker start redis-server
```

### 2. Environment Variables Setup
Create the necessary `.env` files in both the `backend` and `frontend` directories based on the templates below.

<details>
<summary><strong>Example <code>backend/.env</code></strong></summary>

```env
DATABASE_URL="postgresql://postgres:password@host:6543/postgres"
PORT=5000
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
NGROK_QA=https://your-qa-url.ngrok-free.dev
NGROK_SUMMARY=https://your-summary-url.ngrok-free.app
REDIS_URL=redis://localhost:6379
SUMMARY_CACHE_TTL_HOURS=96
NODE_ENV=development
KAFKA_CLIENT_ID=justifi-legal-ai
KAFKA_GROUP_ID=justifi-backend-group
KAFKA_BROKER=localhost:9092
KAFKA_SSL=false
SUPABASE_CASE_DOCUMENTS_BUCKET=case-documents
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_STORAGE_BUCKET=case-files
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_AVATARS_BUCKET=avatars
MESSAGE_ENCRYPTION_KEY=your_aes_256_key
FRONTEND_URL=http://localhost:3000
IP_HASH_SALT=your_ip_hash_salt
PREDICTION_SERVICE_URL=https://your-prediction-url.ngrok-free.app
```
</details>

<details>
<summary><strong>Example <code>frontend/.env.local</code></strong></summary>

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```
</details>

### 3. Google Colab Notebook
**Important:** Before running the backend, you must run the Colab notebook to start the model for Question Answering (PDF and Text).
Open and run all cells in: `ml_model/notebooks/legal_assistant.ipynb`

### 4. Setup Backend & Database
```bash
cd backend
npm install
npm run db:migrate  # or: npm run db:push
npm run dev
```

### 5. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 6. Setup Summary Model
```bash
python -m venv legal_env
legal_env\Scripts\activate
pip install -r requirements.txt
cd ml_model
python run_server.py
```

### 7. Setup Prediction Model
```bash
legal_env\Scripts\activate
cd prediction_module
python prediction.py
```

---

## 🔌 API Documentation

Once the backend is running (`http://localhost:5000`), key endpoints include:

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | User registration | No |
| `POST` | `/api/auth/login` | User login | No |
| `POST` | `/api/documents/summarize` | Summarize legal document | Yes |
| `POST` | `/api/ai/predict` | Predict case outcome | Yes |
| `POST` | `/api/cases` | Create a legal case | Yes |

*(Import the Postman collection from `backend/API_Documentation.md` for full testing capabilities).*

---

## 👨‍💻 Project Team

- **Mahesh Bhosale** — [GitHub](https://github.com/mahesh-bhosale)
- **Vikas Maurya** — [GitHub](https://github.com/vikasmaurya9769)
- **Intaza Chaudhary** — [GitHub](https://github.com/Intaza)
- **Mausam Yadav** — [GitHub](https://github.com/omyadav0410-jpg)

---

## 🔮 Future Scope
- **Mobile Application:** React Native / iOS / Android.
- **Advanced AI Models:** Fine-tuned legal-specific LLMs for higher accuracy.
- **Multilingual Support:** Expansion to support regional languages.
- **Blockchain Integration:** Secure document verification and smart contracts.

---

## 📄 License & Disclaimer

**License:** This project is licensed under the MIT License - see the `LICENSE` file for details.

**Disclaimer:** This system provides AI-assisted legal information and predictions for **educational purposes only**. It does **NOT** constitute legal advice. Always consult with a qualified legal professional for actual legal matters. 