// API service for launch.meme
import axios from 'axios';
import type { Token, Transaction } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

const toNumber = (value: any) => {
  if (value === null || value === undefined) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const normalizeTokens = (payload: any): Token[] => {
  // API sometimes returns an array, sometimes an object keyed by token address.
  const rawList: any[] = Array.isArray(payload)
    ? payload
    : payload?.tokens
      ? Object.values(payload.tokens)
      : [];

  return rawList.map((item: any) => {
    const priceUsd = toNumber(item.priceUsd ?? item.price);
    const volumeUsd =
      toNumber(item.volumeUsd ?? item.volume24h ?? item.volume30sUsd ?? item.volume) ?? 0;
    const marketCap = toNumber(item.marketCapUsd ?? item.marketCap ?? item.mcap ?? item.mc);
    const createdAt =
      typeof item.createdAt === 'string' || typeof item.createdAt === 'number'
        ? new Date(item.createdAt).getTime()
        : typeof item.mint_time === 'number'
          ? item.mint_time
          : Date.now();

    return {
      token: item.token ?? item.address ?? '',
      name: item.name ?? item.symbol ?? 'Token',
      symbol: item.symbol ?? item.ticker ?? 'TKN',
      description: item.description,
      decimals: item.decimals ?? 9,
      supply: item.supply ?? 0,
      photo: item.photo ?? item.logo,
      metadataUri: item.metadataUri,
      hardcap: toNumber(item.hardcap ?? item.hardCap ?? 0) ?? 0,
      website: item.website,
      x: item.x,
      telegram: item.telegram,
      version: item.version,
      price: priceUsd,
      priceChange24h: toNumber(item.priceChange24h ?? item.change24h ?? item.change),
      volume24h: volumeUsd,
      marketCap,
      holders: item.holders ?? item.holdersCount,
      liquidity: toNumber(item.liquidity ?? item._balanceSol),
      createdAt,
      creator: item.creator,
      raised: toNumber(item.progressSol ?? item.progress) ?? 0,
      trades: item.txCount,
      buys: item.buys,
      sells: item.sells,
    } as Token;
  });
};

const fetchWithFetchApi = async (path: string): Promise<any> => {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status}`);
  }
  return res.json();
};

export const tokenApi = {
  // Get list of tokens
  getTokens: async (): Promise<Token[]> => {
    try {
      const response = await api.post('/tokens');
      return normalizeTokens(response.data);
    } catch (error) {
      console.error('Failed to fetch tokens via axios:', error);
      try {
        const data = await fetchWithFetchApi('/tokens');
        return normalizeTokens(data);
      } catch (fallbackError) {
        console.error('Failed to fetch tokens via fetch:', fallbackError);
      }
      // Return mock data if API fails
      return getMockTokens();
    }
  },

  // Get live tokens
  getLiveTokens: async (): Promise<Token[]> => {
    try {
      const response = await api.post('/tokens/live');
      const normalized = normalizeTokens(response.data);
      if (normalized.length === 0) {
        // Fallback to full list if live feed is empty
        return await tokenApi.getTokens();
      }
      return normalized;
    } catch (error) {
      console.error('Failed to fetch live tokens:', error);
      // Fallback to main list if live endpoint is down
      try {
        return await tokenApi.getTokens();
      } catch {
        return getMockTokens();
      }
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

// Mock data for development
function getMockTokens(): Token[] {
  return [
    {
      token: 'AvAc...vCTB',
      name: 'BEATCOIN / Beatcoin',
      symbol: 'BEATCOIN',
      decimals: 9,
      supply: 1000000000,
      photo: 'https://ui-avatars.com/api/?name=BEATCOIN&background=random',
      hardcap: 85,
      price: 0.0000656,
      priceChange24h: 15.33,
      volume24h: 656,
      marketCap: 4300,
      holders: 1,
      raised: 50.42,
      createdAt: Date.now() - 1000,
      creator: '9xCr...x$R3',
      trades: 1,
      buys: 0,
    },
    {
      token: '7yYL...pump',
      name: 'beatcoin / beatcoin',
      symbol: 'beatcoin',
      decimals: 9,
      supply: 1000000000,
      photo: 'https://ui-avatars.com/api/?name=beatcoin&background=random',
      hardcap: 85,
      price: 0.0,
      priceChange24h: 32.16,
      volume24h: 0,
      marketCap: 0,
      holders: 1,
      raised: 0,
      createdAt: Date.now() - 60000,
      creator: '83QG...HWT',
      trades: 0,
      buys: 0,
    },
    {
      token: '3rEW...p8cQ',
      name: 'BEAT / Beatcoin',
      symbol: 'BEAT',
      decimals: 9,
      supply: 2000000000,
      photo: 'https://ui-avatars.com/api/?name=BEAT&background=random',
      hardcap: 85,
      price: 0.001,
      priceChange24h: 26.40,
      volume24h: 1000,
      marketCap: 5900,
      holders: 5,
      raised: 65.89,
      createdAt: Date.now() - 7200000,
      creator: 'xy2R...Xnxx',
      trades: 2,
      buys: 0,
    },
  ];
}
