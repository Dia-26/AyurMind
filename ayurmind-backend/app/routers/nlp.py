"""
AyurMind — API Routers
All endpoints for the NLP backend.
Each endpoint runs NLP first, then optionally calls LLM for enrichment.
"""

from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    NERRequest, NERResponse, NEREntity,
    SentimentRequest, SentimentResponse,
    PrakritiRequest, PrakritiResponse,
    SymptomsRequest, SymptomsResponse,
    HerbSearchRequest, HerbSearchResponse,
    RAGRequest, RAGResponse, RAGChunk,
    ChatRequest, ChatResponse,
    FormulaRequest,
    SummarizerRequest,
    HealthResponse,
)
from app.services.nlp_engine import (
    AyurvedicNER, AyurvedicSentimentAnalyzer, ClaimVerifier,
    RAGRetriever, TFIDFEngine, get_tfidf_engine,
    score_prakriti_from_text, classify_symptoms,
)
from app.services.llm_service import (
    rag_chat, llm_prakriti, llm_symptoms, llm_herbs,
    llm_formula, llm_summarize,
)
from app.data.ayurvedic_kb import RAG_CHUNKS

router = APIRouter()

# Singleton NLP objects (initialized once)
_ner = AyurvedicNER()
_sentiment = AyurvedicSentimentAnalyzer()
_claim_verifier = ClaimVerifier()
_rag_retriever = RAGRetriever()


# ──────────────────────────────────────────────────────────────────────────────
# HEALTH CHECK
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """System health and NLP engine status."""
    engine = get_tfidf_engine()
    return HealthResponse(
        status="ok",
        version="2.0.0",
        nlp_engine="pure_python_tfidf_ner_sentiment",
        rag_chunks_loaded=len(RAG_CHUNKS),
        tfidf_vocab_size=len(engine.vocab),
        ner_entity_types=AyurvedicNER.ENTITY_TYPES,
        endpoints=[
            "GET  /health",
            "POST /api/nlp/ner",
            "POST /api/nlp/sentiment",
            "POST /api/nlp/rag",
            "POST /api/nlp/chat",
            "POST /api/nlp/prakriti",
            "POST /api/nlp/symptoms",
            "POST /api/nlp/herbs",
            "POST /api/nlp/formula",
            "POST /api/nlp/summarize",
        ],
    )


# ──────────────────────────────────────────────────────────────────────────────
# NER — Named Entity Recognition
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/api/nlp/ner", tags=["NLP"])
async def named_entity_recognition(req: NERRequest) -> Dict[str, Any]:
    """
    Rule-based NER on Ayurvedic text.
    
    NLP Approach:
    - Dictionary-based longest-match NER (gazetteer)
    - Entity types: HERB, DOSHA, SYMPTOM, TREATMENT, FOOD, CLASSICAL_TEXT
    - Confidence scoring based on match length
    - Dosha balance assessment from entity co-occurrence
    - Optional LLM enrichment for summary and additional insights
    """
    # 1. Rule-based NER
    entities = _ner.extract(req.text)
    entity_summary = _ner.get_entity_summary(entities)
    dosha_balance = _ner.assess_dosha_balance(entities, req.text)
    
    entity_type_counts = {}
    for e in entities:
        entity_type_counts[e["type"]] = entity_type_counts.get(e["type"], 0) + 1

    result = {
        "entities": entities,
        "entity_summary": entity_summary,
        "dosha_balance": dosha_balance,
        "total_entities": len(entities),
        "entity_type_counts": entity_type_counts,
        "nlp_method": "rule_based_dictionary_ner",
    }

    # 2. Optional LLM enrichment
    if req.use_llm:
        try:
            from app.services.llm_service import call_groq_json
            llm_result = await call_groq_json(
                [
                    {
                        "role": "system",
                        "content": (
                            "Ayurvedic NLP system. Enrich this NER analysis. Return ONLY JSON:\n"
                            '{"text_category":"classical|modern|mixed|pseudoscientific",'
                            '"authenticity_score":N,"classical_refs":["r1"],'
                            '"key_concepts":["c1","c2"],'
                            '"summary":"2-3 sentence NLP analysis"}'
                        ),
                    },
                    {
                        "role": "user",
                        "content": (
                            f'Text: "{req.text}"\n'
                            f"NER found: {entity_summary}\n"
                            f"Dosha focus: {dosha_balance['primary_dosha']}"
                        ),
                    },
                ],
                req.api_key,
                max_tokens=500,
            )
            result.update(llm_result)
        except Exception as e:
            result["llm_error"] = str(e)

    return result


