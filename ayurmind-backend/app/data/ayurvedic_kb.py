"""
AyurMind — Ayurvedic NLP Knowledge Base
All lexicons, entity dictionaries, TF-IDF corpus, and RAG chunks used
by every NLP module in the backend.
"""

# ──────────────────────────────────────────────────────────────────────────────
# ENTITY LEXICONS — used by rule-based NER
# ──────────────────────────────────────────────────────────────────────────────

HERB_LEXICON = {
    # name -> {sanskrit, latin, balances, aggravates, rasa, virya, vipaka, karma}
    "ashwagandha": {
        "sanskrit": "Ashwagandha", "latin": "Withania somnifera",
        "balances": ["vata", "kapha"], "aggravates": [],
        "rasa": ["bitter", "astringent", "sweet"], "virya": "hot", "vipaka": "sweet",
        "karma": ["rasayana", "balya", "vata-anulomana"],
        "aliases": ["withania", "indian ginseng", "winter cherry", "aswagandha"],
    },
    "triphala": {
        "sanskrit": "Triphala", "latin": "Terminalia chebula / Phyllanthus emblica",
        "balances": ["vata", "pitta", "kapha"], "aggravates": [],
        "rasa": ["all six tastes"], "virya": "neutral", "vipaka": "sweet",
        "karma": ["rasayana", "deepaniya", "anulomana"],
        "aliases": ["haritaki", "amalaki", "bibhitaki", "trifala"],
    },
    "turmeric": {
        "sanskrit": "Haridra", "latin": "Curcuma longa",
        "balances": ["pitta", "kapha"], "aggravates": [],
        "rasa": ["bitter", "pungent"], "virya": "hot", "vipaka": "pungent",
        "karma": ["kusthaghna", "lekhaniya", "varnya"],
        "aliases": ["haridra", "curcuma", "curcumin", "haldi"],
    },
    "brahmi": {
        "sanskrit": "Brahmi", "latin": "Bacopa monnieri",
        "balances": ["pitta", "vata"], "aggravates": [],
        "rasa": ["bitter", "sweet"], "virya": "cold", "vipaka": "sweet",
        "karma": ["medhya", "rasayana", "nidrajanana"],
        "aliases": ["bacopa", "water hyssop", "thyme-leaved gratiola"],
    },
    "shatavari": {
        "sanskrit": "Shatavari", "latin": "Asparagus racemosus",
        "balances": ["vata", "pitta"], "aggravates": ["kapha"],
        "rasa": ["sweet", "bitter"], "virya": "cold", "vipaka": "sweet",
        "karma": ["rasayana", "balya", "stanyajanana"],
        "aliases": ["asparagus", "satavari", "satmuli"],
    },
    "ginger": {
        "sanskrit": "Shunthi / Ardrakam", "latin": "Zingiber officinale",
        "balances": ["vata", "kapha"], "aggravates": ["pitta"],
        "rasa": ["pungent"], "virya": "hot", "vipaka": "sweet",
        "karma": ["deepaniya", "pachana", "anulomana"],
        "aliases": ["shunthi", "ardrakam", "zingiber", "adrak"],
    },
    "neem": {
        "sanskrit": "Nimba", "latin": "Azadirachta indica",
        "balances": ["pitta", "kapha"], "aggravates": ["vata"],
        "rasa": ["bitter"], "virya": "cold", "vipaka": "pungent",
        "karma": ["kusthaghna", "krimighna", "jwaraghna"],
        "aliases": ["nimba", "azadirachta", "margosa"],
    },
    "amalaki": {
        "sanskrit": "Amalaki", "latin": "Phyllanthus emblica",
        "balances": ["vata", "pitta", "kapha"], "aggravates": [],
        "rasa": ["sour", "sweet", "bitter", "pungent", "astringent"], "virya": "cold", "vipaka": "sweet",
        "karma": ["rasayana", "vayasthapana", "caksusya"],
        "aliases": ["amla", "indian gooseberry", "emblica", "amlakai"],
    },
    "black pepper": {
        "sanskrit": "Maricha", "latin": "Piper nigrum",
        "balances": ["vata", "kapha"], "aggravates": ["pitta"],
        "rasa": ["pungent"], "virya": "hot", "vipaka": "pungent",
        "karma": ["deepaniya", "pachana", "krimighna"],
        "aliases": ["maricha", "piper nigrum", "kali mirch"],
    },
    "long pepper": {
        "sanskrit": "Pippali", "latin": "Piper longum",
        "balances": ["vata", "kapha"], "aggravates": ["pitta"],
        "rasa": ["pungent"], "virya": "hot", "vipaka": "sweet",
        "karma": ["deepaniya", "rasayana", "anulomana"],
        "aliases": ["pippali", "piper longum"],
    },
    "trikatu": {
        "sanskrit": "Trikatu", "latin": "Zingiber / Piper nigrum / Piper longum",
        "balances": ["vata", "kapha"], "aggravates": ["pitta"],
        "rasa": ["pungent"], "virya": "hot", "vipaka": "pungent",
        "karma": ["deepaniya", "pachana", "kaphahara"],
        "aliases": ["three pungents"],
    },
    "guduchi": {
        "sanskrit": "Guduchi", "latin": "Tinospora cordifolia",
        "balances": ["vata", "pitta", "kapha"], "aggravates": [],
        "rasa": ["bitter", "astringent"], "virya": "hot", "vipaka": "sweet",
        "karma": ["rasayana", "jwaraghna", "medhya"],
        "aliases": ["giloy", "tinospora", "amruta"],
    },
    "tulsi": {
        "sanskrit": "Tulasi", "latin": "Ocimum tenuiflorum",
        "balances": ["vata", "kapha"], "aggravates": ["pitta"],
        "rasa": ["pungent", "bitter"], "virya": "hot", "vipaka": "pungent",
        "karma": ["kasahara", "shwasahara", "jwaraghna"],
        "aliases": ["holy basil", "tulasi", "ocimum"],
    },
}

