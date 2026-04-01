import { AppProvider, useApp } from './hooks/useApp';
import Nav from './components/Nav';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import PrakritiPage from './pages/PrakritiPage';
import SymptomsPage from './pages/SymptomsPage';
import NERPage from './pages/NERPage';
import HerbsPage from './pages/HerbsPage';
import SentimentPage from './pages/SentimentPage';
import FormulaPage from './pages/FormulaPage';
import SummarizerPage from './pages/SummarizerPage';
import SettingsPage from './pages/SettingsPage';
import './styles/globals.css';

const PAGE_MAP = {
  home: HomePage,
  chat: ChatPage,
  prakriti: PrakritiPage,
  symptoms: SymptomsPage,
  ner: NERPage,
  herbs: HerbsPage,
  sentiment: SentimentPage,
  formula: FormulaPage,
  summarizer: SummarizerPage,
  settings: SettingsPage,
};

function AppInner() {
  const { currentPage } = useApp();
  const ActivePage = PAGE_MAP[currentPage] || HomePage;
  return (
    <>
      <Nav />
      <main>
        <ActivePage />
      </main>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