# ──────────────────────────────────────────────────────────────────────────────
# SENTIMENT — Multi-mode NLP analysis
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/api/nlp/sentiment", tags=["NLP"])
async def sentiment_analysis(req: SentimentRequest) -> Dict[str, Any]:
    """
    Lexicon-based sentiment analysis with claim verification.
    
    NLP Approach:
    - VADER-style valence lexicon with negation handling and intensifiers
    - Pattern-based pseudoscience detection (regex red-flag patterns)
    - Classical text citation detection
    - Multi-label: sentiment + intent + authenticity
    - LLM enrichment for themes, dosha focus, recommendations
    """
    # 1. Lexicon-based sentiment
    sentiment_result = _sentiment.analyze(req.text)

    result = {**sentiment_result, "mode": req.mode, "nlp_method": "lexicon_vader_style"}

    # 2. Claim verification (always run for claim mode, optionally for others)
    if req.mode == "claim":
        entities = _ner.extract(req.text)
        claim_result = _claim_verifier.verify(req.text, entities)
        result.update(claim_result)

    # 3. LLM enrichment
    try:
        from app.services.llm_service import call_groq_json

        if req.mode == "claim":
            sys_prompt = (
                "Ayurvedic claim verifier. Return ONLY JSON:\n"
                '{"summary":"2-3 sentences","themes":["t1","t2"],'
                '"dosha_focus":["vata|pitta|kapha"],'
                '"credibility":"high|medium|low","credibility_reason":"s",'
                '"recommendation":"s"}'
            )
        else:
            sys_prompt = (
                "Ayurvedic sentiment NLP. Return ONLY JSON:\n"
                '{"themes":["t1","t2","t3"],"dosha_focus":["vata|pitta|kapha"],'
                '"quality":"high|medium|low","authenticity":"authentic|uncertain|questionable",'
                '"credibility":"high|medium|low","credibility_reason":"s",'
                '"recommendation":"s","summary":"2-3 sentences",'
                '"positives":["p1","p2"],"negatives":["n1","n2"]}'
            )

        llm_result = await call_groq_json(
            [
                {"role": "system", "content": sys_prompt},
                {
                    "role": "user",
                    "content": (
                        f'Analyze: "{req.text}"\n'
                        f"NLP sentiment: {sentiment_result['sentiment']} "
                        f"(compound: {sentiment_result['compound']})"
                    ),
                },
            ],
            req.api_key,
            max_tokens=600,
        )
        result.update(llm_result)
    except Exception as e:
        result["llm_error"] = str(e)

    return result


# ──────────────────────────────────────────────────────────────────────────────
# RAG — Retrieval-Augmented Generation
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/api/nlp/rag", response_model=RAGResponse, tags=["NLP"])
async def rag_retrieve(req: RAGRequest) -> RAGResponse:
    """
    Pure TF-IDF RAG retrieval from the Ayurvedic knowledge base.
    
    NLP Approach:
    - TF-IDF vectorization of query and knowledge base
    - Cosine similarity ranking
    - Keyword bonus re-ranking
    - Returns top-k chunks with relevance scores
    """
    chunks = _rag_retriever.retrieve(req.query, top_k=req.top_k)
    context = _rag_retriever.build_context(chunks)

    return RAGResponse(
        chunks=[RAGChunk(**{k: v for k, v in c.items() if k in RAGChunk.model_fields}) for c in chunks],
        query=req.query,
        total_retrieved=len(chunks),
        context_string=context,
    )


# ──────────────────────────────────────────────────────────────────────────────
# CHAT — RAG-augmented conversational AI
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/api/nlp/chat", response_model=ChatResponse, tags=["NLP"])
async def chat(req: ChatRequest) -> ChatResponse:
    """
    RAG-augmented conversational AI.
    
    Pipeline: Query → TF-IDF retrieval → Context injection → Groq LLM → Response
    """
    try:
        result = await rag_chat(
            query=req.query,
            history=[m.model_dump() for m in req.history],
            api_key=req.api_key,
            rag_enabled=req.rag_enabled,
        )
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────────────────────────────────────
# PRAKRITI — Constitution analysis
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/api/nlp/prakriti", tags=["NLP"])
async def prakriti_analysis(req: PrakritiRequest) -> Dict[str, Any]:
    """
    Two-stage Prakriti analysis.
    
    NLP Pipeline:
    Stage 1 — Keyword NLP classifier (pure Python):
      • Tokenize free-text answers
      • Score against Vata/Pitta/Kapha keyword lexicons
      • Compute normalized dosha percentages
    
    Stage 2 — LLM enrichment:
      • Send NLP pre-scores + raw answers to Groq
      • LLM refines and adds clinical interpretation
      • RAG-grounded with Prakriti classical text chunks
    """
    # Stage 1: NLP keyword scoring
    nlp_scores = score_prakriti_from_text(req.answers)

    # Stage 2: LLM enrichment with RAG
    try:
        result = await llm_prakriti(req.answers, nlp_scores, req.api_key)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {e}")