DOSHA_LEXICON = {
    "vata": ["vata", "vaata", "vata dosha", "air element", "wind element", "akasha", "vayu"],
    "pitta": ["pitta", "pitta dosha", "fire element", "bile", "agneya"],
    "kapha": ["kapha", "kapha dosha", "water element", "earth element", "shleshma", "kledaka"],
    "tridosha": ["tridosha", "three doshas", "tridoshic"],
    "prakriti": ["prakriti", "prakruti", "constitution", "body type"],
    "vikruti": ["vikruti", "vikrati", "imbalance", "current state"],
}

SYMPTOM_LEXICON = {
    # Vata symptoms
    "anxiety": ["anxiety", "anxious", "nervousness", "worry", "fear", "panic"],
    "insomnia": ["insomnia", "sleeplessness", "can't sleep", "poor sleep", "sleep problems", "sleep issues"],
    "constipation": ["constipation", "constipated", "hard stool", "difficult bowel"],
    "dry skin": ["dry skin", "dryness", "rough skin", "flaky skin"],
    "joint pain": ["joint pain", "arthritis", "joint ache", "joint cracking", "joint stiffness"],
    "bloating": ["bloating", "bloated", "gas", "flatulence", "distension"],
    # Pitta symptoms
    "heartburn": ["heartburn", "acid reflux", "acidity", "acid regurgitation", "burning stomach"],
    "acne": ["acne", "pimples", "breakouts", "skin inflammation", "rosacea"],
    "anger": ["anger", "irritability", "irritable", "frustration", "hot-tempered"],
    "inflammation": ["inflammation", "inflammatory", "inflamed", "swelling", "redness"],
    # Kapha symptoms
    "weight gain": ["weight gain", "overweight", "obesity", "excess weight"],
    "fatigue": ["fatigue", "tiredness", "lethargy", "low energy", "exhaustion", "sluggish"],
    "congestion": ["congestion", "mucus", "phlegm", "stuffy nose", "blocked nose"],
    "depression": ["depression", "depressed", "sadness", "low mood", "melancholy"],
    # General
    "fever": ["fever", "temperature", "jwara", "pyrexia"],
    "hair loss": ["hair loss", "hair fall", "alopecia", "thinning hair", "baldness"],
    "brain fog": ["brain fog", "confusion", "poor concentration", "memory issues", "forgetfulness"],
}

TREATMENT_LEXICON = {
    "panchakarma": ["panchakarma", "pancha karma", "detoxification", "purification therapy"],
    "vamana": ["vamana", "therapeutic emesis", "emesis therapy"],
    "virechana": ["virechana", "purgation", "purgation therapy"],
    "basti": ["basti", "enema", "medicated enema"],
    "nasya": ["nasya", "nasal therapy", "nasal administration"],
    "abhyanga": ["abhyanga", "oil massage", "self-massage", "oleation massage"],
    "shirodhara": ["shirodhara", "oil pouring", "head massage"],
    "rasayana": ["rasayana", "rejuvenation", "rejuvenative", "anti-aging therapy"],
    "dinacharya": ["dinacharya", "daily routine", "daily regimen", "daily ritual"],
    "yoga": ["yoga", "asana", "pranayama", "breathing exercise"],
    "meditation": ["meditation", "dhyana", "mindfulness"],
    "snehana": ["snehana", "oleation", "oil therapy", "ghee therapy"],
    "swedana": ["swedana", "fomentation", "steam therapy", "sweating therapy"],
}

