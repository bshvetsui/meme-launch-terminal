// API service for launch.meme
// Note: base URL is fixed to /api to avoid env coupling; configure proxy/redirect externally.
import axios from 'axios';
import type { Token, Transaction } from '../types';

const API_BASE = '/api';

export type CreateTokenPayload = {
  name: string;
  symbol: string;
  chain: string;
  supply: number;
  hardcap: number;
  website?: string;
  telegram?: string;
  photo?: string;
  creator?: string;
};

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const normalizeApiToken = (raw: any): Token => {
  const progress = Number(raw?.progress ?? 0);
  const createdAtSource = raw?.mint_time ?? raw?.createdAt;
  const parsedCreatedAt = createdAtSource ? Number(createdAtSource) || Date.parse(createdAtSource) : Date.now();

  const name = raw?.name || raw?.symbol || 'Token';
  const symbol = raw?.symbol || raw?.name || 'TKN';

  return {
    token: raw?.token ?? raw?.address ?? '',
    name,
    symbol,
    description: raw?.description,
    decimals: raw?.decimals ?? 9,
    supply: raw?.supply ?? 0,
    photo: raw?.photo ?? raw?.image ?? raw?.avatar,
    metadataUri: raw?.metadataUri,
    hardcap: raw?.hardcapUsd ?? raw?.hardcap ?? 1,
    website: raw?.website,
    x: raw?.x,
    telegram: raw?.telegram,
    version: raw?.version,
    price: Number(raw?.priceUsd ?? raw?.price ?? 0),
    priceChange24h: Number(raw?.priceChange24h ?? raw?.priceChange ?? 0),
    volume24h: Number(raw?.volumeUsd ?? raw?.volume24h ?? 0),
    marketCap: Number(raw?.marketCapUsd ?? raw?.marketCap ?? 0),
    holders: Number(raw?.holders ?? 0),
    liquidity: Number(raw?.liquidity ?? 0),
    createdAt: Number.isFinite(parsedCreatedAt) ? parsedCreatedAt : Date.now(),
    creator: raw?.creator,
    raised: progress,
    trades: Number(raw?.trades ?? (raw?.buys ?? 0) + (raw?.sells ?? 0)),
    buys: Number(raw?.buys ?? 0),
    sells: Number(raw?.sells ?? 0),
  };
};

const parseTokensResponse = (data: any): Token[] => {
  const tokensObject = data?.tokens ?? data;
  const list = Array.isArray(tokensObject) ? tokensObject : Object.values(tokensObject ?? {});
  return list.map(normalizeApiToken).filter(token => token.token);
};

export const tokenApi = {
  // Get list of tokens
  getTokens: async (page = '1', version?: number): Promise<Token[]> => {
    try {
      const response = await api.post('/tokens', {
        page,
        version,
        list: true,
      });
      return parseTokensResponse(response.data);
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
      return [];
    }
  },

  // Get live tokens
  getLiveTokens: async (): Promise<Token[]> => {
    try {
      const response = await api.post('/tokens/live', { list: true });
      return parseTokensResponse(response.data);
    } catch (error) {
      console.error('Failed to fetch live tokens:', error);
      return [];
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

  // Create a token
  createToken: async (payload: CreateTokenPayload): Promise<Token | null> => {
    try {
      const response = await api.post('/tokens/create', payload);
      const parsed = Array.isArray(response.data)
        ? normalizeApiToken(response.data[0])
        : normalizeApiToken(response.data);
      return parsed.token ? parsed : null;
    } catch (error) {
      console.error('Failed to create token:', error);
      return null;
    }
  },
};
