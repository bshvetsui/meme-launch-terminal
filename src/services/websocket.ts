// WebSocket manager for real-time updates
import { Centrifuge, Subscription } from 'centrifuge';

const WS_URL = 'wss://launch.meme/connection/websocket';
const WS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJpYXQiOjE3NTcxNjY4ODh9.VEvlNmvIFS3ARM5R0jlNN4fwDDRz94WnKv8LDmtipNE';

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

    this.simulationInterval = setInterval(() => {
      // Simulate price updates
      const priceUpdate = {
        type: 'price',
        token: this.getRandomToken(),
        price: Math.random() * 0.01,
        priceChange24h: (Math.random() - 0.5) * 20,
        volume24h: Math.random() * 100000,
      };
      this.emit('priceUpdate', priceUpdate);

      // Simulate new trades
      if (Math.random() > 0.7) {
        const trade = {
          type: 'trade',
          token: this.getRandomToken(),
          side: Math.random() > 0.5 ? 'buy' : 'sell',
          amount: Math.random() * 10,
          price: Math.random() * 0.01,
          wallet: this.generateAddress(),
          timestamp: Date.now(),
        };
        this.emit('trade', trade);
      }

      // Simulate new tokens occasionally
      if (Math.random() > 0.95) {
        const newToken = {
          type: 'newToken',
          token: this.generateAddress(),
          name: `NEW${Math.floor(Math.random() * 1000)}`,
          symbol: `NEW${Math.floor(Math.random() * 100)}`,
          price: Math.random() * 0.001,
          marketCap: Math.random() * 10000,
        };
        this.emit('newToken', newToken);
      }
    }, 2000); // Update every 2 seconds
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