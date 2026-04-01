"""
AyurMind — NLP Unit Tests
Tests all pure-Python NLP components without any API calls.
Run: python -m pytest tests/ -v
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pytest
from app.services.nlp_engine import (
    normalize_text, tokenize, get_ngrams, sentence_split,
    TFIDFEngine, AyurvedicNER, AyurvedicSentimentAnalyzer,
    ClaimVerifier, RAGRetriever, get_tfidf_engine,
    score_prakriti_from_text, classify_symptoms,
)
from app.data.ayurvedic_kb import RAG_CHUNKS, HERB_LEXICON


# ──────────────────────────────────────────────────────────────────────────────
# PREPROCESSING TESTS
# ──────────────────────────────────────────────────────────────────────────────

class TestPreprocessing:

    def test_normalize_text(self):
        assert normalize_text("  Ashwagandha  ") == "ashwagandha"
        assert normalize_text("Triphala\nChurna") == "triphala\nchurna"

    def test_tokenize_removes_stopwords(self):
        tokens = tokenize("This is the Ashwagandha herb")
        assert "ashwagandha" in tokens
        assert "this" not in tokens
        assert "is" not in tokens
        assert "the" not in tokens

    def test_tokenize_keeps_ayurvedic_terms(self):
        tokens = tokenize("Vata Pitta Kapha dosha balance Panchakarma")
        assert "vata" in tokens
        assert "pitta" in tokens
        assert "kapha" in tokens
        assert "panchakarma" in tokens

    def test_ngrams(self):
        tokens = ["vata", "pitta", "kapha"]
        bigrams = get_ngrams(tokens, 2)
        assert bigrams == ["vata pitta", "pitta kapha"]

    def test_sentence_split(self):
        text = "Agni is the digestive fire. It governs metabolism. Impaired Agni causes Ama."
        sentences = sentence_split(text)
        assert len(sentences) == 3
        assert "Agni is the digestive fire." in sentences[0]


# ──────────────────────────────────────────────────────────────────────────────
# TF-IDF ENGINE TESTS
# ──────────────────────────────────────────────────────────────────────────────

class TestTFIDFEngine:

    @pytest.fixture
    def engine(self):
        e = TFIDFEngine()
        e.fit(RAG_CHUNKS, text_field="text")
        return e

    def test_vocab_built(self, engine):
        assert len(engine.vocab) > 50
        assert engine._built is True

    def test_idf_computed(self, engine):
        assert len(engine.idf) > 0
        # Rare terms should have higher IDF
        for term, idf_val in engine.idf.items():
            assert idf_val > 0

    def test_query_returns_results(self, engine):
        results = engine.query("digestive fire Agni metabolism", top_k=3)
        assert len(results) > 0
        # First result should be the Agni chunk
        top_doc, top_score = results[0]
        assert top_score > 0
        assert "agni" in top_doc["text"].lower() or "agni" in top_doc["id"]

    def test_cosine_similarity_identical(self, engine):
        vec = {"a": 0.5, "b": 0.3}
        assert abs(engine.cosine_similarity(vec, vec) - 1.0) < 1e-6

    def test_cosine_similarity_orthogonal(self, engine):
        vec_a = {"a": 1.0}
        vec_b = {"b": 1.0}
        assert engine.cosine_similarity(vec_a, vec_b) == 0.0

    def test_herb_query(self, engine):
        results = engine.query("ashwagandha stress anxiety adaptogen", top_k=3)
        assert len(results) > 0

    def test_extractive_summary(self, engine):
        text = (
            "Agni is the digestive fire. It governs all metabolism in the body. "
            "When Agni is impaired, Ama is produced. Ama causes most diseases. "
            "Trikatu herbs kindle Agni. Panchakarma removes accumulated Ama."
        )
        summary = engine.extractive_summary(text, num_sentences=2)
        assert len(summary) > 0
        assert len(summary) < len(text)


# ──────────────────────────────────────────────────────────────────────────────
# NER TESTS
# ──────────────────────────────────────────────────────────────────────────────

class TestNER:

    @pytest.fixture
    def ner(self):
        return AyurvedicNER()

    def test_herb_extraction(self, ner):
        text = "Ashwagandha and Brahmi are excellent Rasayana herbs for stress."
        entities = ner.extract(text)
        types = [e["type"] for e in entities]
        assert "HERB" in types
        herb_names = [e["canonical"] for e in entities if e["type"] == "HERB"]
        assert "ashwagandha" in herb_names
        assert "brahmi" in herb_names

    def test_dosha_extraction(self, ner):
        text = "This herb balances Vata dosha and reduces Pitta."
        entities = ner.extract(text)
        dosha_entities = [e for e in entities if e["type"] == "DOSHA"]
        assert len(dosha_entities) >= 2
        doshas = [e["canonical"] for e in dosha_entities]
        assert "vata" in doshas
        assert "pitta" in doshas

    def test_symptom_extraction(self, ner):
        text = "The patient suffers from anxiety, insomnia and constipation."
        entities = ner.extract(text)
        symptoms = [e["canonical"] for e in entities if e["type"] == "SYMPTOM"]
        assert "anxiety" in symptoms
        assert "insomnia" in symptoms

    def test_treatment_extraction(self, ner):
        text = "Panchakarma and Abhyanga are classical Ayurvedic treatments."
        entities = ner.extract(text)
        treatments = [e["canonical"] for e in entities if e["type"] == "TREATMENT"]
        assert "panchakarma" in treatments

    def test_classical_text_extraction(self, ner):
        text = "According to Charaka Samhita, Agni is the root of life."
        entities = ner.extract(text)
        texts = [e["canonical"] for e in entities if e["type"] == "CLASSICAL_TEXT"]
        assert "charaka samhita" in texts

    def test_alias_recognition(self, ner):
        """Test that herb aliases are recognized."""
        text = "Haldi (turmeric) has anti-inflammatory properties."
        entities = ner.extract(text)
        herbs = [e["canonical"] for e in entities if e["type"] == "HERB"]
        assert "turmeric" in herbs

    def test_no_false_positives_on_empty(self, ner):
        entities = ner.extract("The weather is nice today.")
        assert len(entities) == 0

    def test_dosha_balance_assessment(self, ner):
        text = "Vata imbalance causes anxiety and insomnia. Ashwagandha balances Vata."
        entities = ner.extract(text)
        balance = ner.assess_dosha_balance(entities, text)
        assert balance["primary_dosha"] == "vata"
        assert balance["counts"]["vata"] > 0

    def test_entity_summary(self, ner):
        text = "Ashwagandha and Triphala are Rasayana herbs that balance Vata and Kapha."
        entities = ner.extract(text)
        summary = ner.get_entity_summary(entities)
        assert "HERB" in summary
        assert len(summary["HERB"]) >= 2


# ──────────────────────────────────────────────────────────────────────────────
# SENTIMENT TESTS
# ──────────────────────────────────────────────────────────────────────────────

class TestSentiment:

    @pytest.fixture
    def analyzer(self):
        return AyurvedicSentimentAnalyzer()

    def test_positive_review(self, analyzer):
        text = "Triphala is very effective for digestion. I feel much better after using it. Highly recommend."
        result = analyzer.analyze(text)
        assert result["sentiment"] == "positive"
        assert result["compound"] > 0
        assert result["pos"] > result["neg"]

    def test_negative_text(self, analyzer):
        text = "This product is harmful and ineffective. Do not use it. Dangerous side effects."
        result = analyzer.analyze(text)
        assert result["sentiment"] in ["negative", "mixed"]
        assert result["neg"] > 0

    def test_neutral_informational(self, analyzer):
        text = "Agni is the digestive fire in Ayurveda. Charaka Samhita describes four types of Agni."
        result = analyzer.analyze(text)
        assert result["sentiment"] in ["neutral", "informative", "positive"]

    def test_score_range(self, analyzer):
        text = "Ashwagandha is a great herb for stress relief."
        result = analyzer.analyze(text)
        assert 0 <= result["score"] <= 100
        assert 0 <= result["pos"] <= 100
        assert 0 <= result["neg"] <= 100
        assert 0 <= result["neu"] <= 100

    def test_negation_handling(self, analyzer):
        positive = analyzer.analyze("This herb is very effective.")
        negated = analyzer.analyze("This herb is not effective.")
        assert positive["compound"] > negated["compound"]

    def test_intent_personal(self, analyzer):
        result = analyzer.analyze("I have been using Ashwagandha for my anxiety.")
        assert result["intent"] == "personal"

    def test_intent_promotional(self, analyzer):
        result = analyzer.analyze("Buy our herbal product at the best price today.")
        assert result["intent"] == "promotional"


# ──────────────────────────────────────────────────────────────────────────────
# CLAIM VERIFIER TESTS
# ──────────────────────────────────────────────────────────────────────────────

class TestClaimVerifier:

    @pytest.fixture
    def verifier(self):
        return ClaimVerifier()

    @pytest.fixture
    def ner(self):
        return AyurvedicNER()

    def test_pseudoscientific_claim(self, verifier, ner):
        text = "This miracle herb cures diabetes in 30 days. Doctors don't want you to know this secret."
        entities = ner.extract(text)
        result = verifier.verify(text, entities)
        assert result["verdict"] in ["pseudoscientific", "partially_authentic"]
        assert result["risk"] in ["medium", "high"]
        assert len(result["pseudo_red_flags"]) > 0

    def test_authentic_classical_claim(self, verifier, ner):
        text = "According to Charaka Samhita, Ashwagandha balances Vata dosha and is used as a Rasayana herb."
        entities = ner.extract(text)
        result = verifier.verify(text, entities)
        assert result["verdict"] in ["authentic", "partially_authentic"]
        assert len(result["authentic_signals"]) > 0

    def test_high_risk_detection(self, verifier, ner):
        text = "Stop taking your insulin and use this herb to cure diabetes naturally in 30 days."
        entities = ner.extract(text)
        result = verifier.verify(text, entities)
        assert result["risk"] == "high"

    def test_evidence_grade(self, verifier, ner):
        authentic_text = "Charaka Samhita describes Ashwagandha as a Balya Rasayana for Vata conditions."
        entities = ner.extract(authentic_text)
        result = verifier.verify(authentic_text, entities)
        assert result["evidence_grade"] in ["A", "B"]


# ──────────────────────────────────────────────────────────────────────────────
# RAG RETRIEVER TESTS
# ──────────────────────────────────────────────────────────────────────────────

class TestRAGRetriever:

    @pytest.fixture
    def retriever(self):
        return RAGRetriever()

    def test_retrieves_agni_for_digestion_query(self, retriever):
        chunks = retriever.retrieve("digestive fire Agni metabolism", top_k=3)
        assert len(chunks) > 0
        sources = [c["source"] for c in chunks]
        # The Agni chunk should appear
        assert any("agni" in c["id"].lower() or "agni" in c["text"].lower() for c in chunks)

    def test_retrieves_herb_for_herb_query(self, retriever):
        chunks = retriever.retrieve("ashwagandha stress anxiety", top_k=3)
        assert len(chunks) > 0
        assert any("ashwagandha" in c["text"].lower() for c in chunks)

    def test_relevance_scores_descending(self, retriever):
        chunks = retriever.retrieve("Vata dosha symptoms anxiety", top_k=5)
        scores = [c["relevance_score"] for c in chunks]
        assert scores == sorted(scores, reverse=True)

    def test_build_context_string(self, retriever):
        chunks = retriever.retrieve("Agni", top_k=2)
        context = retriever.build_context(chunks)
        assert "RETRIEVED KNOWLEDGE BASE" in context
        assert len(context) > 50

    def test_empty_context_for_no_results(self, retriever):
        chunks = retriever.retrieve("xyzzy frobozz nonexistent", top_k=3)
        # May return empty or very low relevance
        context = retriever.build_context([])
        assert context == ""


# ──────────────────────────────────────────────────────────────────────────────
# PRAKRITI SCORER TESTS
# ──────────────────────────────────────────────────────────────────────────────

class TestPrakritiScorer:

    def test_vata_profile(self):
        answers = [
            "I am very thin and lean, hard to gain weight",
            "Irregular digestion, variable appetite, constipation often",
            "Anxious mind, light sleep, worry a lot",
            "I speak quickly and move fast, start many projects",
            "Very dry skin especially in winter, hair is thin and frizzy",
        ]
        result = score_prakriti_from_text(answers)
        assert result["primary"] == "vata"
        assert result["vata"] > result["pitta"]
        assert result["vata"] > result["kapha"]
        assert result["vata"] + result["pitta"] + result["kapha"] == 100

    def test_pitta_profile(self):
        answers = [
            "Medium muscular build, maintain weight easily",
            "Strong sharp digestion, get very hungry, get irritable if I skip meals",
            "Intense focused mind, competitive, sharp memory",
            "Precise and intense, perfectionist tendencies",
            "Oily skin prone to acne and inflammation, sensitive to heat",
        ]
        result = score_prakriti_from_text(answers)
        assert result["primary"] == "pitta"

    def test_kapha_profile(self):
        answers = [
            "Large heavy solid frame, gain weight very easily",
            "Slow steady digestion, low appetite in morning",
            "Calm patient steady mind, heavy deep sleep",
            "Slow deliberate movement and speech",
            "Thick oily smooth skin, tendency to congestion and mucus",
        ]
        result = score_prakriti_from_text(answers)
        assert result["primary"] == "kapha"

    def test_percentages_sum_to_100(self):
        answers = ["some text here for testing the scorer"]
        result = score_prakriti_from_text(answers)
        assert result["vata"] + result["pitta"] + result["kapha"] == 100

    def test_method_label(self):
        result = score_prakriti_from_text(["test"])
        assert result["method"] == "keyword_nlp"


# ──────────────────────────────────────────────────────────────────────────────
# SYMPTOM CLASSIFIER TESTS
# ──────────────────────────────────────────────────────────────────────────────

class TestSymptomClassifier:

    def test_vata_symptoms(self):
        result = classify_symptoms(["Anxiety", "Insomnia", "Constipation", "Dry skin"])
        assert result["primary_imbalance"] == "vata"
        assert result["vata_score"] > result["pitta_score"]

    def test_pitta_symptoms(self):
        result = classify_symptoms(["Heartburn", "Acne", "Irritability", "Skin rash"])
        assert result["primary_imbalance"] == "pitta"

    def test_kapha_symptoms(self):
        result = classify_symptoms(["Weight gain", "Fatigue", "Congestion", "Depression"])
        assert result["primary_imbalance"] == "kapha"

    def test_ama_level_high(self):
        result = classify_symptoms(["Fatigue", "Brain fog", "Bloating", "Low energy", "Depression"])
        assert result["ama_level"] in ["moderate", "high"]

    def test_ama_level_low(self):
        result = classify_symptoms(["Acne", "Heartburn"])
        assert result["ama_level"] == "low"

    def test_normalized_scores_0_100(self):
        result = classify_symptoms(["Anxiety", "Heartburn", "Weight gain"])
        assert 0 <= result["vata_score"] <= 100
        assert 0 <= result["pitta_score"] <= 100
        assert 0 <= result["kapha_score"] <= 100

    def test_free_text_symptoms(self):
        result = classify_symptoms([], free_text="I have been experiencing a lot of anxiety and cannot sleep at night.")
        assert result["vata_score"] > 0

    def test_method_label(self):
        result = classify_symptoms(["Anxiety"])
        assert result["method"] == "weighted_keyword_classification"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
