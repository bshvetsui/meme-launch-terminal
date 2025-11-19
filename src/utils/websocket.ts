// WebSocket manager for Centrifuge connection
import { Centrifuge } from 'centrifuge';

const WS_URL = 'wss://launch.meme/connection/websocket';
const WS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJpYXQiOjE3NTcxNjY4ODh9.VEvlNmvIFS3ARM5R0jlNN4fwDDRz94WnKv8LDmtipNE';

export interface PriceUpdate {
  token: string;
  price: number;
  volume: number;
  timestamp: number;
}

export interface TradeUpdate {
  token: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  wallet: string;
  timestamp: number;
}

class WebSocketManager {
  private centrifuge: Centrifuge | null = null;
  private subscriptions: Map<string, any> = new Map();
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    this.connect();
  }

  private connect() {
    this.centrifuge = new Centrifuge(WS_URL, {
      token: WS_TOKEN,
    });

    this.centrifuge.on('connecting', (ctx) => {
      console.log('Connecting to WebSocket...', ctx);
    });

    this.centrifuge.on('connected', (ctx) => {
      console.log('Connected to WebSocket', ctx);
      this.emit('connected', ctx);
    });

    this.centrifuge.on('disconnected', (ctx) => {
      console.log('Disconnected from WebSocket', ctx);
      this.emit('disconnected', ctx);
    });

    this.centrifuge.on('error', (ctx) => {
      console.error('WebSocket error:', ctx);
      this.emit('error', ctx);
    });

    this.centrifuge.connect();
  }

  public subscribeToToken(tokenAddress: string) {
    if (!this.centrifuge) return;

    const channelName = `token:${tokenAddress}`;

    if (this.subscriptions.has(channelName)) {
      return this.subscriptions.get(channelName);
    }

    const subscription = this.centrifuge.newSubscription(channelName);

    subscription.on('publication', (ctx) => {
      this.emit(`token:${tokenAddress}`, ctx.data);
      this.emit('tokenUpdate', { token: tokenAddress, data: ctx.data });
    });

    subscription.on('subscribing', () => {
      console.log(`Subscribing to ${channelName}...`);
    });

    subscription.on('subscribed', () => {
      console.log(`Subscribed to ${channelName}`);
    });

    subscription.on('unsubscribed', () => {
      console.log(`Unsubscribed from ${channelName}`);
      this.subscriptions.delete(channelName);
    });

    subscription.on('error', (ctx) => {
      console.error(`Error in subscription ${channelName}:`, ctx);
    });

    subscription.subscribe();
    this.subscriptions.set(channelName, subscription);

    return subscription;
  }

  public subscribeToGlobalFeed() {
    if (!this.centrifuge) return;

    const channelName = 'global';

    if (this.subscriptions.has(channelName)) {
      return this.subscriptions.get(channelName);
    }

    const subscription = this.centrifuge.newSubscription(channelName);

    subscription.on('publication', (ctx) => {
      this.emit('global', ctx.data);
    });

    subscription.subscribe();
    this.subscriptions.set(channelName, subscription);

    return subscription;
  }

  public subscribeToPriceUpdates() {
    if (!this.centrifuge) return;

    const channelName = 'prices';

    if (this.subscriptions.has(channelName)) {
      return this.subscriptions.get(channelName);
    }

    const subscription = this.centrifuge.newSubscription(channelName);

    subscription.on('publication', (ctx) => {
      this.emit('priceUpdate', ctx.data);
    });

    subscription.subscribe();
    this.subscriptions.set(channelName, subscription);

    return subscription;
  }

  public subscribeToTrades() {
    if (!this.centrifuge) return;

    const channelName = 'trades';

    if (this.subscriptions.has(channelName)) {
      return this.subscriptions.get(channelName);
    }

    const subscription = this.centrifuge.newSubscription(channelName);

    subscription.on('publication', (ctx) => {
      this.emit('trade', ctx.data);
    });

    subscription.subscribe();
    this.subscriptions.set(channelName, subscription);

    return subscription;
  }

  public unsubscribe(channelName: string) {
    const subscription = this.subscriptions.get(channelName);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(channelName);
    }
  }

  public on(event: string, callback: (data: any) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)?.add(callback);
  }

  public off(event: string, callback: (data: any) => void) {
    this.eventListeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.eventListeners.get(event)?.forEach(callback => callback(data));
  }

  public disconnect() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions.clear();
    this.centrifuge?.disconnect();
    this.centrifuge = null;
  }

  public reconnect() {
    this.disconnect();
    this.connect();
  }

  public isConnected() {
    return this.centrifuge?.state === 'connected';
  }
}

export const wsManager = new WebSocketManager();