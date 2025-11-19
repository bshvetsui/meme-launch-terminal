// Extended mock tokens data
import type { Token } from '../types';

const tokenNames = [
  'PEPE', 'DOGE', 'SHIB', 'WOJAK', 'CHAD', 'MOON', 'ROCKET', 'LAMBO', 'HODL', 'DIAMOND',
  'HANDS', 'WAGMI', 'NGMI', 'FOMO', 'FUD', 'COPE', 'BASED', 'GIGACHAD', 'BRAINLET', 'SOYJAK',
  'BOBO', 'MUMU', 'APED', 'REKT', 'SAFU', 'BUIDL', 'WHALE', 'SHARK', 'FISH', 'PLEB',
  'ANON', 'FREN', 'SER', 'PROBABLY', 'NOTHING', 'WENLAMBO', 'WENDUMP', 'PUMPEET', 'DOOMPEET', 'BOGDANOFF',
  'SMINEM', 'WOJACK', 'PINK', 'GREEN', 'CANDLE', 'BEAR', 'BULL', 'CRAB', 'SIDEWAYS', 'UPPONLY',
  'GOBLIN', 'TOWN', 'COPE', 'SEETHE', 'DILATE', 'MALD', 'RATIO', 'COPIUM', 'HOPIUM', 'ROPIUM',
  'GWEI', 'SATS', 'VITALIK', 'SATOSHI', 'NAKAMOTO', 'DEFI', 'CEFI', 'TRADFI', 'NGMI', 'WGMI',
  'APE', 'MONKEY', 'CHIMP', 'GORILLA', 'ORANGUTAN', 'BABOON', 'LEMUR', 'SLOTH', 'KOALA', 'PANDA',
  'BEAR', 'BULL', 'TIGER', 'LION', 'EAGLE', 'HAWK', 'FALCON', 'RAVEN', 'CROW', 'PHOENIX',
  'DRAGON', 'UNICORN', 'PEGASUS', 'GRIFFIN', 'HYDRA', 'CERBERUS', 'KRAKEN', 'LEVIATHAN', 'BEHEMOTH', 'ZEUS'
];

const suffixes = ['coin', 'token', 'inu', 'moon', 'rocket', 'pump', 'dump', 'lord', 'king', 'god'];

function generateRandomToken(index: number): Token {
  const name = tokenNames[index % tokenNames.length];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const symbol = name.toUpperCase();
  const fullName = `${name}${suffix}`;

  const volume = Math.random() * 1000000;
  const marketCap = volume * (Math.random() * 10 + 1);
  const price = marketCap / (1000000000 * Math.random());
  const holders = Math.floor(Math.random() * 10000) + 1;
  const priceChange = (Math.random() - 0.5) * 200;
  const hardcap = 85 + Math.random() * 915;
  const raised = Math.random() * hardcap;
  const createdAt = Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000);

  return {
    token: generateAddress(),
    name: `${fullName} / ${name}`,
    symbol,
    decimals: 9,
    supply: 1000000000 + Math.floor(Math.random() * 9000000000),
    photo: `https://ui-avatars.com/api/?name=${symbol}&background=${getRandomColor()}&color=fff&bold=true`,
    hardcap,
    price,
    priceChange24h: priceChange,
    volume24h: volume,
    marketCap,
    holders,
    raised,
    createdAt,
    creator: generateAddress(),
    trades: Math.floor(Math.random() * 1000),
    buys: Math.floor(Math.random() * 500),
    sells: Math.floor(Math.random() * 500),
    liquidity: marketCap * 0.1,
    website: Math.random() > 0.5 ? `https://${fullName}.com` : undefined,
    twitter: Math.random() > 0.5 ? `@${symbol}` : undefined,
    telegram: Math.random() > 0.5 ? `https://t.me/${symbol}` : undefined,
  };
}

function generateAddress(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
  let address = '';
  for (let i = 0; i < 44; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
}

function getRandomColor(): string {
  const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8', 'F7DC6F', 'BB8FCE', '85C1E2'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Generate 100 mock tokens
export const mockTokens: Token[] = Array.from({ length: 100 }, (_, i) => generateRandomToken(i));

// Add some special trending tokens
export const trendingTokens: Token[] = [
  {
    token: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    name: 'USDC / USD Coin',
    symbol: 'USDC',
    decimals: 6,
    supply: 1000000000000,
    photo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    hardcap: 1000000,
    price: 1.0,
    priceChange24h: 0.01,
    volume24h: 50000000,
    marketCap: 1000000000,
    holders: 1000000,
    raised: 1000000,
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    creator: 'Centre',
    trades: 1000000,
    buys: 500000,
    sells: 500000,
    liquidity: 100000000,
  },
  {
    token: 'So11111111111111111111111111111111111111112',
    name: 'Wrapped SOL',
    symbol: 'SOL',
    decimals: 9,
    supply: 500000000,
    photo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    hardcap: 1000000,
    price: 150,
    priceChange24h: 5.5,
    volume24h: 100000000,
    marketCap: 75000000000,
    holders: 5000000,
    raised: 1000000,
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    creator: 'Solana',
    trades: 2000000,
    buys: 1100000,
    sells: 900000,
    liquidity: 500000000,
  }
];

// Combine all tokens
export const allMockTokens = [...trendingTokens, ...mockTokens];