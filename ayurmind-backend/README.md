# 🧠 AyurMind — Python NLP Backend

A **FastAPI** backend implementing real NLP algorithms for Ayurvedic medicine — built from scratch in pure Python with no ML library dependencies for core logic.

---

## NLP Architecture

Every endpoint follows the same two-stage pipeline:

```
User Input
    │
    ▼
┌────────────────────────────────────────┐
│  Stage 1 — Pure Python NLP             │
│                                        │
│  • Tokenization + normalization        │
│  • TF-IDF vectorization                │
│  • Dictionary NER (gazetteer)          │
│  • Lexicon-based sentiment (VADER)     │
│  • Regex pattern matching              │
│  • Weighted keyword classification     │
└────────────────┬───────────────────────┘
                 │  NLP pre-scores + entities
                 ▼
┌────────────────────────────────────────┐
│  Stage 2 — RAG-Augmented LLM          │
│                                        │
│  • TF-IDF retrieves relevant chunks   │
│  • Injects classical text context     │
│  • Groq (Llama 3.3 70B) enriches      │
│  • Returns structured JSON            │
└────────────────────────────────────────┘
```

---

## NLP Modules

| Module | Algorithm | File |
|--------|-----------|------|
| **Tokenizer** | Unicode normalization + regex tokenization | `nlp_engine.py` |
| **TF-IDF Engine** | Term frequency × inverse document frequency, cosine similarity | `nlp_engine.py` |
| **RAG Retriever** | TF-IDF retrieval + keyword re-ranking | `nlp_engine.py` |
| **Ayurvedic NER** | Dictionary/gazetteer NER with longest-match greedy | `nlp_engine.py` |
| **Sentiment Analyzer** | VADER-style valence lexicon + negation + intensifiers | `nlp_engine.py` |
| **Claim Verifier** | Regex red-flag patterns + classical citation detection | `nlp_engine.py` |
| **Prakriti Classifier** | Weighted keyword scoring against dosha lexicons | `nlp_engine.py` |
| **Symptom Classifier** | Multi-label weighted keyword-dosha mapping | `nlp_engine.py` |
| **Extractive Summarizer** | TF-IDF sentence scoring + positional weighting | `nlp_engine.py` |

---

## File Structure

```
ayurmind-backend/
├── app/
│   ├── main.py                   # FastAPI app entry point
│   ├── core/
│   │   └── config.py             # Settings from env vars
│   ├── data/
│   │   └── ayurvedic_kb.py       # Knowledge base: herb/dosha/symptom lexicons + RAG chunks
│   ├── models/
│   │   └── schemas.py            # Pydantic request/response models
│   ├── routers/
│   │   └── nlp.py                # All API route handlers
│   └── services/
│       ├── nlp_engine.py         # All NLP algorithms (pure Python)
│       └── llm_service.py        # Groq API integration + RAG augmentation
├── tests/
│   └── test_nlp.py               # 39 unit tests for all NLP modules
├── requirements.txt
├── .env.example
└── README.md
```

---

## API Endpoints

| Method | Endpoint | NLP Used |
|--------|----------|----------|
| `GET` | `/health` | — |
| `POST` | `/api/nlp/ner` | Dictionary NER → LLM enrichment |
| `POST` | `/api/nlp/sentiment` | VADER lexicon + claim verifier → LLM |
| `POST` | `/api/nlp/rag` | TF-IDF retrieval only |
| `POST` | `/api/nlp/chat` | TF-IDF RAG → LLM |
| `POST` | `/api/nlp/prakriti` | Keyword classifier → LLM |
| `POST` | `/api/nlp/symptoms` | Weighted classification → LLM |
| `POST` | `/api/nlp/herbs` | TF-IDF retrieval → LLM |
| `POST` | `/api/nlp/formula` | TF-IDF RAG → LLM |
| `POST` | `/api/nlp/summarize` | Extractive TF-IDF + NER → LLM |

---

## NLP Algorithm Details

### TF-IDF Engine (`TFIDFEngine`)

