// Main app component with token table
import { useState, useEffect } from 'react';
import { TokenTable } from './components/TokenTable';
import { SearchBar } from './components/SearchBar';
import { LoginModal } from './components/LoginModal';
import { CreateTokenModal } from './components/CreateTokenModal';
import { useAuth } from './context/AuthContext';
import { tokenApi } from './services/api';
import { wsManager } from './services/websocket';
import type { Token } from './types';
import './App.css';

function App() {
  const { user, logout } = useAuth();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // Fetch initial tokens
    fetchTokens();

    // Connect WebSocket
    wsManager.connect();

    // Subscribe to updates
    wsManager.on('priceUpdate', handlePriceUpdate);
    wsManager.on('newToken', handleNewToken);
    wsManager.on('trade', handleTradeUpdate);

    // Refresh interval
    const interval = setInterval(fetchTokens, 30000);

    return () => {
      clearInterval(interval);
      wsManager.off('priceUpdate', handlePriceUpdate);
      wsManager.off('newToken', handleNewToken);
      wsManager.off('trade', handleTradeUpdate);
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
    setTokens(prev => prev.map(token => {
      if (token.token === update.token) {
        // Animate the price change with updated values
        const updatedToken = {
          ...token,
          price: update.price || token.price,
          priceChange24h: update.priceChange24h || token.priceChange24h,
          volume24h: update.volume24h || token.volume24h,
          marketCap: (update.price || token.price) * (token.supply || 1000000000),
          trades: (token.trades || 0) + 1,
        };
        return updatedToken;
      }
      return token;
    }));
  };

  const handleNewToken = (token: Token) => {
    // Add new token with animation effect
    const newToken = {
      ...token,
      createdAt: Date.now(),
      holders: 1,
      trades: 0,
      buys: 0,
    };
    setTokens(prev => [newToken, ...prev.slice(0, 99)]); // Keep max 100 tokens
  };

  const handleTradeUpdate = (trade: any) => {
    setTokens(prev => prev.map(token => {
      if (token.token === trade.token) {
        const isBuy = trade.side === 'buy';
        return {
          ...token,
          trades: (token.trades || 0) + 1,
          buys: (token.buys || 0) + (isBuy ? 1 : 0),
          volume24h: (token.volume24h || 0) + trade.amount,
          holders: isBuy ? (token.holders || 0) + 1 : token.holders,
          price: trade.price || token.price,
        };
      }
      return token;
    }));
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
          <button
            className="btn-create"
            onClick={() => user ? setShowCreateModal(true) : setShowLoginModal(true)}
          >
            Create Meme
          </button>
          {user ? (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ color: 'var(--primary)', fontSize: '14px' }}>
                {user.email}
              </span>
              <button className="btn-login" onClick={logout}>
                Logout
              </button>
            </div>
          ) : (
            <button className="btn-login" onClick={() => setShowLoginModal(true)}>
              Login
            </button>
          )}
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

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            setShowLoginModal(false);
            // Optionally refresh tokens after login
            fetchTokens();
          }}
        />
      )}

      {showCreateModal && (
        <CreateTokenModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newToken) => {
            setShowCreateModal(false);
            // Add the new token to the list
            setTokens(prev => [newToken, ...prev]);
          }}
        />
      )}
    </div>
  );
}

export default App;