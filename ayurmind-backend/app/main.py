"""
AyurMind Backend — FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers.nlp import router
from app.core.config import settings

app = FastAPI(
    title="AyurMind NLP API",
    description=(
        "RAG-powered Ayurvedic NLP backend. "
        "Implements TF-IDF retrieval, rule-based NER, "
        "lexicon-based sentiment analysis, and LLM enrichment."
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/", tags=["System"])
async def root():
    return {
        "name": "AyurMind NLP API",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/health",
        "nlp_modules": [
            "NER (Named Entity Recognition)",
            "Sentiment Analysis (Lexicon-based)",
            "RAG Retrieval (TF-IDF)",
            "Prakriti Classifier (Keyword NLP + LLM)",
            "Symptom Classifier (Weighted NLP + LLM)",
            "Herb Semantic Search (TF-IDF + LLM)",
            "Formula Builder (RAG + LLM)",
            "Text Summarizer (Extractive + Abstractive)",
        ],
    }
