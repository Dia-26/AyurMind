"""
AyurMind — LLM Service
Groq API integration. Every call is RAG-augmented using the NLP retrieval layer.
The pipeline is: Query → NLP Pre-processing → RAG Retrieval → Prompt Augmentation → LLM → Response
"""

import json
import re
from typing import Any, Dict, List, Optional

# When groq package is available:
# from groq import Groq
# For now we use httpx for direct REST calls
try:
    import httpx
    HAS_HTTPX = True
except ImportError:
    HAS_HTTPX = False

from app.services.nlp_engine import RAGRetriever
from app.core.config import settings

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.3-70b-versatile"

_rag_retriever: Optional[RAGRetriever] = None


def get_rag_retriever() -> RAGRetriever:
    global _rag_retriever
    if _rag_retriever is None:
        _rag_retriever = RAGRetriever()
    return _rag_retriever


async def call_groq(
    messages: List[Dict],
    api_key: str,
    max_tokens: int = 900,
    temperature: float = 0.7,
) -> str:
    """Raw Groq API call via httpx."""
    if not HAS_HTTPX:
        raise RuntimeError("httpx not installed. Run: pip install httpx")

    effective_api_key = (api_key or "").strip() or (settings.groq_api_key or "").strip()
    if not effective_api_key:
        raise ValueError("No Groq API key found. Add one in Settings or set GROQ_API_KEY for backend.")

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            GROQ_URL,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {effective_api_key}",
            },
            json={
                "model": MODEL,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
            },
        )
        if response.status_code >= 400:
            message = f"Groq API error: HTTP {response.status_code}"
            try:
                err = response.json()
                message = err.get("error", {}).get("message") or message
            except Exception:
                pass

            if response.status_code == 401:
                raise ValueError("Groq API key rejected (401). Please update your key in Settings.")
            if response.status_code == 429:
                raise ValueError("Groq API rate limit reached (429). Please retry shortly.")

            raise ValueError(message)
        data = response.json()
        return data["choices"][0]["message"]["content"]


async def call_groq_json(
    messages: List[Dict],
    api_key: str,
    max_tokens: int = 900,
) -> Dict:
    """Groq call that parses JSON from the response."""
    raw = await call_groq(messages, api_key, max_tokens)
    # Strip markdown code fences
    raw = re.sub(r"```json\s*", "", raw, flags=re.IGNORECASE)
    raw = re.sub(r"```\s*", "", raw)
    raw = raw.strip()
    match = re.search(r"\{[\s\S]*\}", raw)
    if not match:
        raise ValueError(f"No JSON found in LLM response: {raw[:200]}")
    candidate = match.group(0)

    try:
        return json.loads(candidate)
    except json.JSONDecodeError:
        # Ask the model to rewrite malformed JSON as strict JSON only.
        repair_prompt = (
            "You are a JSON repair tool. Convert the following content into valid RFC8259 JSON. "
            "Return ONLY the repaired JSON object with double quotes, escaped newlines, and no trailing commas."
        )
        repaired_raw = await call_groq(
            [
                {"role": "system", "content": repair_prompt},
                {"role": "user", "content": candidate[:12000]},
            ],
            api_key,
            max_tokens=min(max_tokens, 1100),
            temperature=0,
        )
        repaired_raw = re.sub(r"```json\s*", "", repaired_raw, flags=re.IGNORECASE)
        repaired_raw = re.sub(r"```\s*", "", repaired_raw).strip()
        repaired_match = re.search(r"\{[\s\S]*\}", repaired_raw)
        if not repaired_match:
            raise ValueError("Failed to repair malformed LLM JSON output.")
        return json.loads(repaired_match.group(0))


# ──────────────────────────────────────────────────────────────────────────────
# RAG-AUGMENTED LLM CALLS
# ──────────────────────────────────────────────────────────────────────────────

