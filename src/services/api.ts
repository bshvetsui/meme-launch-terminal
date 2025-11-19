// Complete API service with all Swagger endpoints
import axios from 'axios';
import type { Token, Transaction, ChatMessage, Order, CreateOrderDto } from '../types';

const API_BASE = 'https://launch.meme/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// TOKEN endpoints
export const tokenApi = {
  createDraft: async (data: any) => {
    try {
      const response = await api.post('/tokens/draft', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create draft token:', error);
      throw error;
    }
  },

  signTokenTx: async (transaction: string, token: string) => {
    try {
      const response = await api.post('/sign-token-tx', { transaction, token });
      return response.data;
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      throw error;
    }
  },

  generateTokenTx: async (data: any) => {
    try {
      const response = await api.post('/generate-token-tx', data);
      return response.data;
    } catch (error) {
      console.error('Failed to generate transaction:', error);
      throw error;
    }
  },

  getTokens: async (): Promise<Token[]> => {
    try {
      const response = await api.post('/tokens');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
      return getMockTokens();
    }
  },

  getLiveTokens: async (): Promise<Token[]> => {
    try {
      const response = await api.post('/tokens/live');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch live tokens:', error);
      return getMockTokens();
    }
  },

  getTransactions: async (token: string): Promise<Transaction[]> => {
    try {
      const response = await api.post('/txs', { token });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      return [];
    }
  },
};

// CHAT endpoints
export const chatApi = {
  getMessages: async (token: string): Promise<ChatMessage[]> => {
    try {
      const response = await api.post('/chat', { token });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      return [];
    }
  },

  sendMessage: async (token: string, wallet: string, message: string) => {
    try {
      const response = await api.post('/chat', { token, wallet, message });
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },
};

// SIGN endpoint
export const signApi = {
  signMessage: async (wallet: string, message: string) => {
    try {
      const response = await api.post('/sign', { wallet, message });
      return response.data;
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  },
};

// USER endpoints
export const userApi = {
  getProfile: async () => {
    try {
      const response = await api.post('/profile');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      return null;
    }
  },

  updateProfile: async (data: any) => {
    try {
      const response = await api.post('/profile', data);
      return response.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  getPortfolio: async () => {
    try {
      const response = await api.post('/portfolio');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      return null;
    }
  },
};

// UPLOAD endpoint
export const uploadApi = {
  uploadFile: async (file?: string, metadata?: string) => {
    try {
      const response = await api.post('/upload', { file, metadata });
      return response.data;
    } catch (error) {
      console.error('Failed to upload:', error);
      throw error;
    }
  },
};

// REWARDS endpoint
export const rewardsApi = {
  getRewards: async (wallet: string) => {
    try {
      const response = await api.get(`/rewards?wallet=${wallet}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
      return { total: 0, data: [] };
    }
  },
};

// ORDERS endpoints
export const ordersApi = {
  createOrder: async (orderData: CreateOrderDto): Promise<Order> => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  },

  getOrderById: async (orderId: string): Promise<Order | null> => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch order:', error);
      return null;
    }
  },

  getOrdersByWallet: async (wallet: string): Promise<Order[]> => {
    try {
      const response = await api.get(`/orders/wallet/${wallet}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch wallet orders:', error);
      return [];
    }
  },

  getOrdersByToken: async (token: string): Promise<Order[]> => {
    try {
      const response = await api.get(`/orders/token/${token}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch token orders:', error);
      return [];
    }
  },

  getExpiredOrders: async (): Promise<Order[]> => {
    try {
      const response = await api.get('/orders/expired');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch expired orders:', error);
      return [];
    }
  },

  updateOrderStatus: async (orderId: string, data: any) => {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  },

  cancelOrder: async (orderId: string, wallet?: string) => {
    try {
      const response = await api.post(`/orders/${orderId}/cancel`, { wallet });
      return response.data;
    } catch (error) {
      console.error('Failed to cancel order:', error);
      throw error;
    }
  },
};

// WALLETS endpoints
export const walletsApi = {
  createWallet: async (data: any) => {
    try {
      const response = await api.post('/wallets', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create wallet:', error);
      throw error;
    }
  },

  getWallets: async () => {
    try {
      const response = await api.get('/wallets');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
      return [];
    }
  },

  getWalletByPublicKey: async (publicKey: string) => {
    try {
      const response = await api.get(`/wallets/${publicKey}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
      return null;
    }
  },

  updateWallet: async (publicKey: string, data: any) => {
    try {
      const response = await api.put(`/wallets/${publicKey}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update wallet:', error);
      throw error;
    }
  },

  deleteWallet: async (publicKey: string) => {
    try {
      const response = await api.delete(`/wallets/${publicKey}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete wallet:', error);
      throw error;
    }
  },

  setDefaultWallet: async (publicKey: string) => {
    try {
      const response = await api.post(`/wallets/${publicKey}/set-default`);
      return response.data;
    } catch (error) {
      console.error('Failed to set default wallet:', error);
      throw error;
    }
  },
};

// Import extended mock data
import { allMockTokens } from '../data/mockTokens';

// Mock data for development
function getMockTokens(): Token[] {
  return allMockTokens;
}