// WebSocket manager for Centrifuge
import { Centrifuge, Subscription } from 'centrifuge';

const WS_URL = 'wss://launch.meme/connection/websocket';
const WS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJpYXQiOjE3NTcxNjY4ODh9.VEvlNmvIFS3ARM5R0jlNN4fwDDRz94WnKv8LDmtipNE';

class WebSocketManager {
  private centrifuge: Centrifuge | null = null;
  private subscriptions: Map<string, Subscription> = new Map();
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private isConnecting = false;

  connect() {
    if (this.centrifuge || this.isConnecting) return;

    this.isConnecting = true;

    try {
      this.centrifuge = new Centrifuge(WS_URL, {
        token: WS_TOKEN,
      });

      this.centrifuge.on('connected', ctx => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.emit('connected', ctx);
        this.subscribeToChannels();
      });

      this.centrifuge.on('disconnected', ctx => {
        console.log('WebSocket disconnected');
        this.isConnecting = false;
        this.emit('disconnected', ctx);
      });

      this.centrifuge.connect();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
    }
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
    this.subscriptions.forEach(sub => {
      try {
        sub.unsubscribe();
      } catch (e) {}
    });
    this.subscriptions.clear();

    if (this.centrifuge) {
      this.centrifuge.disconnect();
      this.centrifuge = null;
    }
  }
}

export const wsManager = new WebSocketManager();