async def rag_chat(
    query: str,
    history: List[Dict],
    api_key: str,
    rag_enabled: bool = True,
) -> Dict[str, Any]:
    """
    RAG-augmented chat.
    Pipeline: query → TF-IDF retrieval → context injection → LLM response
    """
    retriever = get_rag_retriever()
    rag_chunks = retriever.retrieve(query, top_k=3) if rag_enabled else []
    rag_context = retriever.build_context(rag_chunks) if rag_chunks else ""

    system_prompt = (
        "You are AyurMind, an expert Ayurvedic AI assistant with deep knowledge of "
        "Charaka Samhita, Sushruta Samhita, and Ashtanga Hridayam. "
        "Give authentic, evidence-based responses grounded in classical Ayurveda. "
        "Reference classical sources when available. Be concise (under 250 words). "
        "Use **bold** for key Ayurvedic terms. Add a brief safety disclaimer for medical concerns."
        + (f"\n\n{rag_context}" if rag_context else "")
    )

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history[-10:])  # keep last 10 turns for context
    messages.append({"role": "user", "content": query})

    response = await call_groq(messages, api_key, max_tokens=700, temperature=0.6)

    return {
        "response": response,
        "rag_chunks": [{"source": c["source"], "relevance": c["relevance_score"]} for c in rag_chunks],
        "rag_enabled": rag_enabled,
    }


async def llm_prakriti(
    answers: List[str],
    nlp_scores: Dict,
    api_key: str,
) -> Dict[str, Any]:
    """
    Prakriti analysis: NLP pre-scores → LLM enriches with clinical insights.
    """
    retriever = get_rag_retriever()
    chunks = retriever.retrieve("prakriti constitution vata pitta kapha", top_k=2)
    rag_ctx = retriever.build_context(chunks)

    system_prompt = (
        "You are an expert Ayurvedic Prakriti analyst using Ashta-vidha Pariksha methodology. "
        "The NLP engine has pre-scored the responses. Use these scores as a strong prior "
        "and enrich with clinical Ayurvedic insights. Return ONLY valid JSON:\n"
        '{"vata":N,"pitta":N,"kapha":N,"primary":"vata|pitta|kapha","secondary":"vata|pitta|kapha|none",'
        '"vikruti_hint":"s","summary":"2-3 sentences","characteristics":["t1","t2","t3","t4","t5"],'
        '"diet_tips":["d1","d2","d3","d4"],"lifestyle_tips":["l1","l2","l3","l4"],'
        '"herbs":["h1","h2","h3"],"avoid":["a1","a2","a3"],"season_guidance":"s"}\n'
        "Numbers must sum to 100. Be specific to this individual."
        + f"\n\n{rag_ctx}"
    )

    combined = "\n".join(f"Q{i+1}: {a or '(skipped)'}" for i, a in enumerate(answers))
    user_msg = (
        f"Patient answers:\n{combined}\n\n"
        f"NLP pre-scores: Vata={nlp_scores['vata']}%, Pitta={nlp_scores['pitta']}%, "
        f"Kapha={nlp_scores['kapha']}% (primary: {nlp_scores['primary']})"
    )

    result = await call_groq_json(
        [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_msg}],
        api_key, max_tokens=900
    )
    result["nlp_pre_scores"] = nlp_scores
    result["rag_sources"] = [c["source"] for c in chunks]
    return result


async def llm_symptoms(
    nlp_classification: Dict,
    selected_symptoms: List[str],
    free_text: str,
    api_key: str,
) -> Dict[str, Any]:
    """
    Symptom analysis: NLP classifier → LLM for herbal recommendations.
    """
    retriever = get_rag_retriever()
    symptom_query = " ".join(selected_symptoms) + " " + free_text
    chunks = retriever.retrieve(symptom_query, top_k=3)
    rag_ctx = retriever.build_context(chunks)

    system_prompt = (
        "You are an Ayurvedic diagnostic AI using Nidana Panchaka methodology. "
        "The NLP engine has classified the symptom-dosha pattern. Use this classification "
        "and provide herbal recommendations and lifestyle guidance. Return ONLY JSON:\n"
        '{"primary_imbalance":"vata|pitta|kapha|tridoshic","secondary_imbalance":"vata|pitta|kapha|none",'
        '"vata_score":N,"pitta_score":N,"kapha_score":N,"ama_level":"low|moderate|high",'
        '"chief_concern":"1 sentence","root_cause":"classical perspective",'
        '"immediate_remedies":["r1","r2","r3"],'
        '"herbal_support":[{"herb":"name","purpose":"why","dose":"how"}],'
        '"diet_changes":["d1","d2","d3"],"lifestyle_changes":["l1","l2","l3"],'
        '"warning_signs":["w1"],"disclaimer":"safety note"}'
        + f"\n\n{rag_ctx}"
    )

    user_msg = (
        f"Symptoms: {', '.join(selected_symptoms)}\n"
        f"Free text: {free_text}\n\n"
        f"NLP classification: primary={nlp_classification['primary_imbalance']}, "
        f"Vata={nlp_classification['vata_score']}%, "
        f"Pitta={nlp_classification['pitta_score']}%, "
        f"Kapha={nlp_classification['kapha_score']}%, "
        f"Ama={nlp_classification['ama_level']}"
    )

    result = await call_groq_json(
        [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_msg}],
        api_key, max_tokens=1000
    )
    result["nlp_classification"] = nlp_classification
    result["rag_sources"] = [c["source"] for c in chunks]
    return result