FOOD_LEXICON = {
    "ghee": ["ghee", "clarified butter", "sarpis"],
    "milk": ["milk", "dairy milk", "cow milk", "ksheera"],
    "honey": ["honey", "madhu"],
    "sesame oil": ["sesame oil", "til oil", "sesame"],
    "warm water": ["warm water", "hot water", "lukewarm water"],
    "rice": ["rice", "shali", "rice gruel", "congee"],
    "mung beans": ["mung", "mung dal", "moong", "green gram"],
    "vegetables": ["vegetables", "leafy greens", "greens"],
}

CLASSICAL_TEXT_LEXICON = {
    "charaka samhita": ["charaka samhita", "charaka", "c.s.", "cs."],
    "sushruta samhita": ["sushruta samhita", "sushruta", "s.s."],
    "ashtanga hridayam": ["ashtanga hridayam", "vagbhata", "a.h.", "ashtanga hridaya"],
    "ashtanga sangraha": ["ashtanga sangraha", "a.s."],
    "madhava nidana": ["madhava nidana", "roga vinischaya"],
    "sharangdhara samhita": ["sharangdhara", "sharangadhara"],
    "bhava prakasha": ["bhava prakasha", "bhavaprakash"],
    "dhanvantari": ["dhanvantari", "dhanvanthari"],
}

# ──────────────────────────────────────────────────────────────────────────────
# RAG KNOWLEDGE CHUNKS — classical text excerpts for retrieval
# ──────────────────────────────────────────────────────────────────────────────

