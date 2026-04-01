// AyurMind — RAG Knowledge Base
// Classical Ayurvedic text chunks for Retrieval-Augmented Generation

export const KNOWLEDGE_BASE = [
  {
    id: 'charaka-agni',
    source: 'Charaka Samhita, Sutrasthana 28.3',
    category: 'digestion',
    keywords: ['agni', 'digestive fire', 'metabolism', 'digestion', 'ama', 'toxins'],
    content:
      'Agni (digestive fire) is the root of all metabolic processes. Charaka states: "Agni is the cause of life, complexion, strength, health, nourishment, luster, ojas, and vital breath." Impaired Agni leads to Ama (toxins) accumulation, the root of most diseases. The four types are Sama (balanced), Vishama (irregular), Tikshna (sharp), and Manda (sluggish).',
  },
  {
    id: 'charaka-prakriti',
    source: 'Charaka Samhita, Vimanasthana 8.95',
    category: 'constitution',
    keywords: ['prakriti', 'constitution', 'vata', 'pitta', 'kapha', 'body type'],
    content:
      'Prakriti is the unique psycho-physical constitution determined at conception, governed by the predominance of one or two doshas: Vata (air+ether), Pitta (fire+water), Kapha (earth+water). Prakriti remains constant throughout life and influences physiology, psychology, and disease susceptibility.',
  },
  {
    id: 'sushruta-tridosha',
    source: 'Sushruta Samhita, Sutrasthana 21.3',
    category: 'doshas',
    keywords: ['tridosha', 'vata', 'pitta', 'kapha', 'balance', 'dosha'],
    content:
      'Tridosha theory: Vata governs movement, nerve impulses, and elimination — resides primarily in the colon. Pitta governs transformation, digestion, and intellect — resides in the small intestine. Kapha governs structure, immunity, and stability — resides in the lungs and stomach.',
  },
  {
    id: 'ashtanga-ojas',
    source: 'Ashtanga Hridayam, Sutrasthana 11.37',
    category: 'immunity',
    keywords: ['ojas', 'immunity', 'vitality', 'rasayana', 'tejas', 'prana'],
    content:
      'Ojas is the pure essence of all seven dhatus (tissues), the basis of immunity and vitality, residing in the heart. Rasayana therapies — including Ashwagandha, Shatavari, and Amalaki — enhance Ojas and promote longevity. Ojas is described as white/golden in color and is the eighth dhatu.',
  },
  {
    id: 'panchakarma',
    source: 'Charaka Samhita, Kalpasthana 1.4',
    category: 'treatment',
    keywords: ['panchakarma', 'detox', 'purification', 'vamana', 'virechana', 'basti', 'nasya'],
    content:
      'Panchakarma: five purification procedures — Vamana (therapeutic emesis), Virechana (purgation), Basti (medicated enema), Nasya (nasal therapy), and Raktamokshana (blood purification). Preceded by Snehana (oleation) and Swedana (fomentation). Used to eliminate accumulated doshas.',
  },
  {
    id: 'ashwagandha',
    source: 'Charaka Samhita, Sutrasthana 25.40',
    category: 'herbs',
    keywords: ['ashwagandha', 'withania', 'adaptogen', 'stress', 'vata', 'anxiety', 'fatigue', 'nervine'],
    content:
      'Ashwagandha (Withania somnifera) — Rasayana and Balya (strength-promoting) herb. Balances Vata and Kapha, pacifies the nervous system, promotes Ojas. Classical dose: 3–6g root powder with warm milk. Used for anxiety, fatigue, sexual debility, and neuromuscular disorders. Also known as Indian Ginseng.',
  },
  {
    id: 'triphala',
    source: 'Ashtanga Hridayam, Uttarasthana 40.5',
    category: 'herbs',
    keywords: ['triphala', 'amalaki', 'haritaki', 'bibhitaki', 'digestion', 'constipation', 'tridoshic'],
    content:
      'Triphala (Amalaki, Haritaki, Bibhitaki) — most versatile Ayurvedic formula, balancing all three doshas. Acts as Tridoshic Rasayana, bowel regulator, antioxidant, and rejuvenative. Safe for long-term use. Dose: 3–6g powder in warm water before sleep.',
  },
  {
    id: 'turmeric',
    source: 'Sushruta Samhita, Sutrasthana 46.3',
    category: 'herbs',
    keywords: ['turmeric', 'haridra', 'curcumin', 'inflammation', 'pitta', 'kapha', 'anti-inflammatory'],
    content:
      'Haridra (Turmeric/Curcuma longa) — Lekhaniya (scraping), Kusthaghna (skin disease), Varnya (complexion). Reduces excess Pitta and Kapha, purifies blood, reduces Ama, anti-inflammatory and antimicrobial. Best absorbed with black pepper (Maricham) and fat (ghee).',
  },
  {
    id: 'brahmi',
    source: 'Charaka Samhita, Sutrasthana 4.18',
    category: 'herbs',
    keywords: ['brahmi', 'bacopa', 'memory', 'cognition', 'pitta', 'medhya', 'stress', 'brain'],
    content:
      "Brahmi (Bacopa monnieri) — premier Medhya Rasayana (brain tonic). Enhances memory, reduces anxiety, calms excess Pitta. Part of Charaka's Medhya Rasayana protocol for cognitive enhancement. Classical use: 300–600mg extract or 3–6g powder with ghee.",
  },
  {
    id: 'vata-symptoms',
    source: 'Charaka Samhita, Sutrasthana 20.14',
    category: 'symptoms',
    keywords: ['vata', 'anxiety', 'insomnia', 'constipation', 'dry skin', 'cold', 'joint pain', 'fear'],
    content:
      'Vata imbalance signs: dry skin, constipation, gas, bloating, anxiety, insomnia, cold extremities, variable appetite, joint cracking, poor circulation, fear, and hypersensitivity. Vata is aggravated by irregular routine, cold food, excessive travel, stress, and the autumn/winter seasons.',
  },
  {
    id: 'pitta-symptoms',
    source: 'Charaka Samhita, Sutrasthana 20.15',
    category: 'symptoms',
    keywords: ['pitta', 'heartburn', 'acne', 'inflammation', 'anger', 'heat', 'acid reflux'],
    content:
      'Pitta imbalance signs: heartburn, acid reflux, inflammatory skin conditions (acne, rosacea), excessive heat, anger, irritability, loose stools, bleeding disorders, and sensitivity to heat. Pitta is aggravated by spicy/acidic foods, excessive sun exposure, competition, and summer months.',
  },
  {
    id: 'kapha-symptoms',
    source: 'Charaka Samhita, Sutrasthana 20.16',
    category: 'symptoms',
    keywords: ['kapha', 'weight gain', 'fatigue', 'congestion', 'lethargy', 'depression', 'water retention'],
    content:
      'Kapha imbalance signs: weight gain, fluid retention, congestion, sluggish digestion, depression, lethargy, excessive sleep, attachment, and greed. Kapha is aggravated by cold/heavy foods, sedentary lifestyle, excessive sleep, dairy, and spring/winter seasons.',
  },
  {
    id: 'dinacharya',
    source: 'Ashtanga Hridayam, Sutrasthana 2.1-20',
    category: 'lifestyle',
    keywords: ['dinacharya', 'daily routine', 'lifestyle', 'morning routine', 'abhyanga', 'yoga'],
    content:
      "Dinacharya (daily regimen): wake at Brahma Muhurta (96 min before sunrise), tongue scraping (Jihva Nirlekhana), oil pulling (Gandusha), self-massage with oil (Abhyanga), yoga and pranayama, followed by proper meals aligned with digestive capacity. Evening: light dinner before sunset, early sleep.",
  },
  {
    id: 'trikatu',
    source: 'Charaka Samhita, Sutrasthana 4.14',
    category: 'herbs',
    keywords: ['trikatu', 'ginger', 'black pepper', 'long pepper', 'agni', 'metabolism', 'digestive'],
    content:
      'Trikatu (Shunthi/ginger, Maricha/black pepper, Pippali/long pepper) — classical formula for kindling Agni. Enhances bioavailability of other herbs (Yogavahi), reduces Ama, and supports respiratory health. Contraindicated in high Pitta, peptic ulcer, and pregnancy.',
  },
  {
    id: 'shatavari',
    source: 'Charaka Samhita, Sutrasthana 25.49',
    category: 'herbs',
    keywords: ['shatavari', 'asparagus', 'female', 'hormones', 'pitta', 'vata', 'fertility', 'menstrual'],
    content:
      'Shatavari (Asparagus racemosus) — foremost female tonic and adaptogenic Rasayana. Balances Vata and Pitta, nourishes reproductive tissues (Shukra dhatu), and supports hormonal balance. Used for menstrual irregularities, menopause, lactation, and as a general rejuvenative.',
  },
  {
    id: 'rasa-panchaka',
    source: 'Charaka Samhita, Sutrasthana 26.2',
    category: 'nutrition',
    keywords: ['rasa', 'taste', 'sweet', 'sour', 'salt', 'pungent', 'bitter', 'astringent', 'diet'],
    content:
      'Rasa Panchaka (six tastes): Sweet (Madhura) — nourishes, heavy, cold; Sour (Amla) — appetizer, digestive; Salty (Lavana) — moistening, Pitta-aggravating; Pungent (Katu) — stimulates Agni, hot; Bitter (Tikta) — detoxifying, light, dry; Astringent (Kashaya) — binding, drying. Each taste has specific doshic effects.',
  },
  {
    id: 'amalaki',
    source: 'Charaka Samhita, Sutrasthana 25.20',
    category: 'herbs',
    keywords: ['amalaki', 'amla', 'vitamin c', 'rasayana', 'pitta', 'antioxidant', 'hair'],
    content:
      'Amalaki (Emblica officinalis / Indian Gooseberry) — highest natural source of Vitamin C, premier Pitta-pacifying Rasayana. Classified as Vayasthapana (age-arresting). Used in Chyawanprash formulation. Balances all three doshas but especially pacifies Pitta. Excellent for hair, skin, and immune health.',
  },
  {
    id: 'dhatus',
    source: 'Charaka Samhita, Sutrasthana 15.3',
    category: 'physiology',
    keywords: ['dhatu', 'tissue', 'rasa', 'rakta', 'mamsa', 'meda', 'asthi', 'majja', 'shukra'],
    content:
      'Seven Dhatus (body tissues): Rasa (plasma/lymph), Rakta (blood), Mamsa (muscle), Meda (fat/adipose), Asthi (bone), Majja (bone marrow/nerve), Shukra/Artava (reproductive tissue). Each dhatu is formed sequentially from food, taking approximately 5 days per transformation.',
  },
];

