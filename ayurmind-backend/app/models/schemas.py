"""
AyurMind — Pydantic Models
Request and response schemas for all API endpoints.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


# ──────────────────────────────────────────────────────────────────────────────
# SHARED
# ──────────────────────────────────────────────────────────────────────────────

class APIKeyMixin(BaseModel):
    api_key: str = Field(..., min_length=10, description="Groq API key")


class RAGChunkRef(BaseModel):
    source: str
    relevance: float


# ──────────────────────────────────────────────────────────────────────────────
# NER
# ──────────────────────────────────────────────────────────────────────────────

class NERRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=5000)
    api_key: str = Field(..., min_length=10)
    use_llm: bool = Field(default=True, description="Also run LLM for richer output")


class NEREntity(BaseModel):
    text: str
    canonical: str
    type: str  # HERB, DOSHA, SYMPTOM, TREATMENT, FOOD, CLASSICAL_TEXT
    confidence: str  # high, medium, low
    char_start: int
    char_end: int
    meta: Dict[str, Any] = {}


class NERResponse(BaseModel):
    entities: List[NEREntity]
    entity_summary: Dict[str, List[str]]
    dosha_balance: Dict[str, Any]
    total_entities: int
    entity_type_counts: Dict[str, int]
    # LLM-enriched fields (if use_llm=True)
    text_category: Optional[str] = None
    authenticity_score: Optional[int] = None
    classical_refs: Optional[List[str]] = None
    key_concepts: Optional[List[str]] = None
    summary: Optional[str] = None
    nlp_method: str = "rule_based_dictionary_ner"


# ──────────────────────────────────────────────────────────────────────────────
# SENTIMENT
# ──────────────────────────────────────────────────────────────────────────────

class SentimentRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=5000)
    mode: str = Field(default="review", pattern="^(review|claim|text)$")
    api_key: str = Field(..., min_length=10)


class SentimentResponse(BaseModel):
    # Lexicon-based NLP scores
    sentiment: str
    compound: float
    score: int
    pos: int
    neg: int
    neu: int
    intent: str
    # Claim verifier (mode=claim)
    verdict: Optional[str] = None
    confidence: Optional[int] = None
    ayurvedic_basis: Optional[str] = None
    classical_refs_found: Optional[List[str]] = None
    pseudo_red_flags: Optional[List[str]] = None
    authentic_signals: Optional[List[str]] = None
    risk: Optional[str] = None
    evidence_grade: Optional[str] = None
    # LLM enrichment
    themes: Optional[List[str]] = None
    dosha_focus: Optional[List[str]] = None
    credibility: Optional[str] = None
    credibility_reason: Optional[str] = None
    recommendation: Optional[str] = None
    summary: Optional[str] = None
    nlp_method: str = "lexicon_vader_style"


# ──────────────────────────────────────────────────────────────────────────────
# PRAKRITI
# ──────────────────────────────────────────────────────────────────────────────

class PrakritiRequest(BaseModel):
    answers: List[str] = Field(..., min_length=1, max_length=5)
    api_key: str = Field(..., min_length=10)

    @field_validator("answers")
    @classmethod
    def at_least_two_answers(cls, v):
        filled = [a for a in v if len(a.strip()) > 8]
        if len(filled) < 2:
            raise ValueError("Please provide at least 2 detailed answers.")
        return v


class PrakritiResponse(BaseModel):
    vata: int
    pitta: int
    kapha: int
    primary: str
    secondary: str
    vikruti_hint: Optional[str] = None
    summary: str
    characteristics: List[str]
    diet_tips: List[str]
    lifestyle_tips: List[str]
    herbs: List[str]
    avoid: List[str]
    season_guidance: Optional[str] = None
    nlp_pre_scores: Dict[str, Any]
    rag_sources: List[str] = []
    nlp_method: str = "keyword_nlp_then_llm"


# ──────────────────────────────────────────────────────────────────────────────
# SYMPTOMS
# ──────────────────────────────────────────────────────────────────────────────

class SymptomsRequest(BaseModel):
    selected_symptoms: List[str] = Field(default_factory=list)
    free_text: str = Field(default="")
    api_key: str = Field(..., min_length=10)

    @field_validator("selected_symptoms", "free_text")
    @classmethod
    def must_have_input(cls, v, info):
        return v


class HerbalSupport(BaseModel):
    herb: str
    purpose: str
    dose: str


class SymptomsResponse(BaseModel):
    primary_imbalance: str
    secondary_imbalance: str
    vata_score: int
    pitta_score: int
    kapha_score: int
    ama_level: str
    chief_concern: str
    root_cause: str
    immediate_remedies: List[str]
    herbal_support: List[HerbalSupport]
    diet_changes: List[str]
    lifestyle_changes: List[str]
    warning_signs: List[str]
    disclaimer: str
    nlp_classification: Dict[str, Any]
    rag_sources: List[str] = []
    nlp_method: str = "weighted_symptom_classification_then_llm"


# ──────────────────────────────────────────────────────────────────────────────
# HERBS
# ──────────────────────────────────────────────────────────────────────────────

class HerbSearchRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=300)
    api_key: str = Field(..., min_length=10)


class HerbResult(BaseModel):
    name: str
    sanskrit: str
    latin: str
    rasa: List[str]
    virya: str
    vipaka: str
    balances: List[str]
    aggravates: List[str]
    karma: List[str]
    primary_use: str
    classical_indication: str
    dosage: str
    anupana: str
    cautions: str
    availability: str


class HerbSearchResponse(BaseModel):
    herbs: List[HerbResult]
    search_summary: str
    rag_sources: List[str] = []
    tfidf_top_hits: List[Dict[str, Any]] = []


# ──────────────────────────────────────────────────────────────────────────────
# RAG
# ──────────────────────────────────────────────────────────────────────────────

class RAGRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=500)
    top_k: int = Field(default=4, ge=1, le=10)


class RAGChunk(BaseModel):
    id: str
    source: str
    category: str
    text: str
    relevance_score: float
    tfidf_score: float
    keyword_hits: int


class RAGResponse(BaseModel):
    chunks: List[RAGChunk]
    query: str
    total_retrieved: int
    context_string: str


# ──────────────────────────────────────────────────────────────────────────────
# CHAT
# ──────────────────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    history: List[ChatMessage] = Field(default_factory=list)
    api_key: str = Field(..., min_length=10)
    rag_enabled: bool = True


class ChatResponse(BaseModel):
    response: str
    rag_chunks: List[Dict[str, Any]] = []
    rag_enabled: bool


# ──────────────────────────────────────────────────────────────────────────────
# FORMULA
# ──────────────────────────────────────────────────────────────────────────────

class FormulaRequest(BaseModel):
    goals: List[str] = Field(..., min_length=1, max_length=4)
    imbalance: str = ""
    constitution: str = ""
    notes: str = ""
    api_key: str = Field(default="", description="Optional; backend GROQ_API_KEY fallback is used when empty")


# ──────────────────────────────────────────────────────────────────────────────
# SUMMARIZER
# ──────────────────────────────────────────────────────────────────────────────

class SummarizerRequest(BaseModel):
    text: str = Field(..., min_length=50, max_length=10000)
    api_key: str = Field(..., min_length=10)


# ──────────────────────────────────────────────────────────────────────────────
# HEALTH CHECK
# ──────────────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    version: str
    nlp_engine: str
    rag_chunks_loaded: int
    tfidf_vocab_size: int
    ner_entity_types: List[str]
    endpoints: List[str]
