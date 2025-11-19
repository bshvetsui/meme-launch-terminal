// Main app component with token table
import { useState, useEffect } from 'react';
import { TokenTable } from './components/TokenTable';
import { SearchBar } from './components/SearchBar';
import { tokenApi } from './services/api';
import { wsManager } from './services/websocket';
import type { Token } from './types';
import './App.css';

function App() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch initial tokens
    fetchTokens();

    // Connect WebSocket
    wsManager.connect();

    // Subscribe to updates
    wsManager.on('priceUpdate', handlePriceUpdate);
    wsManager.on('newToken', handleNewToken);

    // Refresh interval
    const interval = setInterval(fetchTokens, 30000);

    return () => {
      clearInterval(interval);
      wsManager.disconnect();
    };
  }, []);

  const fetchTokens = async () => {
    try {
      const data = await tokenApi.getTokens();
      setTokens(data);
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceUpdate = (update: any) => {
    setTokens(prev => prev.map(token =>
      token.token === update.token
        ? { ...token, ...update }
        : token
    ));
  };

  const handleNewToken = (token: Token) => {
    setTokens(prev => [token, ...prev]);
  };

  const filteredTokens = tokens.filter(token =>
    searchQuery === '' ||
    token.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">🚀</span>
          <span className="logo-text">LAUNCH MEME</span>
        </div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
        />

        <div className="header-actions">
          <button className="btn-create">Create Meme</button>
          <button className="btn-login">Login</button>
        </div>
      </header>

      <main className="app-main">
        <div className="social-links">
          <a href="#" className="social-link">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Mentions on X
          </a>
        </div>

        <TokenTable
          tokens={filteredTokens}
          loading={loading}
        />
      </main>
    </div>
  );
}

export default App;