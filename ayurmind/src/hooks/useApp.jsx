import { createContext, useContext, useState, useEffect } from 'react';
import { storage, checkBackend } from '../utils/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [apiKey, setApiKeyState]       = useState(() => storage.get('apikey') || '');
  const [currentPage, setCurrentPage]  = useState('home');
  const [chatHistory, setChatHistory]  = useState([]);
  const [prakritiResult, setPrakritiResult] = useState(null);
  const [ragEnabled, setRagEnabledState]    = useState(() => storage.get('rag') !== false);
  const [backendOnline, setBackendOnline]   = useState(false);
  const [backendChecked, setBackendChecked] = useState(false);

  // Check backend availability on mount
  useEffect(() => {
    checkBackend().then(online => {
      setBackendOnline(online);
      setBackendChecked(true);
    });
  }, []);

  const setApiKey = (key) => {
    setApiKeyState(key);
    storage.set('apikey', key);
  };

  const setRagEnabled = (val) => {
    setRagEnabledState(val);
    storage.set('rag', val);
  };

  return (
    <AppContext.Provider value={{
      apiKey, setApiKey,
      currentPage, setCurrentPage,
      chatHistory, setChatHistory,
      prakritiResult, setPrakritiResult,
      ragEnabled, setRagEnabled,
      backendOnline, backendChecked,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
