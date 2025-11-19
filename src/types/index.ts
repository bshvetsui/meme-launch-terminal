// API Types based on Swagger schema
export interface Token {
  token: string;
  name: string;
  symbol: string;
  description?: string;
  decimals: number;
  supply: number;
  photo?: string;
  metadataUri?: string;
  hardcap: number;
  website?: string;
  x?: string;
  telegram?: string;
  version?: number;
  price?: number;
  priceChange24h?: number;
  volume24h?: number;
  marketCap?: number;
  holders?: number;
  liquidity?: number;
  createdAt?: number;
}

export interface Transaction {
  time: number;
  token: string;
  maker: string;
  side: number; // -1 for sell, 1 for buy
  sol: number;
  tokens: number;
  price: number;
  tx: string;
  block: number;
}

export interface ChatMessage {
  token: string;
  wallet: string;
  message: string;
  time: number;
}

export interface Order {
  orderId: string;
  wallet: string;
  token: string;
  side: 'buy' | 'sell';
  status: 'pending' | 'triggered' | 'executing' | 'executed' | 'failed' | 'cancelled' | 'expired';
  triggerPriceSol: number;
  triggerPriceUsd: number;
  amountSol: number;
  amountTokens?: number;
  slippagePercent: number;
  createdAt: number;
  updatedAt: number;
  triggeredAt?: number;
  executedAt?: number;
  expiresAt?: number;
  txSignature?: string;
  executedPriceSol?: number;
  executedPriceUsd?: number;
  executedAmountSol?: number;
  executedAmountTokens?: number;
  feeSol?: number;
  errorMessage?: string;
  executionAttempts: number;
  lastAttemptAt?: number;
  notes?: string;
}

export interface UserProfile {
  wallet: string;
  username?: string;
  avatar?: string;
  bio?: string;
  twitter?: string;
  telegram?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Portfolio {
  wallet: string;
  tokens: {
    token: string;
    balance: number;
    value: number;
    pnl: number;
    pnlPercentage: number;
  }[];
  totalValue: number;
  totalPnl: number;
}

export interface Reward {
  id: string;
  wallet: string;
  type: string;
  amount: number;
  description: string;
  timestamp: number;
  claimed: boolean;
}

export interface CreateOrderDto {
  wallet?: string;
  token: string;
  side: 'buy' | 'sell';
  orderType?: 'limit' | 'market';
  triggerPriceSol?: number;
  triggerPriceUsd?: number;
  amountSol: number;
  amountTokens?: number;
  slippagePercent?: number;
  expiresAt?: number;
  notes?: string;
  enableStopLoss?: boolean;
  enableTakeProfit?: boolean;
}