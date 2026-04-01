// AyurMind — Static Ayurvedic Data

export const DOSHAS = [
  {
    name: 'Vata',
    key: 'vata',
    element: 'Air · Ether',
    emoji: '🌬',
    color: 'var(--vata)',
    description: 'Governs all movement in body and mind — nerve impulses, circulation, respiration, and elimination.',
    traits: ['Movement', 'Creativity', 'Speed', 'Dryness'],
    imbalance_signs: ['Anxiety', 'Insomnia', 'Constipation', 'Dry skin', 'Cold extremities', 'Joint pain'],
    aggravated_by: ['Irregular routine', 'Cold food', 'Excessive travel', 'Stress'],
    classical_ref: 'Charaka Samhita, Sutrasthana 20.14',
  },
  {
    name: 'Pitta',
    key: 'pitta',
    element: 'Fire · Water',
    emoji: '🔥',
    color: 'var(--pitta)',
    description: 'Controls digestion, metabolism, body temperature, and the capacity for transformation.',
    traits: ['Transformation', 'Intelligence', 'Heat', 'Intensity'],
    imbalance_signs: ['Heartburn', 'Acne', 'Anger', 'Inflammation', 'Loose stools', 'Excessive heat'],
    aggravated_by: ['Spicy food', 'Excessive sun', 'Competition', 'Alcohol'],
    classical_ref: 'Charaka Samhita, Sutrasthana 20.15',
  },
  {
    name: 'Kapha',
    key: 'kapha',
    element: 'Earth · Water',
    emoji: '🌿',
    color: 'var(--kapha)',
    description: "Provides the body's mass, strength, immune resistance, and the emotional qualities of love and patience.",
    traits: ['Structure', 'Stability', 'Nourishment', 'Lubrication'],
    imbalance_signs: ['Weight gain', 'Congestion', 'Depression', 'Lethargy', 'Excessive sleep', 'Water retention'],
    aggravated_by: ['Cold/heavy foods', 'Sedentary lifestyle', 'Excessive sleep', 'Dairy'],
    classical_ref: 'Charaka Samhita, Sutrasthana 20.16',
  },
];

export const CLASSICAL_TEXTS = [
  {
    name: 'Charaka Samhita',
    author: 'Charaka',
    period: '~600 BCE',
    focus: 'Internal medicine (Kayachikitsa)',
    sections: ['Sutrasthana', 'Nidanasthana', 'Vimanasthana', 'Sharirasthana', 'Indriyasthana', 'Chikitsasthana', 'Kalpasthana', 'Siddhisthana'],
  },
  {
    name: 'Sushruta Samhita',
    author: 'Sushruta',
    period: '~600 BCE',
    focus: 'Surgery (Shalya Tantra)',
    sections: ['Sutrasthana', 'Nidanasthana', 'Sharirasthana', 'Chikitsasthana', 'Kalpasthana', 'Uttarasthana'],
  },
  {
    name: 'Ashtanga Hridayam',
    author: 'Vagbhata',
    period: '~7th century CE',
    focus: 'Synthesis of the eight branches of Ayurveda',
    sections: ['Sutrasthana', 'Sharirasthana', 'Nidanasthana', 'Chikitsasthana', 'Kalpasiddhisthana', 'Uttarasthana'],
  },
];

export const SYMPTOM_CHIPS = [
  'Anxiety', 'Dry skin', 'Insomnia', 'Constipation', 'Bloating', 'Heartburn',
  'Acne', 'Irritability', 'Fatigue', 'Weight gain', 'Brain fog', 'Joint pain',
  'Hair loss', 'Low energy', 'Cold hands/feet', 'Mood swings', 'Loose stools',
  'Water retention', 'Depression', 'Poor memory', 'Congestion', 'Skin rash',
  'Headache', 'Frequent hunger', 'Excessive thirst',
];

export const FORMULA_GOALS = [
  'Stress & anxiety relief', 'Deep sleep & relaxation', 'Digestive support & Agni',
  'Immunity & Ojas building', 'Anti-inflammatory', 'Liver cleanse & detox',
  'Female hormonal balance', 'Male vitality & vigor', 'Cognitive enhancement',
  'Weight management', 'Skin health & glow', 'Joint & bone support',
  'Respiratory health', 'Heart & circulation', 'Blood sugar support',
];

export const CHAT_SUGGESTIONS = [
  'What is Prakriti and how do I know mine?',
  'Best herbs for anxiety and stress (Vata imbalance)',
  'Explain Agni and its role in health',
  'How does Panchakarma detoxification work?',
  'Morning Dinacharya routine for Pitta type',
  'What foods pacify Kapha dosha?',
  'Difference between Ojas, Tejas, and Prana',
  'Classical Ayurvedic treatment for insomnia',
  'What is Ama and how to reduce it?',
  'Best Rasayana herbs for longevity',
];