RAG_CHUNKS = [
    {
        "id": "charaka-agni-01",
        "source": "Charaka Samhita, Sutrasthana 28.3",
        "category": "digestion",
        "keywords": ["agni", "digestive fire", "metabolism", "digestion", "ama", "deepana"],
        "text": (
            "Agni (digestive fire) is the root of all metabolic processes. "
            "Charaka states: 'Agni is the cause of life, complexion, strength, health, "
            "nourishment, luster, ojas, and vital breath.' When Agni is balanced (Sama Agni), "
            "food is properly digested and all seven dhatus are nourished. "
            "Impaired Agni (Vishama, Tikshna, or Manda) leads to Ama (undigested metabolic waste), "
            "considered the root cause of most diseases. "
            "Deepaniya herbs (Trikatu, Chitrak) rekindle Agni; Pachaniya herbs digest existing Ama."
        ),
    },
    {
        "id": "charaka-prakriti-01",
        "source": "Charaka Samhita, Vimanasthana 8.95",
        "category": "constitution",
        "keywords": ["prakriti", "constitution", "vata", "pitta", "kapha", "body type", "garbha"],
        "text": (
            "Prakriti (individual constitution) is determined at conception by the relative predominance "
            "of Vata, Pitta, and Kapha doshas in the sperm and ovum, and is influenced by seasonal, "
            "dietary, and behavioral factors of the mother during pregnancy. "
            "Seven Prakriti types are described: Vata, Pitta, Kapha (single-dosha), "
            "Vata-Pitta, Pitta-Kapha, Vata-Kapha (dual-dosha), and Sama (balanced). "
            "Prakriti remains constant throughout life and governs susceptibility to disease."
        ),
    },
    {
        "id": "sushruta-tridosha-01",
        "source": "Sushruta Samhita, Sutrasthana 21.3",
        "category": "doshas",
        "keywords": ["tridosha", "vata", "pitta", "kapha", "dosha", "balance", "physiology"],
        "text": (
            "Vata dosha — composed of air (Vayu) and ether (Akasha) — governs all movement: "
            "nerve impulses, circulation, respiration, and elimination. Its primary seat is the colon. "
            "Pitta dosha — composed of fire (Tejas) and water (Jala) — governs all transformation: "
            "digestion, metabolism, body temperature, and intellect. Its primary seat is the small intestine. "
            "Kapha dosha — composed of earth (Prithvi) and water (Jala) — governs structure, "
            "immunity, and stability. Its primary seat is the lungs and stomach."
        ),
    },
    {
        "id": "ashtanga-ojas-01",
        "source": "Ashtanga Hridayam, Sutrasthana 11.37",
        "category": "immunity",
        "keywords": ["ojas", "immunity", "vitality", "rasayana", "tejas", "prana", "dhatu"],
        "text": (
            "Ojas is the pure, refined essence extracted from all seven dhatus at the completion of "
            "their transformation. Described as white or golden in color, it resides primarily in the heart. "
            "It is the material basis of consciousness, immunity (Vyadhikshamatva), and vitality. "
            "Ojas is depleted by excessive fasting, grief, overwork, sexual excess, and injury. "
            "Rasayana therapy — Ashwagandha, Shatavari, Amalaki, Chyawanprash — replenishes Ojas."
        ),
    },
    {
        "id": "charaka-panchakarma-01",
        "source": "Charaka Samhita, Kalpasthana 1.4",
        "category": "treatment",
        "keywords": ["panchakarma", "detox", "vamana", "virechana", "basti", "nasya", "purification"],
        "text": (
            "Panchakarma (five purification procedures) eliminates aggravated doshas from their "
            "respective primary sites. Vamana (therapeutic emesis) eliminates excess Kapha from the lungs. "
            "Virechana (purgation) eliminates excess Pitta from the small intestine. "
            "Basti (medicated enema) eliminates excess Vata from the colon and is considered the "
            "most important procedure — 'half the treatment of all diseases.' "
            "Nasya (nasal therapy) eliminates doshas from the head region. "
            "All procedures require preparatory Snehana (oleation) and Swedana (fomentation)."
        ),
    },
    {
        "id": "charaka-ashwagandha-01",
        "source": "Charaka Samhita, Sutrasthana 25.40",
        "category": "herbs",
        "keywords": ["ashwagandha", "withania", "adaptogen", "stress", "vata", "anxiety", "rasayana"],
        "text": (
            "Ashwagandha (Withania somnifera) is classified as a Rasayana and Balya (strength-promoting) herb. "
            "It pacifies aggravated Vata and Kapha, builds Ojas, and nourishes Shukra dhatu. "
            "Classical indications: Kshaya (wasting), Shukrakshaya (sexual debility), Vatavyadhi (neurological "
            "disorders), and Daurbalya (weakness). "
            "Standard preparation: 3–6g root powder with warm milk (Ksheerapaka). "
            "Modern research confirms adaptogenic, anti-stress, and immunomodulatory effects."
        ),
    },
    {
        "id": "charaka-triphala-01",
        "source": "Charaka Samhita, Chikitsasthana 1.3 / Ashtanga Hridayam, Uttarasthana 40.5",
        "category": "herbs",
        "keywords": ["triphala", "amalaki", "haritaki", "bibhitaki", "digestion", "tridoshic", "rasayana"],
        "text": (
            "Triphala ('three fruits': Amalaki, Haritaki, Bibhitaki) is described as a Tridoshic Rasayana — "
            "it pacifies all three doshas simultaneously, an unusual property. "
            "It acts as a Deepaniya (Agni-kindling), Anulomana (mild bowel regulator), Chakshusya (eye tonic), "
            "and Vayasthapana (age-arresting). Safe for long-term daily use. "
            "Standard dose: 3–6g powder in warm water before sleep. "
            "Haritaki alone is described as the 'mother of herbs' in Tibetan medicine."
        ),
    },
    {
        "id": "sushruta-turmeric-01",
        "source": "Sushruta Samhita, Sutrasthana 46.3",
        "category": "herbs",
        "keywords": ["turmeric", "haridra", "curcumin", "inflammation", "pitta", "kapha", "skin"],
        "text": (
            "Haridra (Curcuma longa) — classified as Lekhaniya (scraping/dissolving), "
            "Kusthaghna (skin disease-alleviating), and Varnya (complexion-enhancing). "
            "It reduces excess Pitta and Kapha, purifies Rakta dhatu (blood), and reduces Ama. "
            "Bioavailability of curcumin (active constituent) is significantly enhanced by Maricham "
            "(black pepper, piperine) and dietary fat (ghee). "
            "Classical application: turmeric paste for wounds; internal use with ghee and milk for joint inflammation."
        ),
    },
    {
        "id": "charaka-brahmi-01",
        "source": "Charaka Samhita, Sutrasthana 4.18",
        "category": "herbs",
        "keywords": ["brahmi", "bacopa", "memory", "cognition", "medhya", "stress", "brain", "pitta"],
        "text": (
            "Brahmi (Bacopa monnieri) is the primary Medhya Rasayana (brain tonic) in Charaka's "
            "four-herb cognitive enhancement protocol. "
            "It enhances Medha (intellect), Smriti (memory), and Dhi (learning), and reduces anxiety "
            "by pacifying excess Pitta in the nervous system. "
            "Classical use: 3–6g powder with ghee and honey, or as Brahmi Ghrita (medicated ghee). "
            "Modern research confirms memory enhancement, anxiolytic effects, and neuroprotection."
        ),
    },
    {
        "id": "charaka-vata-symptoms-01",
        "source": "Charaka Samhita, Sutrasthana 20.14",
        "category": "symptoms",
        "keywords": ["vata", "anxiety", "insomnia", "constipation", "dry skin", "joint pain", "cold"],
        "text": (
            "Vata imbalance (Vata Vriddhi) signs: Raukshya (dryness of skin, hair, stool), "
            "Laghava (lightness), Shaitya (coldness of extremities), Vishada (depression/anxiety), "
            "Kharva (roughness), and Alpa (deficiency of body substances). "
            "Common clinical presentations: constipation, insomnia, anxiety, joint cracking (Sandhishoola), "
            "variable digestion (Vishama Agni), poor circulation, fear, and hypersensitivity. "
            "Vata is aggravated by: irregular routine, cold/dry/light foods, excessive travel, suppression of urges."
        ),
    },
    {
        "id": "charaka-pitta-symptoms-01",
        "source": "Charaka Samhita, Sutrasthana 20.15",
        "category": "symptoms",
        "keywords": ["pitta", "heartburn", "acne", "inflammation", "anger", "heat", "acid"],
        "text": (
            "Pitta imbalance (Pitta Vriddhi) signs: Ushna (excess heat), Tikta (bitter taste in mouth), "
            "Daha (burning sensations), Rakta (redness/inflammation), Paka (suppuration/maturation), "
            "and Kshut (excessive hunger). "
            "Clinical presentations: heartburn/GERD, skin disorders (Kushtha, Visarpa), anger, "
            "inflammatory conditions, loose stools, bleeding disorders, photosensitivity. "
            "Pitta aggravated by: spicy/sour/fermented foods, alcohol, excessive sun, competition, late nights."
        ),
    },
    {
        "id": "charaka-kapha-symptoms-01",
        "source": "Charaka Samhita, Sutrasthana 20.16",
        "category": "symptoms",
        "keywords": ["kapha", "weight gain", "congestion", "lethargy", "depression", "water retention"],
        "text": (
            "Kapha imbalance (Kapha Vriddhi) signs: Gaurava (heaviness), Shaitya (coldness), "
            "Snigdhata (excessive oiliness/moisture), Manda (sluggishness), Sthira (stiffness/immobility), "
            "and Kleda (excess moisture/mucus). "
            "Clinical presentations: weight gain, fluid retention (Shotha), respiratory congestion, "
            "sluggish digestion (Manda Agni), excessive sleep, depression, lethargy, and high cholesterol. "
            "Kapha aggravated by: cold/heavy/sweet/oily foods, dairy, sedentary lifestyle, daytime sleep."
        ),
    },
    {
        "id": "ashtanga-dinacharya-01",
        "source": "Ashtanga Hridayam, Sutrasthana 2.1-20",
        "category": "lifestyle",
        "keywords": ["dinacharya", "daily routine", "morning", "abhyanga", "yoga", "lifestyle"],
        "text": (
            "Dinacharya (daily regimen): Wake at Brahma Muhurta (approx. 96 min before sunrise). "
            "Morning: Danta Dhavana (teeth cleaning), Jihva Nirlekhana (tongue scraping), "
            "Gandusha (oil pulling), Nasya (2 drops of oil in each nostril). "
            "Abhyanga (full-body warm oil self-massage) followed by warm bath. "
            "Vyayama (exercise) to half capacity. Pranayama and meditation. "
            "Meals: heavy breakfast, largest meal at midday (peak Agni), light dinner before sunset. "
            "Evening: light activity, reading; retire before 10pm."
        ),
    },
    {
        "id": "charaka-shatavari-01",
        "source": "Charaka Samhita, Sutrasthana 25.49",
        "category": "herbs",
        "keywords": ["shatavari", "asparagus", "female", "hormones", "fertility", "pitta", "vata"],
        "text": (
            "Shatavari (Asparagus racemosus) — the foremost female Rasayana. "
            "Its name means 'she who has a hundred husbands' — indicating its power to rejuvenate "
            "female reproductive tissues (Artavakshaya). "
            "It pacifies Vata and Pitta, nourishes Shukra dhatu (reproductive tissue), "
            "acts as Stanyajanana (galactagogue), Balya (tonic), and Medhya (brain tonic). "
            "Indications: menstrual irregularities, PCOS, menopause, infertility, low breast milk. "
            "Dose: 3–6g powder with warm milk and honey."
        ),
    },
    {
        "id": "charaka-rasa-panchaka-01",
        "source": "Charaka Samhita, Sutrasthana 26.2",
        "category": "nutrition",
        "keywords": ["rasa", "taste", "six tastes", "diet", "sweet", "sour", "pungent", "bitter"],
        "text": (
            "Rasa Panchaka (five properties of drugs) includes Rasa (taste), Guna (quality), "
            "Virya (potency), Vipaka (post-digestive effect), and Prabhava (special effect). "
            "Six Rasas: Madhura (sweet) — nourishing, heavy, cold, Vata-Kapha-pacifying; "
            "Amla (sour) — appetizer, digestive, Pitta-aggravating; "
            "Lavana (salty) — moistening, Pitta-Kapha-aggravating; "
            "Katu (pungent) — stimulates Agni, hot, Vata-Kapha-reducing; "
            "Tikta (bitter) — detoxifying, light, Pitta-Kapha-reducing; "
            "Kashaya (astringent) — binding, drying, Vata-aggravating."
        ),
    },
    {
        "id": "charaka-ama-01",
        "source": "Charaka Samhita, Vimanasthana 5.22",
        "category": "pathology",
        "keywords": ["ama", "toxins", "undigested", "disease", "sroto", "obstruction"],
        "text": (
            "Ama (undigested metabolic waste) is produced when Agni is impaired. "
            "It is described as heavy, sticky, foul-smelling, and cold — opposite to the qualities of Agni. "
            "Ama obstructs the Srotas (bodily channels), causing Srotorodha (channel blockage), "
            "which is the fundamental mechanism of disease in Ayurveda. "
            "Signs of Ama: coated tongue, heaviness, loss of appetite, fatigue, foul breath, "
            "joint stiffness, and dull intellect. "
            "Ama is treated with Langhana (fasting), Deepana-Pachana herbs (Trikatu, Chitrak), "
            "and ultimately Panchakarma."
        ),
    },
]

