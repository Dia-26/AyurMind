"""
AyurMind — Core NLP Engine
Pure Python NLP algorithms — no external ML library dependencies.
Implements TF-IDF, NER, semantic similarity, sentiment scoring,
and RAG retrieval from scratch.
"""

import re
import math
import json
import string
import unicodedata
from collections import Counter, defaultdict
from typing import List, Dict, Tuple, Optional, Any

from app.data.ayurvedic_kb import (
    HERB_LEXICON, DOSHA_LEXICON, SYMPTOM_LEXICON,
    TREATMENT_LEXICON, FOOD_LEXICON, CLASSICAL_TEXT_LEXICON,
    RAG_CHUNKS, AYURVEDIC_STOPWORDS, PSEUDOSCIENCE_PATTERNS, AUTHENTIC_SIGNALS,
)


# ──────────────────────────────────────────────────────────────────────────────
# TEXT PREPROCESSING
# ──────────────────────────────────────────────────────────────────────────────

def normalize_text(text: str) -> str:
    """Normalize unicode, lowercase, strip extra whitespace."""
    text = unicodedata.normalize("NFKD", text)
    text = text.lower().strip()
    text = re.sub(r"\s+", " ", text)
    return text


def tokenize(text: str, remove_stopwords: bool = True) -> List[str]:
    """
    Tokenize text into words.
    Handles Ayurvedic compound words (e.g., 'Tridosha', 'Panchakarma').
    """
    text = normalize_text(text)
    # Split on whitespace and punctuation (keep hyphens inside words)
    tokens = re.findall(r"[a-z][a-z\-']*[a-z]|[a-z]", text)
    if remove_stopwords:
        tokens = [t for t in tokens if t not in AYURVEDIC_STOPWORDS and len(t) > 1]
    return tokens


def get_ngrams(tokens: List[str], n: int) -> List[str]:
    """Generate n-grams from token list."""
    return [" ".join(tokens[i:i+n]) for i in range(len(tokens) - n + 1)]


def sentence_split(text: str) -> List[str]:
    """Split text into sentences."""
    sentences = re.split(r"(?<=[.!?])\s+(?=[A-Z])", text.strip())
    return [s.strip() for s in sentences if s.strip()]


# ──────────────────────────────────────────────────────────────────────────────
# TF-IDF ENGINE
# ──────────────────────────────────────────────────────────────────────────────

