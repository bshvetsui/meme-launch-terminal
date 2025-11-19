// API utilities for interacting with launch.meme API
import axios from 'axios';
import type { Token, Transaction, ChatMessage, Order, CreateOrderDto } from '../types';

const API_BASE_URL = 'https://launch.meme/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token API endpoints
export const tokenApi = {
  getDraftToken: async (data: any) => {
    const response = await api.post('/tokens/draft', data);
    return response.data;
  },

  getTokens: async () => {
    const response = await api.post<Token[]>('/tokens');
    return response.data;
  },

  getLiveTokens: async () => {
    const response = await api.post<Token[]>('/tokens/live');
    return response.data;
  },

  getTransactions: async (token: string) => {
    const response = await api.post<Transaction[]>('/txs', { token });
    return response.data;
  },

  signTokenTx: async (transaction: string, token: string) => {
    const response = await api.post('/sign-token-tx', { transaction, token });
    return response.data;
  },

  generateTokenTx: async (data: any) => {
    const response = await api.post('/generate-token-tx', data);
    return response.data;
  },
};

// Chat API endpoints
export const chatApi = {
  getMessages: async (token: string) => {
    const response = await api.post<ChatMessage[]>('/chat', { token });
    return response.data;
  },

  sendMessage: async (token: string, wallet: string, message: string) => {
    const response = await api.post('/chat', { token, wallet, message });
    return response.data;
  },
};

// Order API endpoints
export const orderApi = {
  createOrder: async (orderData: CreateOrderDto) => {
    const response = await api.post<Order>('/orders', orderData);
    return response.data;
  },

  getOrderById: async (orderId: string) => {
    const response = await api.get<Order>(`/orders/${orderId}`);
    return response.data;
  },

  getOrdersByWallet: async (wallet: string) => {
    const response = await api.get<Order[]>(`/orders/wallet/${wallet}`);
    return response.data;
  },

  getOrdersByToken: async (token: string) => {
    const response = await api.get<Order[]>(`/orders/token/${token}`);
    return response.data;
  },

  cancelOrder: async (orderId: string, wallet?: string) => {
    const response = await api.post(`/orders/${orderId}/cancel`, { wallet });
    return response.data;
  },
};

// User API endpoints
export const userApi = {
  getProfile: async () => {
    const response = await api.post('/profile');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.post('/profile', data);
    return response.data;
  },

  getPortfolio: async () => {
    const response = await api.post('/portfolio');
    return response.data;
  },

  getRewards: async (wallet: string) => {
    const response = await api.get(`/rewards?wallet=${wallet}`);
    return response.data;
  },
};

// Wallet API endpoints
export const walletApi = {
  createWallet: async (data: any) => {
    const response = await api.post('/wallets', data);
    return response.data;
  },

  getWallets: async () => {
    const response = await api.get('/wallets');
    return response.data;
  },

  getWalletByPublicKey: async (publicKey: string) => {
    const response = await api.get(`/wallets/${publicKey}`);
    return response.data;
  },

  updateWallet: async (publicKey: string, data: any) => {
    const response = await api.put(`/wallets/${publicKey}`, data);
    return response.data;
  },

  deleteWallet: async (publicKey: string) => {
    const response = await api.delete(`/wallets/${publicKey}`);
    return response.data;
  },

  setDefaultWallet: async (publicKey: string) => {
    const response = await api.post(`/wallets/${publicKey}/set-default`);
    return response.data;
  },
};

// Sign message endpoint
export const signMessage = async (wallet: string, message: string) => {
  const response = await api.post('/sign', { wallet, message });
  return response.data;
};

// Upload to IPFS endpoint
export const uploadToIPFS = async (file?: string, metadata?: string) => {
  const response = await api.post('/upload', { file, metadata });
  return response.data;
};