# ──────────────────────────────────────────────────────────────────────────────
# STOPWORDS — Ayurvedic domain-specific stopwords
# ──────────────────────────────────────────────────────────────────────────────

AYURVEDIC_STOPWORDS = {
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "shall", "can", "this", "that",
    "these", "those", "it", "its", "which", "who", "whom", "what", "when",
    "where", "how", "if", "then", "than", "so", "as", "also", "very",
    "used", "use", "known", "called", "named", "such", "like", "also",
    "both", "each", "more", "most", "other", "some", "any", "all", "well",
}

# Pseudoscience red-flag patterns (for claim verifier)
PSEUDOSCIENCE_PATTERNS = [
    r"cure[sd]? (diabetes|cancer|hiv|aids|covid)",
    r"100\s*%\s*(effective|cure|safe)",
    r"doctors don.t want",
    r"suppressed by",
    r"ancient secret",
    r"miracle\s+(cure|herb|remedy|formula)",
    r"detox(ify)? your (liver|body|colon) in \d+ (days?|hours?)",
    r"lose \d+ (pounds?|kg) in \d+ (days?|weeks?)",
    r"reverses? (diabetes|cancer|aging|disease)",
    r"big pharma",
    r"they (don.t|won.t) tell you",
    r"nano[- ]herb",
    r"proprietary (formula|blend|technology)",
]

# Authentic Ayurvedic signal phrases
AUTHENTIC_SIGNALS = [
    r"charaka samhita",
    r"sushruta samhita",
    r"ashtanga hridayam",
    r"dravyaguna",
    r"classical ayurved",
    r"according to (charaka|sushruta|vagbhata|ayurveda)",
    r"sutrasthana|chikitsasthana|vimanasthana",
    r"rasa[-\s]virya[-\s]vipaka",
    r"tridosha",
    r"prakriti",
    r"consult (a|your|qualified) (vaidya|ayurvedic practitioner|physician)",
]