class TFIDFEngine:
    """
    Term Frequency — Inverse Document Frequency engine.
    Built from scratch on the Ayurvedic RAG knowledge base corpus.
    Used for:
    1. RAG chunk retrieval (finding relevant knowledge)
    2. Herb semantic search (ranking herb relevance to query)
    3. Text summarization (extracting key sentences)
    """

    def __init__(self):
        self.corpus: List[Dict] = []
        self.vocab: Dict[str, int] = {}           # term -> index
        self.idf: Dict[str, float] = {}           # term -> IDF score
        self.doc_tf: List[Dict[str, float]] = []  # per-doc TF
        self._built = False

    def fit(self, documents: List[Dict], text_field: str = "text"):
        """Build TF-IDF index from list of document dicts."""
        self.corpus = documents
        all_tokens_per_doc = []

        for doc in documents:
            raw = doc.get(text_field, "") + " " + " ".join(doc.get("keywords", []))
            tokens = tokenize(raw)
            all_tokens_per_doc.append(tokens)

            # TF (normalized term frequency)
            freq = Counter(tokens)
            total = max(len(tokens), 1)
            tf = {t: count / total for t, count in freq.items()}
            self.doc_tf.append(tf)

            # Build vocabulary
            for t in freq:
                if t not in self.vocab:
                    self.vocab[t] = len(self.vocab)

        # IDF = log((N + 1) / (df + 1)) + 1  (smoothed)
        N = len(documents)
        df: Dict[str, int] = defaultdict(int)
        for tokens in all_tokens_per_doc:
            for t in set(tokens):
                df[t] += 1

        self.idf = {t: math.log((N + 1) / (df[t] + 1)) + 1.0 for t in self.vocab}
        self._built = True

    def _tfidf_vector(self, tokens: List[str]) -> Dict[str, float]:
        """Compute TF-IDF vector for a list of tokens."""
        freq = Counter(tokens)
        total = max(len(tokens), 1)
        return {
            t: (count / total) * self.idf.get(t, 0.5)
            for t, count in freq.items()
            if t in self.vocab
        }

    def cosine_similarity(self, vec_a: Dict[str, float], vec_b: Dict[str, float]) -> float:
        """Cosine similarity between two TF-IDF vectors."""
        common = set(vec_a) & set(vec_b)
        if not common:
            return 0.0
        dot = sum(vec_a[t] * vec_b[t] for t in common)
        norm_a = math.sqrt(sum(v ** 2 for v in vec_a.values()))
        norm_b = math.sqrt(sum(v ** 2 for v in vec_b.values()))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot / (norm_a * norm_b)

    def query(self, query_text: str, top_k: int = 5) -> List[Tuple[Dict, float]]:
        """
        Retrieve top-k most relevant documents for a query.
        Returns list of (document, similarity_score) tuples.
        """
        if not self._built:
            raise RuntimeError("TFIDFEngine must be fit() before querying.")

        query_tokens = tokenize(query_text)
        # Also add bigrams for better phrase matching
        query_tokens += get_ngrams(query_tokens, 2)
        query_vec = self._tfidf_vector(query_tokens)

        scores = []
        for i, (doc, doc_tf) in enumerate(zip(self.corpus, self.doc_tf)):
            # Build TF-IDF vector for document using pre-computed TF and global IDF
            doc_vec = {t: tf * self.idf.get(t, 0.5) for t, tf in doc_tf.items()}
            sim = self.cosine_similarity(query_vec, doc_vec)

            # Bonus: keyword direct hit
            kw_bonus = sum(
                0.15 for kw in doc.get("keywords", [])
                if kw.lower() in query_text.lower()
            )
            scores.append((doc, min(1.0, sim + kw_bonus)))

        scores.sort(key=lambda x: x[1], reverse=True)
        return [(doc, score) for doc, score in scores[:top_k] if score > 0.01]

    def extractive_summary(self, text: str, num_sentences: int = 3) -> str:
        """
        Extractive summarization using TF-IDF sentence scoring.
        Scores each sentence by sum of TF-IDF weights of its terms.
        """
        sentences = sentence_split(text)
        if len(sentences) <= num_sentences:
            return text

        # Build per-sentence TF-IDF
        all_tokens = tokenize(text)
        freq = Counter(all_tokens)
        total = max(len(all_tokens), 1)
        global_tf = {t: count / total for t, count in freq.items()}

        sentence_scores = []
        for i, sent in enumerate(sentences):
            sent_tokens = tokenize(sent)
            score = sum(global_tf.get(t, 0) * self.idf.get(t, 0.5) for t in sent_tokens)
            # Positional bias: first and last sentences tend to be more important
            position_weight = 1.3 if i == 0 else (1.1 if i == len(sentences)-1 else 1.0)
            sentence_scores.append((i, score * position_weight, sent))

        sentence_scores.sort(key=lambda x: x[1], reverse=True)
        top = sorted(sentence_scores[:num_sentences], key=lambda x: x[0])
        return " ".join(s for _, _, s in top)


# Singleton TFIDF engine pre-built on the knowledge base
_tfidf_engine: Optional[TFIDFEngine] = None

def get_tfidf_engine() -> TFIDFEngine:
    """Get or build the singleton TF-IDF engine."""
    global _tfidf_engine
    if _tfidf_engine is None:
        _tfidf_engine = TFIDFEngine()
        _tfidf_engine.fit(RAG_CHUNKS, text_field="text")
    return _tfidf_engine


# ──────────────────────────────────────────────────────────────────────────────
# NAMED ENTITY RECOGNIZER (Rule-based + Dictionary NER)
# ──────────────────────────────────────────────────────────────────────────────

