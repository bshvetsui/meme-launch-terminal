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

export const normalizeApiToken = (raw: any): Token => {
  const progress = Number(raw?.progress ?? 0);
  const createdAtSource = raw?.mint_time ?? raw?.createdAt;
  const parsedCreatedAt = createdAtSource ? Number(createdAtSource) || Date.parse(createdAtSource) : Date.now();

  return {
    token: raw?.token ?? raw?.address ?? '',
    name: raw?.name ?? '',
    symbol: raw?.symbol ?? '',
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