export const HERB_QUICK_SEARCHES = [
  { label: 'Stress & Anxiety', q: 'adaptogen stress relief anxiety nervine' },
  { label: 'Digestion & Agni', q: 'digestive fire Agni bloating gas' },
  { label: 'Anti-inflammatory', q: 'cooling Pitta inflammation joint pain' },
  { label: 'Sleep & Calm', q: 'sleep insomnia calming nervine Vata' },
  { label: 'Immunity & Ojas', q: 'immunity Ojas Rasayana vitality' },
  { label: 'Hair & Scalp', q: 'hair growth scalp thinning Pitta' },
  { label: 'Cognitive & Memory', q: 'Medhya brain memory cognition Brahmi' },
  { label: 'Female Health', q: 'female hormones menstrual Pitta Vata' },
  { label: 'Weight Management', q: 'Kapha weight management metabolism' },
  { label: 'Liver & Detox', q: 'liver detox Pitta Kapha cleansing' },
];

export const NER_ENTITY_STYLES = {
  herb:      { bg: 'rgba(74,122,90,0.2)',    text: '#8ACC7E',      border: 'rgba(74,122,90,0.35)',      icon: '🌿', label: 'Herb' },
  dosha:     { bg: 'rgba(201,160,90,0.15)',  text: 'var(--gold2)', border: 'rgba(201,160,90,0.3)',       icon: '⚡', label: 'Dosha' },
  symptom:   { bg: 'rgba(160,82,45,0.2)',    text: '#D4885A',      border: 'rgba(160,82,45,0.35)',       icon: '💊', label: 'Symptom/Disease' },
  treatment: { bg: 'rgba(123,143,187,0.2)',  text: '#9BA8C8',      border: 'rgba(123,143,187,0.3)',      icon: '🔬', label: 'Treatment' },
  food:      { bg: 'rgba(201,160,90,0.1)',   text: '#D4A85A',      border: 'rgba(201,160,90,0.2)',       icon: '🍲', label: 'Food/Diet' },
  concept:   { bg: 'rgba(160,80,160,0.15)',  text: '#C890C8',      border: 'rgba(160,80,160,0.25)',      icon: '◈', label: 'Concept' },
};

export const NER_SAMPLE_TEXT = `Ashwagandha (Withania somnifera) is a powerful Rasayana herb that balances Vata and Kapha doshas. It is commonly prescribed in Panchakarma therapy along with Shatavari to treat anxiety, chronic fatigue, and insomnia. According to Charaka Samhita, Triphala (combining Amalaki, Haritaki, and Bibhitaki) improves Agni and relieves constipation. Turmeric with warm ghee treats inflammation and joint pain. Brahmi (Bacopa monnieri) enhances memory and calms excess Pitta dosha, making it useful for stress-related cognitive decline.`;

export const SENTIMENT_SAMPLES = {
  review: `I've been using Triphala churna for two months for my digestive issues. The bloating after meals has significantly reduced and my bowel movements are more regular. The taste is very bitter but effective. I pair it with warm water at night as advised by my practitioner. Very satisfied overall.`,
  claim: `Boiling neem leaves and drinking the water every morning on an empty stomach will completely cure Type 2 diabetes within 30 days. This ancient Ayurvedic secret that doctors don't want you to know has been suppressed by the pharmaceutical industry for decades.`,
  text: `The concept of Agni or digestive fire is central to Ayurvedic medicine. According to Charaka Samhita, impaired Agni is the root cause of most diseases. Herbs like Trikatu — ginger, black pepper, and long pepper — are traditionally used to kindle Agni and improve metabolism.`,
};

export const SUMMARIZER_SAMPLES = {
  agni: `According to Charaka Samhita, the digestive fire (Agni) is considered the most important factor for health and disease. When Agni is functioning properly (Sama Agni), the digestion of food occurs naturally, leading to proper formation of all seven dhatus (tissues). The four types of Agni described are: Sama (balanced), Vishama (irregular, Vata-type), Tikshna (sharp, Pitta-type), and Manda (slow, Kapha-type). Impairment of Agni leads to the formation of Ama (undigested metabolic waste), which is considered the root cause of most diseases.`,
  ashwa: `Recent clinical trials have investigated the adaptogenic properties of Withania somnifera (Ashwagandha) in stress reduction. A 2019 double-blind placebo-controlled study found that ashwagandha root extract significantly reduced cortisol levels. In Ayurvedic tradition, Ashwagandha is classified as a Balya (strength-promoting) and Rasayana (rejuvenating) herb. The standard classical preparation involves boiling the root in milk (Ksheerapaka) to enhance absorption of fat-soluble withanolides.`,
  pseudo: `Miracle Ayurveda Detox Tea: Our special blend of exotic herbs from the Himalayas activates your body's natural ability to flush out 20 years of accumulated toxins in just 7 days! Customers report losing up to 30 pounds in one week, reversing diabetes, and curing cancer naturally. No diet or exercise needed — just drink 3 cups daily!`,
};
