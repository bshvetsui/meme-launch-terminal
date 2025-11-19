import { useEffect } from 'react';
import { wsManager } from '../services/websocket';
import type { Token } from '../types';

interface UseWebSocketProps {
  onPriceUpdate: (update: any) => void;
  onNewToken: (token: Token) => void;
  onTradeUpdate: (trade: any) => void;
}

export const useWebSocket = ({
  onPriceUpdate,
  onNewToken,
  onTradeUpdate
}: UseWebSocketProps) => {
  useEffect(() => {
    // Connect WebSocket
    wsManager.connect();

    // Subscribe to updates
    wsManager.on('priceUpdate', onPriceUpdate);
    wsManager.on('newToken', onNewToken);
    wsManager.on('trade', onTradeUpdate);

    return () => {
      wsManager.off('priceUpdate', onPriceUpdate);
      wsManager.off('newToken', onNewToken);
      wsManager.off('trade', onTradeUpdate);
      wsManager.disconnect();
    };
  }, [onPriceUpdate, onNewToken, onTradeUpdate]);
};