# ──────────────────────────────────────────────────────────────────────────────
# SYMPTOMS — Dosha imbalance classification
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/api/nlp/symptoms", tags=["NLP"])
async def symptoms_analysis(req: SymptomsRequest) -> Dict[str, Any]:
    """
    Two-stage symptom-dosha classification.
    
    NLP Pipeline:
    Stage 1 — Weighted keyword classification (pure Python):
      • Map each symptom to a dosha weight vector
      • Accumulate votes across all symptoms
      • Classify Ama level from symptom overlap
      • Run NER on free-text to extract additional symptoms
    
    Stage 2 — LLM enrichment:
      • Send classification + symptoms to Groq
      • LLM adds herbal recommendations and lifestyle guidance
      • RAG-grounded with relevant symptom/herb chunks
    """
    if not req.selected_symptoms and not req.free_text:
        raise HTTPException(status_code=422, detail="Provide symptoms or free text.")

    # Stage 1: NLP classification
    nlp_classification = classify_symptoms(req.selected_symptoms, req.free_text)

    # Stage 2: LLM
    try:
        result = await llm_symptoms(
            nlp_classification, req.selected_symptoms, req.free_text, req.api_key
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {e}")


# ──────────────────────────────────────────────────────────────────────────────
# HERBS — Semantic search
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/api/nlp/herbs", tags=["NLP"])
async def herb_search(req: HerbSearchRequest) -> Dict[str, Any]:
    """
    TF-IDF herb search + LLM enrichment.
    
    NLP Pipeline:
    1. TF-IDF retrieval of relevant knowledge base chunks
    2. NER on query to identify mentioned herbs directly
    3. LLM generates full herb profiles grounded in retrieved context
    """
    # TF-IDF retrieval (show top hits)
    tfidf_hits = _rag_retriever.retrieve(req.query, top_k=3)

    # NER on query
    query_entities = _ner.extract(req.query)
    mentioned_herbs = [e["canonical"] for e in query_entities if e["type"] == "HERB"]

    try:
        result = await llm_herbs(req.query, req.api_key)
        result["tfidf_top_hits"] = [
            {"source": c["source"], "relevance": c["relevance_score"]} for c in tfidf_hits
        ]
        result["query_entities"] = mentioned_herbs
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {e}")


# ──────────────────────────────────────────────────────────────────────────────
# FORMULA — Herbal formula builder
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/api/nlp/formula", tags=["NLP"])
async def formula_builder(req: FormulaRequest) -> Dict[str, Any]:
    """
    Herbal formula generation using Bhaisajya Kalpana principles.
    RAG-grounded with relevant knowledge chunks for the specified goals.
    """
    try:
        return await llm_formula(
            goals=req.goals,
            imbalance=req.imbalance,
            constitution=req.constitution,
            notes=req.notes,
            api_key=req.api_key,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────────────────────────────────────
# SUMMARIZER — Text analysis and extraction
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/api/nlp/summarize", tags=["NLP"])
async def summarize(req: SummarizerRequest) -> Dict[str, Any]:
    """
    Ayurvedic text summarization.
    
    NLP Pipeline:
    1. Extractive summary using TF-IDF sentence scoring
    2. NER to identify key entities
    3. Claim verification for authenticity scoring
    4. LLM for abstractive summary and actionable insights
    """
    # Extractive summary (TF-IDF)
    engine = get_tfidf_engine()
    extractive = engine.extractive_summary(req.text, num_sentences=3)

    # NER on text
    entities = _ner.extract(req.text)
    entity_summary = _ner.get_entity_summary(entities)

    # Claim verification
    claim_result = _claim_verifier.verify(req.text, entities)

    # LLM abstractive summary
    try:
        result = await llm_summarize(req.text, req.api_key)
        result["extractive_summary"] = extractive
        result["nlp_entities"] = entity_summary
        result["nlp_authenticity"] = claim_result["confidence"]
        result["nlp_verdict"] = claim_result["verdict"]
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
