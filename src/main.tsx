import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { mainnet, polygon, base, sepolia } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { InjectedConnector } from 'wagmi/connectors/injected';
import './index.css';
import App from './App';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, base, polygon, sepolia],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        const fallback = chain.rpcUrls.public?.http?.[0] ?? chain.rpcUrls.default?.http?.[0];
        return fallback ? { http: fallback } : null;
      },
    }),
  ],
);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains, options: { shimDisconnect: true } }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Trust Wallet',
        shimDisconnect: true,
        getProvider: () => {
          if (typeof window === 'undefined') return undefined;
          const anyWindow = window as unknown as { ethereum?: any; trustwallet?: any };
          if (anyWindow.trustwallet) return anyWindow.trustwallet;
          const { ethereum } = anyWindow;
          if (ethereum?.providers?.length) {
            const trustProvider = ethereum.providers.find((p: any) => p.isTrust);
            return trustProvider ?? ethereum.providers[0];
          }
          if (ethereum?.isTrust) return ethereum;
          return ethereum;
        },
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiConfig>
  </StrictMode>,
);
