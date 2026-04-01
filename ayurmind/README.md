# 🌿 AyurMind — Ayurvedic Intelligence Platform

<div align="center">

![AyurMind Banner](https://img.shields.io/badge/AyurMind-v2.0-C9A05A?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNDOUEwNUEiLz48L3N2Zz4=)

**A RAG-powered NLP platform combining classical Ayurvedic texts with modern AI**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-F55036?style=flat-square)](https://groq.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Live Demo](#) · [Report Bug](issues) · [Request Feature](issues)

</div>

---

## 📖 Overview

AyurMind is an AI-powered Ayurvedic medicine platform that combines **Retrieval-Augmented Generation (RAG)** with classical Ayurvedic knowledge. It retrieves relevant excerpts from Charaka Samhita, Sushruta Samhita, and Ashtanga Hridayam to ground every AI response in authentic classical sources.

The platform features **8 specialized NLP modules** covering everything from Prakriti constitution analysis and Named Entity Recognition to claim verification and herbal formula generation.

---

## ✨ Features

### 🔬 NLP Modules

| Module | Description | NLP Approach |
|--------|-------------|--------------|
| **RAG Chat** | Conversational AI consultant grounded in classical texts | RAG + LLM |
| **Prakriti Analysis** | Constitution assessment via multi-question NLP | Structured NLP |
| **Symptom Analyzer** | Multi-label dosha imbalance detection | ML Classification |
| **NER Visualizer** | Named Entity Recognition with color-coded highlighting | Token Classification |
| **Herb Semantic Search** | Natural language search over Dravyaguna knowledge base | Semantic Search + RAG |
| **Sentiment & Intent NLP** | Sentiment analysis, intent detection, pseudoscience detection | Multi-label Classification |
| **Formula Builder** | Classical herbal formula generation (Bhaisajya Kalpana) | Generative AI |
| **Text Summarizer** | Key insight extraction with authenticity scoring | Extractive + Abstractive NLP |

### 🏛️ Classical Text Coverage (RAG Knowledge Base)

- **Charaka Samhita** — Internal medicine (Kayachikitsa), 17 embedded knowledge chunks
- **Sushruta Samhita** — Surgery (Shalya Tantra) and pharmacology
- **Ashtanga Hridayam** — Synthesis of all eight branches of Ayurveda
- **Dravyaguna Shastra** — Ayurvedic pharmacognosy (Rasa-Virya-Vipaka properties)

### 🧠 AI Architecture

```
User Query
    │
    ▼
┌─────────────────────────────────┐
│  RAG Retrieval Layer             │
│  • Keyword scoring               │
│  • Category matching             │
│  • Top-K chunk selection         │
└───────────────┬─────────────────┘
                │  Retrieved chunks
                ▼
┌─────────────────────────────────┐
│  Prompt Augmentation             │
│  • System prompt + RAG context   │
│  • Module-specific instructions  │
│  • JSON schema enforcement       │
└───────────────┬─────────────────┘
                │  Augmented prompt
                ▼
┌─────────────────────────────────┐
│  Groq API (Llama 3.3 70B)       │
│  • 128k context window           │
│  • ~300 tokens/sec inference     │
└───────────────┬─────────────────┘
                │  Structured JSON response
                ▼
       Parsed & Rendered UI
```

---

## 🗂️ Project Structure

```
ayurmind/
├── public/                    # Static assets
├── src/
│   ├── components/
│   │   ├── Nav.jsx            # Navigation bar with mobile support
│   │   └── UI.jsx             # Reusable UI components (Button, Card, Badge, etc.)
│   │
│   ├── data/
│   │   ├── constants.js       # Static data: doshas, symptoms, herb searches, samples
│   │   └── knowledgeBase.js   # RAG knowledge base + retrieve/build context functions
│   │
│   ├── hooks/
│   │   └── useApp.jsx         # Global app context (API key, RAG toggle, chat history)
│   │
│   ├── pages/
│   │   ├── HomePage.jsx       # Landing page with hero, dosha cards, feature grid
│   │   ├── ChatPage.jsx       # RAG-powered conversational AI chat
│   │   ├── PrakritiPage.jsx   # 5-question constitution analysis
│   │   ├── SymptomsPage.jsx   # Chip selector + free-text symptom analyzer
│   │   ├── NERPage.jsx        # Named entity recognition visualizer
│   │   ├── HerbsPage.jsx      # Semantic herb search with detail panel
│   │   ├── SentimentPage.jsx  # 3-mode sentiment/claim/NLP analysis
│   │   ├── FormulaPage.jsx    # Herbal formula builder with ingredient roles
│   │   ├── SummarizerPage.jsx # Text summarization with authenticity scoring
│   │   └── SettingsPage.jsx   # API key, RAG toggle, model info
│   │
│   ├── styles/
│   │   └── globals.css        # Design tokens, animations, base styles
│   │
│   ├── utils/
│   │   ├── api.js             # Groq API calls (groq, groqJSON), storage helpers
│   │   └── prompts.js         # All system prompts for each AI module
│   │
│   ├── App.jsx                # Root component — page routing
│   └── main.jsx               # React entry point
│
├── .env.example               # Environment variable template
├── .gitignore
├── index.html                 # Vite HTML entry point
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9+ or **pnpm** / **yarn**
- A free **Groq API key** from [console.groq.com](https://console.groq.com)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/ayurmind.git
cd ayurmind

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will open at **http://localhost:5173**

### Setting Your API Key

1. Open the app and click **Settings** (⚙ icon) in the top navigation
2. Paste your Groq API key in the input field
3. Click **Save Key**
4. Click **⚡ Test Connection** to verify

> **Note:** Your API key is stored only in your browser's `localStorage`. It is never sent to any server other than Groq's API directly from your browser.

### Build for Production

```bash
npm run build       # Outputs to /dist
npm run preview     # Preview the production build locally
```

---

## 🔑 API Key Setup

AyurMind uses the **Groq API** which provides free access to Llama 3.3 70B.

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up / log in (free)
3. Navigate to **API Keys** → **Create API Key**
4. Copy the key (starts with `gsk_...`)
5. Paste it in AyurMind Settings

**Free tier limits** (as of 2025): 6,000 requests/day, 100 requests/minute — more than enough for personal use.

---

## 🧩 Module Details

### 1. RAG-Powered Chat
- Full conversation history maintained across turns
- Every query retrieves top-3 relevant knowledge chunks from the 17-entry knowledge base
- Sources are displayed under each AI response
- RAG can be toggled on/off in Settings

### 2. Prakriti Analysis
- 5-question assessment covering: body frame, digestion, mind/sleep, speech/activity, skin/hair
- Returns Vata/Pitta/Kapha percentages with animated bar charts
- Provides diet tips, lifestyle guidance, herbs, foods to avoid, and seasonal advice
- Uses Ashta-vidha Pariksha methodology

### 3. Symptom Analyzer
- 23 quick-select symptom chips + free-text input
- Returns primary/secondary dosha imbalance with confidence scores
- Includes Ama (toxin) level assessment
- Herbal support recommendations with dosage
- Warning signs for when to seek medical care

### 4. NER Visualizer
- Color-coded highlighting for 6 entity types: Herb, Dosha, Symptom, Treatment, Food, Concept
- Confidence scoring per entity (high/medium/low)
- Authenticity score for the input text
- Grouped entity panel with classical reference extraction
- Sample text provided for testing

### 5. Herb Semantic Search
- 10 quick-search preset categories
- Two-panel layout: search results + detail drawer
- Per-herb detail includes classical shloka, preparation methods, Anupana, drug interactions
- Rasa-Virya-Vipaka properties displayed per herb

### 6. Sentiment & Intent Analysis
Three analysis modes:
- **Review Analysis** — Positive/negative/neutral breakdown with credibility assessment
- **Claim Verifier** — Verdict (authentic/pseudoscientific/unverifiable) with evidence grade A–D
- **General NLP** — Intent detection, tone analysis, theme extraction, dosha focus

### 7. Formula Builder
- Select up to 4 therapeutic goals from 15 options
- Optional: specify current dosha imbalance and Prakriti
- Output includes ingredient ratios with classical roles (Pradhana/Sahayaka/Anupana/Prakshepa)
- Preparation method, dosage, Anupana, indications, and contraindications

### 8. Text Summarizer
- 3 sample texts (classical, modern research, pseudoscientific) for testing
- Returns: main concepts, dosha context, classical references, herbs, key treatments
- Text type classification + authenticity score with progress bar
- Actionable insights extracted and ranked

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18 | UI framework |
| Vite | 5 | Build tool + dev server |
| Groq API | — | LLM inference (Llama 3.3 70B) |
| CSS Variables | — | Design tokens & theming |
| localStorage | — | API key + history persistence |

**No backend required.** All AI calls go directly from the browser to the Groq API.

---

## 🎨 Design System

| Token | Value | Use |
|-------|-------|-----|
| `--gold` | `#C9A05A` | Primary accent, interactive elements |
| `--vata` | `#7B8FBB` | Vata dosha indicators |
| `--pitta` | `#C47848` | Pitta dosha indicators |
| `--kapha` | `#4A7A5A` | Kapha dosha indicators |
| `--bg` | `#09080A` | Base background |
| `--text` | `#F0E8D8` | Primary text |

**Fonts:** Cormorant Garamond (display) + DM Sans (body) + DM Mono (code/labels)

---

## 🔧 Configuration

### Adding Knowledge Base Entries

Edit `src/data/knowledgeBase.js` to add new knowledge chunks:

```js
{
  id: 'unique-id',
  source: 'Charaka Samhita, Sutrasthana X.Y',
  category: 'herbs|doshas|symptoms|treatment|lifestyle|nutrition',
  keywords: ['keyword1', 'keyword2'],
  content: 'Text content for RAG retrieval...',
}
```

### Modifying System Prompts

All AI instructions are centralized in `src/utils/prompts.js`. Each module has its own exported prompt function/string.

### Adding a New Page

1. Create `src/pages/YourPage.jsx`
2. Add it to `PAGE_MAP` in `src/App.jsx`
3. Add a nav entry in `src/components/Nav.jsx`

---

## 📚 Ayurvedic References

This project draws from three principal classical texts:

- **Charaka Samhita** — The foundational text on internal medicine (~600 BCE), attributed to Acharya Charaka. Covers Prakriti, Agni, Tridosha, Dravyaguna, and treatment protocols.
- **Sushruta Samhita** — The surgical treatise (~600 BCE), attributed to Sushruta. Also covers anatomy, pharmacology, and classification of diseases.
- **Ashtanga Hridayam** — The 7th century synthesis by Vagbhata, integrating all eight branches (Ashtangas) of Ayurveda into a single comprehensive work.

> ⚕️ **Medical Disclaimer:** AyurMind is an educational tool only. The information provided does not constitute medical advice and is not intended to diagnose, treat, cure, or prevent any disease. Always consult a qualified healthcare professional or certified Vaidya for medical concerns.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get involved:

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
# Make your changes
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# Open a Pull Request
```

### Areas to Contribute

- 🌿 **Expand the knowledge base** — Add more classical text excerpts
- 🔍 **Improve RAG retrieval** — Implement embedding-based semantic search
- 🌐 **Multilingual support** — Add Hindi, Sanskrit, Tamil interfaces
- 📊 **Analytics dashboard** — User query patterns and dosha statistics
- 🧪 **Testing** — Unit tests for RAG retrieval and prompt parsing
- 📱 **PWA support** — Offline capability for the knowledge base

---

## 📋 Roadmap

- [ ] **Vector embeddings** — Replace keyword scoring with proper semantic embeddings (e.g., using Nomic Embed)
- [ ] **Expanded knowledge base** — 100+ classical text chunks across all 8 branches
- [ ] **User accounts** — Save Prakriti results and chat history
- [ ] **Multilingual NER** — Sanskrit and Devanagari entity recognition
- [ ] **Herb image search** — Visual identification integration
- [ ] **Pulse diagnosis (Nadi Pariksha)** — Interactive learning module
- [ ] **REST API** — Expose NLP endpoints for developers

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- Classical Ayurvedic scholars and the living tradition of Ayurvedic medicine
- [Groq](https://groq.com) for ultra-fast LLM inference
- [Meta AI](https://ai.meta.com) for the Llama 3.3 70B model
- The open-source React and Vite communities

---

<div align="center">

Made with 🌿 and ancient wisdom

**[⬆ Back to Top](#-ayurmind--ayurvedic-intelligence-platform)**

</div>
