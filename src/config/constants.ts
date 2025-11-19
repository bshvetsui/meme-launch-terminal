// Application constants and configuration

export const API_BASE_URL = 'https://launch.meme/api';
export const WS_URL = 'wss://launch.meme/connection/websocket';
export const WS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJpYXQiOjE3NTcxNjY4ODh9.VEvlNmvIFS3ARM5R0jlNN4fwDDRz94WnKv8LDmtipNE';

export const REFRESH_INTERVAL = 60000; // 60 seconds
export const WS_UPDATE_INTERVAL = 3000; // 3 seconds - reduced for better performance
export const MAX_TOKENS_DISPLAY = 100;

export const BREAKPOINTS = {
  xs: 480,
  sm: 768,
  md: 1024,
  lg: 1366,
} as const;

export const TOKEN_NAMES = [
  'PEPE', 'MOON', 'DOGE', 'SHIB',
  'MEME', 'PUMP', 'CHAD', 'WOJAK'
] as const;

export const TOKEN_SUFFIXES = [
  '2.0', 'X', 'PRO', 'MAX',
  'TURBO', 'MEGA', 'ULTRA'
] as const;