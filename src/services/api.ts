// API service for launch.meme
import axios from 'axios';
import type { Token, Transaction } from '../types';

const API_BASE = 'https://launch.meme/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const tokenApi = {
  // Get list of tokens
  getTokens: async (): Promise<Token[]> => {
    try {
      const response = await api.post('/tokens');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
      // Return mock data if API fails
      return getMockTokens();
    }
  },

  // Get live tokens
  getLiveTokens: async (): Promise<Token[]> => {
    try {
      const response = await api.post('/tokens/live');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch live tokens:', error);
      return getMockTokens();
    }
  },

  // Get token transactions
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

// Import extended mock data
import { allMockTokens } from '../data/mockTokens';

// Mock data for development
function getMockTokens(): Token[] {
  return allMockTokens;
}