async def llm_herbs(query: str, api_key: str) -> Dict[str, Any]:
    """Herb semantic search with RAG grounding."""
    retriever = get_rag_retriever()
    chunks = retriever.retrieve(query, top_k=3)
    rag_ctx = retriever.build_context(chunks)

    system_prompt = (
        "You are an Ayurvedic pharmacognosy expert. Return ONLY JSON:\n"
        '{"herbs":[{"name":"s","sanskrit":"s","latin":"s","rasa":["t"],"virya":"hot|cold",'
        '"vipaka":"s","balances":["vata|pitta|kapha"],"aggravates":[],"karma":["a1"],'
        '"primary_use":"s","classical_indication":"s","dosage":"s","anupana":"s",'
        '"cautions":"s","availability":"common|moderate|rare"}],"search_summary":"s"}'
        + f"\n\n{rag_ctx}"
    )

    result = await call_groq_json(
        [{"role": "system", "content": system_prompt},
         {"role": "user", "content": f"Find Ayurvedic herbs for: {query}"}],
        api_key, max_tokens=1100
    )
    result["rag_sources"] = [c["source"] for c in chunks]
    return result


async def llm_formula(
    goals: List[str],
    imbalance: str,
    constitution: str,
    notes: str,
    api_key: str,
) -> Dict[str, Any]:
    """Herbal formula builder."""
    retriever = get_rag_retriever()
    chunks = retriever.retrieve(" ".join(goals), top_k=2)
    rag_ctx = retriever.build_context(chunks)

    system_prompt = (
        "You are an Ayurvedic formula expert (Bhaisajya Kalpana). Return ONLY JSON:\n"
        '{"formula_name":"s","ingredients":[{"herb":"s","sanskrit":"s","ratio":N,'
        '"role":"chief|adjuvant|vehicle|corrective","reason":"s"}],'
        '"preparation":"step-by-step","dosage":"s","anupana":"s",'
        '"indications":["i1","i2"],"contraindications":["c1"],'
        '"classical_basis":"s","expected_effects":"s","safety_note":"s"}'
        + f"\n\n{rag_ctx}"
    )

    user_msg = (
        f"Goals: {', '.join(goals)}\n"
        f"Dosha imbalance: {imbalance or 'not specified'}\n"
        f"Constitution: {constitution or 'not specified'}\n"
        f"Notes: {notes or 'none'}"
    )

    result = await call_groq_json(
        [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_msg}],
        api_key, max_tokens=1000
    )
    result["rag_sources"] = [c["source"] for c in chunks]
    return result


async def llm_summarize(text: str, api_key: str) -> Dict[str, Any]:
    """Text summarization with NLP pre-processing."""
    retriever = get_rag_retriever()
    chunks = retriever.retrieve(text[:200], top_k=2)
    rag_ctx = retriever.build_context(chunks)

    system_prompt = (
        "You are an Ayurvedic scholar. Return ONLY JSON:\n"
        '{"title":"s","main_concepts":["c1","c2","c3"],'
        '"dosha_context":{"vata":"s","pitta":"s","kapha":"s"},'
        '"classical_refs":["r1"],"key_herbs":["h1"],"key_treatments":["t1"],'
        '"text_type":"classical_commentary|modern_synthesis|research|popular|prescriptive",'
        '"authenticity_score":N,"summary":"3-4 sentences",'
        '"actionable_insights":["i1","i2","i3"],"related_topics":["t1","t2"]}'
        + f"\n\n{rag_ctx}"
    )

    result = await call_groq_json(
        [{"role": "system", "content": system_prompt},
         {"role": "user", "content": f"Analyze and summarize:\n\n{text}"}],
        api_key, max_tokens=900
    )
    result["rag_sources"] = [c["source"] for c in chunks]
    return result
