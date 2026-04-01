# 🌿 AyurMind — Ayurvedic Intelligence Platform

<div align="center">

**Ancient Wisdom · Modern Intelligence**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python)](https://python.org)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-F55036?style=flat-square)](https://groq.com)
[![Tests](https://img.shields.io/badge/Tests-39_passing-brightgreen?style=flat-square)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## Overview

AyurMind is a full-stack Ayurvedic NLP platform with:

- **React frontend** — 8 AI-powered NLP modules with a luxury dark UI
- **Python FastAPI backend** — Real NLP algorithms (TF-IDF, NER, sentiment) from scratch
- **RAG system** — 16 classical text chunks retrieved via TF-IDF cosine similarity
- **Fallback mode** — Frontend works standalone by calling Groq directly

---

## Project Structure

```
ayurmind/                    ← React + Vite frontend
├── src/
│   ├── components/          ← Nav, UI components
│   ├── data/                ← Knowledge base, constants
│   ├── hooks/               ← Global app context
│   ├── pages/               ← 10 page components
│   ├── utils/               ← API client, prompts
│   └── styles/              ← Design tokens
└── Dockerfile

ayurmind-backend/            ← FastAPI Python NLP backend
├── app/
│   ├── data/                ← Ayurvedic KB (lexicons + RAG chunks)
│   ├── models/              ← Pydantic schemas
│   ├── routers/             ← API endpoints
│   ├── services/
│   │   ├── nlp_engine.py    ← TF-IDF, NER, Sentiment, RAG (pure Python)
│   │   └── llm_service.py   ← Groq integration + RAG augmentation
│   └── core/                ← Config
├── tests/                   ← 39 unit tests
└── Dockerfile

docker-compose.yml           ← Run everything with one command
```

---

## Quick Start

### Option A — Docker (Recommended, runs everything)

```bash
git clone https://github.com/YOUR_USERNAME/ayurmind.git
cd ayurmind

docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option B — Manual

```bash
# Terminal 1: Backend
cd ayurmind-backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd ayurmind
cp .env.example .env          # sets VITE_API_BASE_URL=http://localhost:8000
npm install
npm run dev
```

Frontend: http://localhost:5173

### Option C — Frontend only (no backend)

```bash
cd ayurmind
npm install
npm run dev
# Don't set VITE_API_BASE_URL — app will call Groq directly from browser
```

---

## API Key Setup

1. Go to [console.groq.com](https://console.groq.com) — sign up free
2. Create an API key (starts with `gsk_...`)
3. Open the app → **Settings** → paste key → **Save**

---

## NLP Modules

| Module | Frontend Route | Backend Endpoint | NLP Algorithm |
|--------|---------------|-----------------|---------------|
| Chat | `/chat` | `POST /api/nlp/chat` | TF-IDF RAG → LLM |
| Prakriti | `/prakriti` | `POST /api/nlp/prakriti` | Keyword classifier → LLM |
| Symptoms | `/symptoms` | `POST /api/nlp/symptoms` | Weighted multi-label → LLM |
| NER | `/ner` | `POST /api/nlp/ner` | Dictionary NER → LLM |
| Herbs | `/herbs` | `POST /api/nlp/herbs` | TF-IDF + NER → LLM |
| Sentiment | `/sentiment` | `POST /api/nlp/sentiment` | VADER lexicon + claim verifier → LLM |
| Formula | `/formula` | `POST /api/nlp/formula` | RAG → LLM |
| Summarizer | `/summarizer` | `POST /api/nlp/summarize` | TF-IDF extractive + NER → LLM |

---

## Running Tests

```bash
cd ayurmind-backend
python3 -m pytest tests/ -v          # with pytest
python3 tests/test_nlp.py            # without pytest
```

**39 unit tests**, all passing. Tests cover:
- Preprocessing (tokenization, normalization, n-grams)
- TF-IDF engine (vectorization, cosine similarity, extractive summarization)
- NER (herb/dosha/symptom/treatment/text extraction, alias recognition)
- Sentiment analyzer (positive/negative/negation/intent)
- Claim verifier (pseudoscience patterns, classical citations, risk scoring)
- RAG retriever (relevance ranking, context building)
- Prakriti scorer (Vata/Pitta/Kapha keyword classification)
- Symptom classifier (dosha mapping, Ama detection)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 18 + Vite 5 |
| Styling | CSS Variables + Custom design system |
| Backend framework | FastAPI 0.111 |
| NLP (core) | Pure Python — TF-IDF, NER, VADER from scratch |
| LLM | Groq API (Llama 3.3 70B) |
| RAG retrieval | TF-IDF cosine similarity (16 classical text chunks) |
| Containerization | Docker + Docker Compose |

---

## License

MIT — see [LICENSE](LICENSE)

> ⚕️ For educational purposes only. Not a substitute for professional medical advice.