class AyurvedicNER:
    """
    Rule-based Named Entity Recognizer for Ayurvedic texts.
    
    Approach: Dictionary lookup + regex patterns + longest-match greedy.
    Entity types: HERB, DOSHA, SYMPTOM, TREATMENT, FOOD, CLASSICAL_TEXT
    
    This is equivalent to a gazetteer-based NER system commonly used in
    biomedical NLP before deep learning (and still widely used for domain-specific tasks).
    """

    ENTITY_TYPES = ["HERB", "DOSHA", "SYMPTOM", "TREATMENT", "FOOD", "CLASSICAL_TEXT"]

    def __init__(self):
        # Build reverse lookup: alias -> (canonical, type, metadata)
        self.lookup: Dict[str, Tuple[str, str, Dict]] = {}
        self._build_lookup()

    def _build_lookup(self):
        """Build phrase -> (canonical, entity_type, meta) lookup."""
        for canonical, meta in HERB_LEXICON.items():
            for alias in [canonical] + meta.get("aliases", []):
                self.lookup[alias.lower()] = (canonical, "HERB", meta)
            if meta.get("sanskrit"):
                self.lookup[meta["sanskrit"].lower()] = (canonical, "HERB", meta)
            if meta.get("latin"):
                self.lookup[meta["latin"].lower()] = (canonical, "HERB", meta)

        for dosha, aliases in DOSHA_LEXICON.items():
            for alias in aliases:
                self.lookup[alias.lower()] = (dosha, "DOSHA", {"dosha": dosha})

        for symptom, aliases in SYMPTOM_LEXICON.items():
            for alias in aliases:
                self.lookup[alias.lower()] = (symptom, "SYMPTOM", {})

        for treatment, aliases in TREATMENT_LEXICON.items():
            for alias in aliases:
                self.lookup[alias.lower()] = (treatment, "TREATMENT", {})

        for food, aliases in FOOD_LEXICON.items():
            for alias in aliases:
                self.lookup[alias.lower()] = (food, "FOOD", {})

        for text_name, aliases in CLASSICAL_TEXT_LEXICON.items():
            for alias in aliases:
                self.lookup[alias.lower()] = (text_name, "CLASSICAL_TEXT", {})

    def _longest_match(self, tokens: List[str], start: int, max_len: int = 5) -> Optional[Tuple[int, str, str, str, Dict]]:
        """
        Greedy longest-match: try longest phrase first, then shorter.
        Returns (end_idx, matched_text, canonical, entity_type, meta) or None.
        """
        for length in range(min(max_len, len(tokens) - start), 0, -1):
            phrase = " ".join(tokens[start:start + length])
            if phrase in self.lookup:
                canonical, etype, meta = self.lookup[phrase]
                return (start + length, phrase, canonical, etype, meta)
        return None

    def extract(self, text: str) -> List[Dict]:
        """
        Extract entities from text using longest-match dictionary NER.
        Returns list of entity dicts with span, type, canonical, confidence.
        """
        original_text = text
        normalized = normalize_text(text)
        tokens = re.findall(r"[a-z][a-z\-']*[a-z]|[a-z]", normalized)
        
        entities = []
        seen_spans = []
        i = 0

        while i < len(tokens):
            match = self._longest_match(tokens, i)
            if match:
                end_idx, matched_text, canonical, etype, meta = match
                # Find character span in original text (case-insensitive)
                pattern = re.compile(re.escape(matched_text), re.IGNORECASE)
                m = pattern.search(original_text)
                char_start = m.start() if m else -1
                char_end = m.end() if m else -1

                # Confidence based on match length and source
                confidence = "high" if end_idx - i > 1 else "medium"
                
                entity = {
                    "text": matched_text,
                    "canonical": canonical,
                    "type": etype,
                    "token_start": i,
                    "token_end": end_idx,
                    "char_start": char_start,
                    "char_end": char_end,
                    "confidence": confidence,
                    "meta": meta,
                }
                entities.append(entity)
                seen_spans.append((i, end_idx))
                i = end_idx
            else:
                i += 1

        return entities

    def get_entity_summary(self, entities: List[Dict]) -> Dict:
        """Summarize extracted entities by type."""
        summary: Dict[str, List] = defaultdict(list)
        for e in entities:
            summary[e["type"]].append(e["canonical"])
        return dict(summary)

    def assess_dosha_balance(self, entities: List[Dict], text: str) -> Dict:
        """
        Assess which doshas are most discussed in the text.
        Returns dosha focus with counts.
        """
        dosha_counts = {"vata": 0, "pitta": 0, "kapha": 0}
        
        # Count direct dosha mentions
        for e in entities:
            if e["type"] == "DOSHA":
                for d in ["vata", "pitta", "kapha"]:
                    if d in e["canonical"].lower():
                        dosha_counts[d] += 2

        # Count herb associations
        for e in entities:
            if e["type"] == "HERB" and e["canonical"] in HERB_LEXICON:
                herb_data = HERB_LEXICON[e["canonical"]]
                for d in herb_data.get("balances", []):
                    dosha_counts[d] += 1

        # Count symptom associations
        normalized_text = normalize_text(text)
        vata_symptoms = ["anxiety", "insomnia", "constipation", "dry", "cold", "joint"]
        pitta_symptoms = ["heartburn", "acne", "anger", "inflammation", "heat", "burning"]
        kapha_symptoms = ["weight", "fatigue", "congestion", "lethargy", "mucus", "depression"]
        
        for kw in vata_symptoms:
            if kw in normalized_text:
                dosha_counts["vata"] += 1
        for kw in pitta_symptoms:
            if kw in normalized_text:
                dosha_counts["pitta"] += 1
        for kw in kapha_symptoms:
            if kw in normalized_text:
                dosha_counts["kapha"] += 1

        primary = max(dosha_counts, key=dosha_counts.get)
        return {
            "counts": dosha_counts,
            "primary_dosha": primary if dosha_counts[primary] > 0 else "balanced",
            "is_tridoshic": all(v > 0 for v in dosha_counts.values()),
        }


