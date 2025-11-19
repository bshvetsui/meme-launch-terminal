// Main application component
import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Layout/Header';
import { TokenList } from './components/TokenList/TokenList';
import { TradingPanel } from './components/Trading/TradingPanel';
import { PriceChart } from './components/Charts/PriceChart';
import type { Token } from './types';
import { mockTokens } from './data/mockData';
import { wsManager } from './utils/websocket';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 1000, // 10 seconds
      refetchInterval: 30 * 1000, // 30 seconds
    },
  },
});

function App() {
  const [selectedToken] = useState<Token | null>(mockTokens[0]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Subscribe to WebSocket channels
    wsManager.subscribeToGlobalFeed();
    wsManager.subscribeToPriceUpdates();
    wsManager.subscribeToTrades();

    // Handle WebSocket events
    wsManager.on('priceUpdate', (data) => {
      console.log('Price update:', data);
    });

    wsManager.on('trade', (data) => {
      console.log('New trade:', data);
    });

    return () => {
      wsManager.disconnect();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-dark text-white">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1B23',
              color: '#fff',
              border: '1px solid #2A2B35',
            },
          }}
        />

        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden">
            <div className="fixed left-0 top-0 h-full w-64 bg-secondary p-4">
              <nav className="mt-16 space-y-4">
                <a href="#" className="block py-2 text-gray-300 hover:text-primary">Tokens</a>
                <a href="#" className="block py-2 text-gray-300 hover:text-primary">Launch</a>
                <a href="#" className="block py-2 text-gray-300 hover:text-primary">Portfolio</a>
                <a href="#" className="block py-2 text-gray-300 hover:text-primary">Rewards</a>
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="container mx-auto px-4 pt-20 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Token List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-effect rounded-lg p-4">
                  <p className="text-sm text-gray-400">Total Volume</p>
                  <p className="text-xl font-bold text-primary">$2.5M</p>
                </div>
                <div className="glass-effect rounded-lg p-4">
                  <p className="text-sm text-gray-400">Active Tokens</p>
                  <p className="text-xl font-bold text-success">156</p>
                </div>
                <div className="glass-effect rounded-lg p-4">
                  <p className="text-sm text-gray-400">Total Users</p>
                  <p className="text-xl font-bold text-warning">12.3K</p>
                </div>
                <div className="glass-effect rounded-lg p-4">
                  <p className="text-sm text-gray-400">TVL</p>
                  <p className="text-xl font-bold">$8.7M</p>
                </div>
              </div>

              {/* Token List */}
              <div className="glass-effect rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Live Tokens</h2>
                <TokenList />
              </div>

              {/* Price Chart */}
              {selectedToken && (
                <PriceChart tokenSymbol={selectedToken.symbol} />
              )}
            </div>

            {/* Right Column - Trading Panel */}
            <div className="space-y-6">
              <TradingPanel token={selectedToken} />

              {/* Recent Trades */}
              <div className="glass-effect rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">Recent Trades</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-success">BUY</span>
                      <span className="text-gray-400">2.5 SOL</span>
                    </div>
                    <span className="text-gray-400 text-xs">2 min ago</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-danger">SELL</span>
                      <span className="text-gray-400">1.8 SOL</span>
                    </div>
                    <span className="text-gray-400 text-xs">5 min ago</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-success">BUY</span>
                      <span className="text-gray-400">5.0 SOL</span>
                    </div>
                    <span className="text-gray-400 text-xs">8 min ago</span>
                  </div>
                </div>
              </div>

              {/* Trending Tokens */}
              <div className="glass-effect rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">🔥 Trending</h3>
                <div className="space-y-3">
                  {mockTokens.slice(0, 3).map((token) => (
                    <div key={token.token} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-success"></div>
                        <div>
                          <p className="text-sm font-medium">{token.symbol}</p>
                          <p className="text-xs text-gray-400">${token.price?.toFixed(6)}</p>
                        </div>
                      </div>
                      <div className={`text-sm ${
                        (token.priceChange24h || 0) >= 0 ? 'text-success' : 'text-danger'
                      }`}>
                        {(token.priceChange24h || 0) >= 0 ? '+' : ''}{token.priceChange24h?.toFixed(2)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
