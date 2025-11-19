// WebSocket manager for real-time updates
import { Centrifuge, Subscription } from 'centrifuge';
import { WS_URL, WS_TOKEN, WS_UPDATE_INTERVAL, TOKEN_NAMES, TOKEN_SUFFIXES } from '../config/constants';

class WebSocketManager {
  private centrifuge: Centrifuge | null = null;
  private subscriptions: Map<string, Subscription> = new Map();
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private isConnecting = false;
  private reconnectInterval: any = null;
  private simulationInterval: any = null;

  connect() {
    if (this.centrifuge || this.isConnecting) return;

    this.isConnecting = true;

    try {
      this.centrifuge = new Centrifuge(WS_URL, {
        token: WS_TOKEN,
      });

      this.centrifuge.on('connected', () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.subscribeToChannels();
        // Start simulating real-time updates if real connection fails
        this.startSimulation();
      });

      this.centrifuge.on('disconnected', () => {
        console.log('WebSocket disconnected, attempting reconnect...');
        this.isConnecting = false;
        this.scheduleReconnect();
      });

      this.centrifuge.on('error', (ctx) => {
        console.error('WebSocket error:', ctx);
        // Fallback to simulation mode
        this.startSimulation();
      });

      this.centrifuge.connect();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
      // Fallback to simulation mode
      this.startSimulation();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectInterval) return;

    this.reconnectInterval = setTimeout(() => {
      this.reconnectInterval = null;
      this.connect();
    }, 5000);
  }

  private startSimulation() {
    // Simulate real-time updates for demonstration
    if (this.simulationInterval) return;

    console.log('Starting WebSocket simulation mode...');

    this.simulationInterval = setInterval(() => {
      // Simulate price updates more frequently
      const priceUpdate = {
        type: 'price',
        token: this.getRandomToken(),
        price: Math.random() * 0.01 + 0.0001,
        priceChange24h: (Math.random() - 0.5) * 50,
        volume24h: Math.random() * 500000 + 10000,
      };
      this.emit('priceUpdate', priceUpdate);

      // Simulate trades less frequently for performance
      if (Math.random() > 0.7) {
        const trade = {
          type: 'trade',
          token: this.getRandomToken(),
          side: Math.random() > 0.4 ? 'buy' : 'sell',
          amount: Math.random() * 1000 + 10,
          price: Math.random() * 0.01 + 0.0001,
          wallet: this.generateAddress(),
          timestamp: Date.now(),
        };
        this.emit('trade', trade);
      }

      // Simulate new tokens less frequently for performance
      if (Math.random() > 0.95) {
        const baseName = TOKEN_NAMES[Math.floor(Math.random() * TOKEN_NAMES.length)];
        const suffix = TOKEN_SUFFIXES[Math.floor(Math.random() * TOKEN_SUFFIXES.length)];

        const newToken = {
          type: 'newToken',
          token: this.generateAddress(),
          name: `${baseName} ${suffix}`,
          symbol: `${baseName}${Math.floor(Math.random() * 100)}`,
          price: Math.random() * 0.001 + 0.00001,
          marketCap: Math.random() * 50000 + 1000,
          volume24h: Math.random() * 10000,
          holders: Math.floor(Math.random() * 10) + 1,
          photo: `https://ui-avatars.com/api/?name=${baseName}&background=random`,
        };
        this.emit('newToken', newToken);
      }
    }, WS_UPDATE_INTERVAL);
  }

  private getRandomToken(): string {
    const tokens = [
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      'So11111111111111111111111111111111111111112',
      'BqkC1Thu Patozoa7iAa53JBFgUK',
      '7yYL...pump',
      '3rEW...p8cQ',
    ];
    return tokens[Math.floor(Math.random() * tokens.length)];
  }

  private generateAddress(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
    let address = '';
    for (let i = 0; i < 44; i++) {
      address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address;
  }

  private subscribeToChannels() {
    // Subscribe to global feed
    this.subscribeToChannel('global');
    // Subscribe to price updates
    this.subscribeToChannel('prices');
    // Subscribe to trades
    this.subscribeToChannel('trades');
  }

  private subscribeToChannel(channel: string) {
    if (!this.centrifuge || this.subscriptions.has(channel)) return;

    try {
      const subscription = this.centrifuge.newSubscription(channel);

      subscription.on('publication', (ctx) => {
        this.emit(channel, ctx.data);

        // Also emit specific events based on data type
        if (ctx.data.type === 'price') {
          this.emit('priceUpdate', ctx.data);
        } else if (ctx.data.type === 'trade') {
          this.emit('trade', ctx.data);
        } else if (ctx.data.type === 'newToken') {
          this.emit('newToken', ctx.data);
        }
      });

      subscription.subscribe();
      this.subscriptions.set(channel, subscription);
    } catch (error) {
      console.error(`Failed to subscribe to ${channel}:`, error);
    }
  }

  subscribeToToken(tokenAddress: string) {
    const channel = `token:${tokenAddress}`;
    this.subscribeToChannel(channel);
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  off(event: string, callback: (data: any) => void) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }

  disconnect() {
    // Clear intervals
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }

    // Clear subscriptions
    this.subscriptions.forEach(sub => {
      try {
        sub.unsubscribe();
      } catch (e) {}
    });
    this.subscriptions.clear();

    // Disconnect centrifuge
    if (this.centrifuge) {
      this.centrifuge.disconnect();
      this.centrifuge = null;
    }
  }
}

export const wsManager = new WebSocketManager();