# ──────────────────────────────────────────────────────────────────────────────
# SENTIMENT ANALYZER (Lexicon-based)
# ──────────────────────────────────────────────────────────────────────────────

class AyurvedicSentimentAnalyzer:
    """
    Lexicon-based sentiment analyzer specialized for Ayurvedic text.
    
    Approach: Valence-based lexicon + negation handling + intensifier detection.
    Based on the VADER sentiment analysis methodology adapted for Ayurvedic domain.
    """

    POSITIVE_WORDS = {
        # General positive
        "effective": 0.8, "beneficial": 0.8, "helpful": 0.7, "good": 0.6,
        "excellent": 0.9, "great": 0.8, "amazing": 0.9, "wonderful": 0.85,
        "improved": 0.75, "better": 0.65, "relief": 0.8, "comfortable": 0.65,
        "natural": 0.5, "safe": 0.7, "pure": 0.6, "healthy": 0.7,
        # Ayurvedic positive
        "rasayana": 0.85, "rejuvenating": 0.8, "balancing": 0.75,
        "strengthening": 0.75, "nourishing": 0.75, "healing": 0.8,
        "classical": 0.6, "authentic": 0.7, "traditional": 0.55,
        "evidence": 0.6, "research": 0.55, "proven": 0.7,
        "recommend": 0.7, "satisfied": 0.75, "working": 0.6, "works": 0.65,
        "reduced": 0.7, "improved": 0.75, "significant": 0.6,
    }

    NEGATIVE_WORDS = {
        # General negative
        "bad": -0.6, "terrible": -0.85, "awful": -0.85, "poor": -0.6,
        "ineffective": -0.75, "harmful": -0.9, "dangerous": -0.9, "toxic": -0.85,
        "fake": -0.85, "fraud": -0.95, "scam": -0.95, "false": -0.75,
        "side effects": -0.7, "allergy": -0.65, "reaction": -0.55,
        "expensive": -0.5, "bitter": -0.3, "unpleasant": -0.5,
        # Pseudoscience negative
        "miracle": -0.2,  # context-dependent but often negative signal
        "suppressed": -0.7, "secret": -0.4, "conspiracy": -0.8,
        "cure": -0.2,  # overclaiming
        "guaranteed": -0.3,  # overclaiming
    }

    NEGATION_WORDS = {"not", "no", "never", "without", "cant", "cannot", "doesnt", "dont", "isnt", "wasnt", "arent", "werent"}
    INTENSIFIERS = {"very": 1.3, "extremely": 1.5, "highly": 1.3, "most": 1.2, "quite": 1.1, "really": 1.2, "absolutely": 1.4}

    def analyze(self, text: str) -> Dict[str, Any]:
        """
        Analyze sentiment of text using valence-based lexicon approach.
        Returns scores and classification.
        """
        tokens = tokenize(text, remove_stopwords=False)
        normalized = normalize_text(text)

        # Score calculation with negation window (window=3 tokens before)
        positive_score = 0.0
        negative_score = 0.0
        intensifier = 1.0
        negation_active = False
        negation_count = 0

        for i, token in enumerate(tokens):
            # Check intensifier
            if token in self.INTENSIFIERS:
                intensifier = self.INTENSIFIERS[token]
                continue

            # Check negation
            if token in self.NEGATION_WORDS:
                negation_active = True
                negation_count = 3  # negation window
                continue

            if negation_count > 0:
                negation_count -= 1
            else:
                negation_active = False

            # Positive score
            if token in self.POSITIVE_WORDS:
                val = self.POSITIVE_WORDS[token] * intensifier
                if negation_active:
                    negative_score += val * 0.5
                else:
                    positive_score += val

            # Negative score (bigrams too)
            elif token in self.NEGATIVE_WORDS:
                val = abs(self.NEGATIVE_WORDS[token]) * intensifier
                if negation_active:
                    positive_score += val * 0.5
                else:
                    negative_score += val

            # Check bigrams
            if i < len(tokens) - 1:
                bigram = f"{token} {tokens[i+1]}"
                if bigram in self.NEGATIVE_WORDS:
                    negative_score += abs(self.NEGATIVE_WORDS[bigram]) * intensifier

            intensifier = 1.0  # reset

        # Normalize to 0-1
        total = max(positive_score + negative_score, 0.01)
        pos_pct = round(min(100, (positive_score / total) * 100))
        neg_pct = round(min(100, (negative_score / total) * 100))
        neu_pct = max(0, 100 - pos_pct - neg_pct)

        # Compound score (-1 to +1)
        compound = (positive_score - negative_score) / max(positive_score + negative_score, 1)
        compound = max(-1.0, min(1.0, compound))
        overall_score = int((compound + 1) / 2 * 100)  # 0-100

        # Classify
        if compound >= 0.35:
            sentiment = "positive"
        elif compound <= -0.35:
            sentiment = "negative"
        elif abs(positive_score - negative_score) < 0.1:
            sentiment = "neutral"
        else:
            sentiment = "mixed"

        # Detect intent
        intent = self._classify_intent(normalized)

        return {
            "sentiment": sentiment,
            "compound": round(compound, 3),
            "score": overall_score,
            "pos": pos_pct,
            "neg": neg_pct,
            "neu": neu_pct,
            "intent": intent,
            "positive_score": round(positive_score, 3),
            "negative_score": round(negative_score, 3),
        }

    def _classify_intent(self, text: str) -> str:
        """Classify the intent of the text."""
        if any(w in text for w in ["i have", "i am", "i feel", "my", "i've", "i was"]):
            return "personal"
        if any(w in text for w in ["buy", "purchase", "product", "price", "offer", "sale"]):
            return "promotional"
        if any(w in text for w in ["recommend", "should", "advised", "consult"]):
            return "advisory"
        if any(w in text for w in ["research", "study", "clinical", "trial", "evidence"]):
            return "educational"
        if any(w in text for w in ["review", "rating", "experience", "tried", "used"]):
            return "testimonial"
        return "informational"