/**
 * Retrieve relevant knowledge chunks for a query using keyword scoring
 * @param {string} query - User query
 * @param {number} topK - Number of chunks to return
 * @returns {Array} Scored and ranked knowledge chunks
 */
export function retrieveContext(query, topK = 4) {
  const q = query.toLowerCase();
  const scored = KNOWLEDGE_BASE.map(chunk => {
    let score = 0;
    for (const kw of chunk.keywords) {
      if (q.includes(kw)) score += 3;
    }
    const words = q.split(/\s+/);
    for (const w of words) {
      if (w.length > 3 && chunk.content.toLowerCase().includes(w)) score += 1;
      if (w.length > 3 && chunk.category.includes(w)) score += 2;
    }
    return { ...chunk, score };
  });
  return scored
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Build a RAG context string from retrieved chunks
 * @param {Array} chunks - Retrieved knowledge chunks
 * @returns {string} Formatted context string for injection into prompts
 */
export function buildRAGContext(chunks) {
  if (!chunks.length) return '';
  return (
    '\n\n--- RETRIEVED KNOWLEDGE BASE (use these for accurate, grounded answers) ---\n' +
    chunks.map(c => `[${c.source}]\n${c.content}`).join('\n\n') +
    '\n--- END KNOWLEDGE BASE ---'
  );
}
