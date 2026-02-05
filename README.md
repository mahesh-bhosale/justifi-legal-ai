# ⚖️ JustiFi - AI-Powered Legal Simplifier & Case Outcome Predictor

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Now-blue?style=for-the-badge)](https://justifi-legal-ai.vercel.app/)
![Status](https://img.shields.io/badge/Status-Development-yellow?style=for-the-badge)

An end-to-end AI-powered legal platform that simplifies complex legal documents and predicts possible case outcomes using **NLP, ML, and LLMs**.

Built as a **Major Project (B.E. Computer Engineering)** under the University of Mumbai, 2025-2026.

---

## 📌 Table of Contents

* [Abstract](#abstract)
* [Features](#features)
* [Tech Stack](#tech-stack)
* [System Architecture](#system-architecture)
* [Installation](#installation)
* [Usage](#usage)
* [Project Structure](#project-structure)
* [API Documentation](#api-documentation)
* [Team & Institution](#team--institution)
* [Future Scope](#future-scope)
* [License](#license)

---

## 📄 Abstract

In recent years, Artificial Intelligence (AI) has emerged as a transformative technology in the legal domain, offering innovative solutions for managing and analyzing vast volumes of legal documents. The AI-Powered Legal Assistant developed in this project aims to simplify and modernize legal research, case prediction, and citizen–lawyer interaction through intelligent automation.

The proposed system integrates Natural Language Processing (NLP) and Machine Learning (ML) techniques to perform two major tasks: legal document summarization and case outcome prediction. Using transformer-based language models, the system extracts concise and relevant summaries from lengthy case documents. Additionally, supervised learning algorithms are used to predict probable case outcomes based on historical data.

The application is implemented as a web-based platform built using Next.js, Node.js, and PostgreSQL, providing an interactive interface for citizens, lawyers, and administrators.

---

## ✨ Features

### 🤖 AI Capabilities
- **Legal Document Summarization** - Condenses lengthy legal texts using transformer models
- **Case Outcome Prediction** - ML-powered predictions with confidence scores
- **Explainable AI** - Rationales and evidence for predictions
- **Multilingual Support** - English & Hindi document processing

### 👥 Multi-Role System
- **Citizens** - Upload documents, create cases, search lawyers, get AI predictions
- **Lawyers** - Manage profiles, submit proposals, interact with clients, publish blogs
- **Admins** - Verify lawyers, manage users, monitor platform integrity

### 🔧 Platform Features
- **Real-time Chat** - Secure messaging between lawyers and citizens
- **Document Management** - Upload, store, and process legal documents
- **Search & Discovery** - Find lawyers based on expertise, ratings, and location
- **Blog System** - Legal knowledge sharing platform
- **Review System** - Rate and review legal services

---

## 🛠 Tech Stack

### **Frontend**
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

### **Backend**
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-000000?style=for-the-badge)

### **AI/ML Services**
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)
![Hugging Face](https://img.shields.io/badge/Hugging%20Face-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)
![Scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)

### **Infrastructure & Tools**
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![ngrok](https://img.shields.io/badge/ngrok-000000?style=for-the-badge)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│                    http://localhost:3000                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ REST API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Node.js)                       │
│                    http://localhost:5000                    │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │ Auth    │  │ Cases   │  │ Chat    │  │ AI      │         │
│  │ Module  │  │ Module  │  │ Module  │  │ Gateway │         │
│  └─────────┘  └─────────┘  └─────────┘  └────┬────┘         │
└──────────────────────────┬────────────────────┼─────────────┘
                           │                    │
                    ┌──────┴──────┐     ┌──────▼──────┐
                    │ PostgreSQL  │     │   Redis     │
                    │ (Supabase)  │     │  (Cache)    │
                    └─────────────┘     └─────────────┘
                           │                    │
                           └──────┬──────┬──────┘
                                  │      │
                           ┌──────▼──────▼──────┐
                           │    AI Services     │
                           └────────────────────┘
                                  │      │
                       ┌──────────▼──────▼──────────┐
                       │ Summarization   Prediction │
                       │   Service        Service   │
                       │  (ml_model)   (prediction) │
                       └────────────────────────────┘
```

---

## 🚀 Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (3.9 or higher)
- **Docker** (for Redis)
- **Supabase Account** (for PostgreSQL)
- **ngrok Account** (for exposing ML services)

### Step 1: Clone the Repository
```bash
git clone https://github.com/mahesh-bhosale/justifi-legal-ai.git
cd justifi-legal-ai
```

### Step 2: Set Up Environment Variables

#### Backend (.env)
```env
# backend/.env
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"
PORT=5000
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=24h
NGROK_QA=https://your-ngrok-url.ngrok-free.dev
NGROK_SUMMARY=https://your-ngrok-url.ngrok-free.dev
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

#### Frontend (.env.local)
```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Step 3: Start Redis with Docker
```bash
docker run -d --name redis-server -p 6379:6379 redis
docker start redis-server
```

### Step 4: Set Up Python Environment
```bash
# Create virtual environment
python -m venv legal_venv

# Activate (Windows)
legal_venv\Scripts\activate

# Activate (Linux/Mac)
source legal_venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### Step 5: Install Backend Dependencies
```bash
cd backend
npm install

# Set up database with Drizzle ORM
npm run db:generate
npm run db:push
npm run db:studio  # Optional: Database GUI
```

### Step 6: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Step 7: Run ML Services
```bash
# Activate virtual environment if not already activated
source legal_venv/bin/activate  # or legal_venv\Scripts\activate

# Run ML model server
cd ml_model
python run_server.py
```

### Step 8: Expose ML Services with ngrok
```bash
# In a new terminal
ngrok http 8000
```
Copy the ngrok URL and update `NGROK_QA` and `NGROK_SUMMARY` in `backend/.env`

### Step 9: Start All Services

#### Terminal 1: Backend
```bash
cd backend
npm run dev
```

#### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

#### Terminal 3: ML Service (if not running)
```bash
cd ml_model
python run_server.py
```

---

## 📖 Usage

### Access URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **ML Service**: http://127.0.0.1:8000
- **Drizzle Studio**: http://localhost:4983 (after running `npm run db:studio`)

### User Roles & Features

#### 👤 Citizen
1. Register/Login as Citizen
2. Upload legal documents for summarization
3. Create new legal cases
4. Search for lawyers by expertise
5. Receive AI-powered case predictions
6. Chat with lawyers in real-time

#### ⚖️ Lawyer
1. Register/Login as Lawyer (requires admin verification)
2. Complete professional profile
3. Browse open cases and submit proposals
4. Communicate with clients via chat
5. Publish legal blogs/articles
6. Manage active cases

#### 👑 Admin
1. Verify lawyer registrations
2. Manage users and content
3. Monitor platform activity
4. Moderate blogs and reviews

---

## 📁 Project Structure

```
justifi-legal-ai/
├── backend/                    # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Auth & validation
│   │   ├── routes/           # API endpoints
│   │   └── db/              # Database schema & models
│   ├── drizzle.config.ts     # Drizzle ORM configuration
│   └── package.json         # Backend dependencies
│
├── frontend/                  # Next.js 14 + TypeScript
│   ├── src/app/             # App router pages
│   ├── components/          # Reusable UI components
│   ├── contexts/            # React contexts (Auth, etc.)
│   ├── lib/                # Utility functions & API clients
│   └── package.json        # Frontend dependencies
│
├── ml_model/                 # AI Summarization service (Python)
│   ├── notebooks/           # Jupyter notebooks
│   │   └── legal_assistant.ipynb
│   ├── run_server.py       # FastAPI server for summarization
│   └── requirements.txt    # Python dependencies
│
├── prediction_module/        # Case outcome prediction service
│   ├── prediction.py        # ML prediction logic
│   └── requirements.txt    # Python dependencies
│
├── legal_venv/              # Python virtual environment (create this)
├── requirements.txt         # Shared Python dependencies
└── README.md               # This file
```

---

## 🔌 API Documentation

Once the backend is running, access the following:

### Base URL: `http://localhost:5000`

### Key Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | User registration | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/documents/summarize` | Summarize legal document | Yes |
| POST | `/api/ai/predict` | Predict case outcome | Yes |
| GET | `/api/lawyers` | Search lawyers | No |
| POST | `/api/cases` | Create legal case | Yes |
| GET | `/api/cases/:id/chat` | Get case messages | Yes |
| POST | `/api/blogs` | Create blog post | Yes (Lawyer/Admin) |

### Testing with Postman
1. Import the collection from `backend/API_Documentation.md`
2. Set base URL to `http://localhost:5000`
3. Use login endpoint to get JWT token
4. Add token to Authorization header: `Bearer <token>`

---

### 👨‍💻 Team Members

- **Mahesh Bhosale** — [github.com/mahesh-bhosale](https://github.com/mahesh-bhosale)
- **Vikas Maurya** — [github.com/vikas-maurya](https://github.com/vikasmaurya9769)
- **Intaza Chaudhary** — [github.com/intaza-chaudhary](https://github.com/Intaza)
- **Mausam Yadav** — [github.com/mausam-yadav](https://github.com/omyadav0410-jpg)
---

## 🔮 Future Scope

### 🚀 Short-term Enhancements
- **Mobile Application** - React Native/iOS/Android apps
- **Advanced AI Models** - Fine-tuned legal-specific LLMs
- **Video Consultations** - Integrated video calling feature
- **Payment Integration** - Secure payment gateway for legal services

### 🌟 Long-term Vision
- **Blockchain Integration** - For document verification and smart contracts
- **Multilingual Expansion** - Support for all Indian regional languages
- **AR/VR Courtroom Simulations** - For legal education and preparation
- **Predictive Analytics Dashboard** - For law firms and courts
- **Global Legal Database** - Integration with international case laws

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

**Important**: This system provides AI-assisted legal information and predictions for **educational purposes only**. It does **NOT** constitute legal advice. Always consult with a qualified legal professional for actual legal matters. The predictions and summaries are generated by AI models and may contain inaccuracies.