# ──────────────────────────────────────────────────────────────────────────────
# CLAIM VERIFIER (Pattern-based + Entity scoring)
# ──────────────────────────────────────────────────────────────────────────────

class ClaimVerifier:
    """
    Verifies Ayurvedic health claims for authenticity vs. pseudoscience.
    
    Approach:
    - Regex-based detection of pseudoscience red-flag patterns
    - Classical text citation detection
    - Entity-based authenticity scoring
    - Claim extremity detection (absolute claims)
    """

    ABSOLUTE_CLAIM_PATTERNS = [
        r"\b100\s*%\b", r"\bguaranteed?\b", r"\bsurely\b", r"\bcertainly\b",
        r"\balways\b", r"\bnever fails?\b", r"\binstant(ly)?\b",
        r"\bin \d+ days?\b", r"\bovernight\b",
    ]

    RISK_PATTERNS = {
        "high": [
            r"cure[sd]? (diabetes|cancer|hiv|aids|covid|tumor)",
            r"replaces? (chemotherapy|insulin|medication)",
            r"stop taking (your )?(medicine|medication|insulin)",
        ],
        "medium": [
            r"detox(ify)? in \d+ days?",
            r"lose \d+\s*(kg|pounds?|lbs?) in",
            r"100\s*%\s*(effective|natural|safe)",
        ],
        "low": [
            r"may help",
            r"traditional use",
            r"some people report",
        ],
    }

    def verify(self, text: str, entities: List[Dict]) -> Dict[str, Any]:
        """Analyze a health claim for authenticity."""
        normalized = normalize_text(text)

        # --- Pseudoscience detection ---
        pseudo_matches = []
        for pattern in PSEUDOSCIENCE_PATTERNS:
            m = re.search(pattern, normalized)
            if m:
                pseudo_matches.append(m.group(0))

        # --- Authentic signal detection ---
        auth_matches = []
        for pattern in AUTHENTIC_SIGNALS:
            m = re.search(pattern, normalized)
            if m:
                auth_matches.append(m.group(0))

        # --- Classical text citation detection ---
        classical_refs = [e["canonical"] for e in entities if e["type"] == "CLASSICAL_TEXT"]

        # --- Absolute claim detection ---
        absolute_claims = []
        for pattern in self.ABSOLUTE_CLAIM_PATTERNS:
            m = re.search(pattern, normalized)
            if m:
                absolute_claims.append(m.group(0))

        # --- Risk assessment ---
        risk = "low"
        for level in ["high", "medium"]:
            for pattern in self.RISK_PATTERNS[level]:
                if re.search(pattern, normalized):
                    risk = level
                    break

        # --- Scoring ---
        pseudo_score = min(1.0, len(pseudo_matches) * 0.3)
        auth_score = min(1.0, len(auth_matches) * 0.25 + len(classical_refs) * 0.3)
        absolute_penalty = min(0.5, len(absolute_claims) * 0.15)

        # Authenticity score (0-100)
        raw_auth = auth_score - pseudo_score - absolute_penalty
        authenticity_score = int(max(0, min(100, (raw_auth + 1) / 2 * 100)))

        # Verdict
        if pseudo_score > 0.5 or risk == "high":
            verdict = "pseudoscientific"
        elif pseudo_score > 0.2 or len(absolute_claims) > 2:
            verdict = "partially_authentic"
        elif auth_score > 0.3 or len(classical_refs) > 0:
            verdict = "authentic"
        else:
            verdict = "unverifiable"

        # Ayurvedic basis
        herb_entities = [e for e in entities if e["type"] == "HERB"]
        has_ayurvedic_herbs = len(herb_entities) > 0
        ayurvedic_basis = "yes" if (has_ayurvedic_herbs and auth_score > 0.2) else ("partial" if has_ayurvedic_herbs else "no")

        # Evidence grade
        evidence_grade = "A" if (len(classical_refs) > 0 and len(pseudo_matches) == 0) else \
                         "B" if auth_score > 0.3 else \
                         "C" if has_ayurvedic_herbs else "D"

        return {
            "verdict": verdict,
            "confidence": authenticity_score,
            "ayurvedic_basis": ayurvedic_basis,
            "classical_refs_found": classical_refs,
            "pseudo_red_flags": pseudo_matches,
            "authentic_signals": auth_matches,
            "absolute_claims": absolute_claims,
            "risk": risk,
            "evidence_grade": evidence_grade,
            "pseudo_score": round(pseudo_score, 3),
            "auth_score": round(auth_score, 3),
        }