```python
# Term Frequency (normalized)
TF(t, d) = count(t in d) / len(d)

# Inverse Document Frequency (smoothed)
IDF(t) = log((N + 1) / (df(t) + 1)) + 1

# TF-IDF weight
TFIDF(t, d) = TF(t, d) × IDF(t)

# Cosine similarity for ranking
sim(q, d) = (q · d) / (||q|| × ||d||)
```

Also implements:
- **Bigram expansion** for better phrase matching
- **Keyword bonus re-ranking** for domain-specific boost
- **Extractive summarization** via sentence-level TF-IDF scoring with positional bias

### Ayurvedic NER (`AyurvedicNER`)

Rule-based dictionary NER using:
- **271-phrase gazetteer** covering herbs, doshas, symptoms, treatments, foods, classical texts
- **Longest-match greedy** algorithm (tries longest phrase first)
- **Multi-lingual aliases**: Sanskrit, Latin binomials, common names, transliterations
- **Confidence scoring**: longer matches = higher confidence

Entity types: `HERB | DOSHA | SYMPTOM | TREATMENT | FOOD | CLASSICAL_TEXT`

### Sentiment Analyzer (`AyurvedicSentimentAnalyzer`)

VADER-style approach adapted for Ayurvedic domain:
- **Valence lexicon**: positive/negative words with float scores
- **Negation handling**: 3-token window after negation words
- **Intensifier detection**: `very(×1.3)`, `extremely(×1.5)`, `absolutely(×1.4)`
- **Bigram support**: multi-word negative phrases
- **Intent classification**: personal/promotional/advisory/educational/testimonial

### Claim Verifier (`ClaimVerifier`)

Pattern-based pseudoscience detection:
- **Red-flag regex patterns**: "miracle cure", "doctors don't want", "100% guaranteed"
- **Authentic signal patterns**: classical text citations, proper disclaimers
- **Risk stratification**: high/medium/low based on specific medical claims
- **Evidence grading**: A (classical + no red flags) → D (no basis)

---

## Installation & Running

```bash
# Clone and navigate to backend
cd ayurmind-backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env — set GROQ_API_KEY if you want server-side key

# Run the server
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

---

## Running Tests

```bash
# With pytest (after pip install pytest)
pytest tests/ -v

# Without pytest (pure Python)
python3 -m unittest tests.test_nlp -v

# Or run directly
python3 tests/test_nlp.py
```

**39 unit tests** covering all NLP modules — no API key or network required.

---

## Connecting to the React Frontend

In the React frontend (`src/utils/api.js`), change API calls to hit the backend:

```js
// Instead of calling Groq directly:
const res = await fetch('http://localhost:8000/api/nlp/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, history, api_key: apiKey }),
});
```

Set `VITE_API_BASE_URL=http://localhost:8000` in the frontend `.env`.

---

## Expanding the Knowledge Base

Edit `app/data/ayurvedic_kb.py`:

```python
# Add a herb to HERB_LEXICON
"guduchi": {
    "sanskrit": "Guduchi", "latin": "Tinospora cordifolia",
    "balances": ["vata", "pitta", "kapha"], "aggravates": [],
    "aliases": ["giloy", "tinospora", "amruta"],
    ...
}

# Add a RAG knowledge chunk
{
    "id": "charaka-xyz-01",
    "source": "Charaka Samhita, Chikitsasthana 1.4",
    "category": "treatment",
    "keywords": ["keyword1", "keyword2"],
    "text": "Classical text excerpt...",
}
```

---

## Production Upgrade Path

For production-grade NLP, replace the pure-Python implementations with:

| Current | Production Upgrade |
|---------|-------------------|
| Dictionary NER | Fine-tuned `spaCy` NER on annotated Ayurvedic corpus |
| Keyword TF-IDF | `sentence-transformers` (semantic embeddings) |
| VADER sentiment | Fine-tuned `BERT` classifier on Ayurvedic reviews |
| Prakriti keyword scoring | Supervised ML on labeled Prakriti assessment data |
| Extractive summary | `transformers` pipeline (`facebook/bart-large-cnn`) |

> ⚕️ For educational purposes only. Not a substitute for medical advice.