# ──────────────────────────────────────────────────────────────────────────────
# RAG RETRIEVAL ENGINE
# ──────────────────────────────────────────────────────────────────────────────

class RAGRetriever:
    """
    Retrieval-Augmented Generation engine.
    Combines TF-IDF retrieval with keyword scoring for RAG context building.
    """

    def __init__(self):
        self.tfidf = get_tfidf_engine()

    def retrieve(self, query: str, top_k: int = 4) -> List[Dict]:
        """Retrieve most relevant knowledge chunks for a query."""
        results = self.tfidf.query(query, top_k=top_k * 2)  # over-retrieve

        # Re-rank with keyword boost
        reranked = []
        for doc, tfidf_score in results:
            kw_hits = sum(1 for kw in doc.get("keywords", []) if kw in query.lower())
            final_score = tfidf_score * 0.7 + (kw_hits / max(len(doc.get("keywords", [1])), 1)) * 0.3
            reranked.append({
                **doc,
                "relevance_score": round(final_score, 4),
                "tfidf_score": round(tfidf_score, 4),
                "keyword_hits": kw_hits,
            })

        reranked.sort(key=lambda x: x["relevance_score"], reverse=True)
        return reranked[:top_k]

    def build_context(self, chunks: List[Dict]) -> str:
        """Build a formatted RAG context string from retrieved chunks."""
        if not chunks:
            return ""
        lines = ["--- RETRIEVED KNOWLEDGE BASE ---"]
        for chunk in chunks:
            lines.append(f"\n[{chunk['source']}] (relevance: {chunk['relevance_score']:.3f})")
            lines.append(chunk["text"])
        lines.append("--- END KNOWLEDGE BASE ---")
        return "\n".join(lines)


# ──────────────────────────────────────────────────────────────────────────────
# PRAKRITI SCORER (Rule-based dosha classification)
# ──────────────────────────────────────────────────────────────────────────────

VATA_KEYWORDS = [
    "thin", "lean", "light", "dry", "rough", "cold", "irregular", "variable",
    "anxiety", "worry", "fear", "restless", "creative", "quick", "forgetful",
    "constipation", "gas", "bloating", "insomnia", "light sleep", "airy",
    "fast", "scattered", "multitask", "difficulty", "crack", "joint",
]
PITTA_KEYWORDS = [
    "medium", "muscular", "sharp", "hot", "oily", "intense", "focused",
    "anger", "irritable", "competitive", "ambitious", "leader", "precise",
    "heartburn", "acne", "rash", "diarrhea", "inflammation", "sensitive",
    "strong digestion", "hunger", "regular", "perfectionist", "critical",
]
KAPHA_KEYWORDS = [
    "large", "heavy", "solid", "slow", "stable", "oily", "thick", "calm",
    "loyal", "patient", "steady", "compassionate", "attached", "sleep",
    "weight", "congestion", "mucus", "lethargic", "deliberate", "sweet",
    "gain weight", "slow digestion", "endurance", "steady energy",
]

def score_prakriti_from_text(answers: List[str]) -> Dict[str, Any]:
    """
    Score Vata/Pitta/Kapha percentages from free-text Prakriti answers.
    Uses keyword counting with normalization.
    
    This is a lightweight NLP classifier — in production you'd use
    a fine-tuned BERT model on annotated Prakriti assessment data.
    """
    combined = " ".join(answers).lower()
    tokens = set(tokenize(combined, remove_stopwords=False))

    vata_score = sum(1 for kw in VATA_KEYWORDS if kw in combined)
    pitta_score = sum(1 for kw in PITTA_KEYWORDS if kw in combined)
    kapha_score = sum(1 for kw in KAPHA_KEYWORDS if kw in combined)

    total = max(vata_score + pitta_score + kapha_score, 1)
    vata_pct = round((vata_score / total) * 100)
    pitta_pct = round((pitta_score / total) * 100)
    kapha_pct = 100 - vata_pct - pitta_pct

    # Normalize to sum to 100
    vata_pct = max(5, vata_pct)
    pitta_pct = max(5, pitta_pct)
    kapha_pct = max(5, kapha_pct)
    total_pct = vata_pct + pitta_pct + kapha_pct
    vata_pct = round(vata_pct / total_pct * 100)
    pitta_pct = round(pitta_pct / total_pct * 100)
    kapha_pct = 100 - vata_pct - pitta_pct

    doshas = [("vata", vata_pct), ("pitta", pitta_pct), ("kapha", kapha_pct)]
    doshas.sort(key=lambda x: x[1], reverse=True)
    primary = doshas[0][0]
    secondary = doshas[1][0] if doshas[1][1] >= 25 else "none"

    return {
        "vata": vata_pct,
        "pitta": pitta_pct,
        "kapha": kapha_pct,
        "primary": primary,
        "secondary": secondary,
        "raw_scores": {"vata": vata_score, "pitta": pitta_score, "kapha": kapha_score},
        "method": "keyword_nlp",  # label the NLP method used
    }


# ──────────────────────────────────────────────────────────────────────────────
# SYMPTOM CLASSIFIER
# ──────────────────────────────────────────────────────────────────────────────

SYMPTOM_DOSHA_MAP = {
    # Vata symptoms
    "anxiety": {"vata": 3, "pitta": 1},
    "insomnia": {"vata": 3, "pitta": 1},
    "constipation": {"vata": 3},
    "dry skin": {"vata": 3},
    "joint pain": {"vata": 2, "pitta": 1},
    "bloating": {"vata": 3},
    "brain fog": {"vata": 2, "kapha": 1},
    "hair loss": {"vata": 2, "pitta": 1},
    "cold hands/feet": {"vata": 3},
    "mood swings": {"vata": 2, "pitta": 1},
    # Pitta symptoms
    "heartburn": {"pitta": 3},
    "acne": {"pitta": 3},
    "irritability": {"pitta": 3},
    "inflammation": {"pitta": 3},
    "loose stools": {"pitta": 2},
    "skin rash": {"pitta": 3},
    "headache": {"pitta": 2, "vata": 1},
    # Kapha symptoms
    "weight gain": {"kapha": 3},
    "fatigue": {"kapha": 2, "vata": 1},
    "congestion": {"kapha": 3},
    "depression": {"kapha": 2, "vata": 1},
    "water retention": {"kapha": 3},
    "low energy": {"kapha": 2, "vata": 1},
    "poor memory": {"kapha": 1, "vata": 1},
    "frequent hunger": {"pitta": 3},
    "excessive thirst": {"pitta": 2},
}

AMA_INDICATORS = ["fatigue", "brain fog", "tongue coating", "heavy", "sluggish", "poor appetite", "joint stiffness", "bloating"]


def classify_symptoms(selected_symptoms: List[str], free_text: str = "") -> Dict[str, Any]:
    """
    Classify symptoms to dosha imbalances using weighted keyword mapping.
    
    Algorithm: Multi-label classification using symptom-dosha weight matrix.
    Each symptom contributes weighted votes to each dosha.
    """
    dosha_scores = {"vata": 0, "pitta": 0, "kapha": 0}

    # Score selected chips
    for symptom in selected_symptoms:
        symptom_lower = symptom.lower()
        for key, weights in SYMPTOM_DOSHA_MAP.items():
            if key in symptom_lower or symptom_lower in key:
                for dosha, weight in weights.items():
                    dosha_scores[dosha] += weight

    # Score free text using NER
    if free_text:
        ner = AyurvedicNER()
        entities = ner.extract(free_text)
        for entity in entities:
            if entity["type"] == "SYMPTOM":
                for key, weights in SYMPTOM_DOSHA_MAP.items():
                    if key in entity["canonical"].lower():
                        for dosha, weight in weights.items():
                            dosha_scores[dosha] += weight * 0.8  # slightly down-weight NER

    # Normalize to 0-100
    total = max(sum(dosha_scores.values()), 1)
    normalized = {d: round(min(100, s / total * 100)) for d, s in dosha_scores.items()}

    # Primary imbalance
    primary = max(dosha_scores, key=dosha_scores.get)
    is_tridoshic = all(s > 0 for s in dosha_scores.values()) and max(dosha_scores.values()) < sum(dosha_scores.values()) * 0.5

    # Ama assessment
    all_symptoms = [s.lower() for s in selected_symptoms] + tokenize(free_text)
    ama_hits = sum(1 for ind in AMA_INDICATORS if any(ind in s for s in all_symptoms))
    ama_level = "high" if ama_hits >= 3 else "moderate" if ama_hits >= 1 else "low"

    return {
        "raw_scores": dosha_scores,
        "vata_score": normalized["vata"],
        "pitta_score": normalized["pitta"],
        "kapha_score": normalized["kapha"],
        "primary_imbalance": "tridoshic" if is_tridoshic else primary,
        "secondary_imbalance": sorted(dosha_scores, key=dosha_scores.get, reverse=True)[1] if not is_tridoshic else "none",
        "ama_level": ama_level,
        "ama_indicators_found": ama_hits,
        "method": "weighted_keyword_classification",
    }
