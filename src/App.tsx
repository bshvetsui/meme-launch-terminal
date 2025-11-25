import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { TokenTable } from "./components/TokenTable";
import { SearchBar } from "./components/SearchBar";
import { tokenApi } from "./services/api";
import { wsManager } from "./services/websocket";
import {
  mockTokens,
  mockPortfolio,
  mockOrders,
  mockRewards,
  mockChartData,
  mockPools,
  mockVaults,
  mockNewsPosts,
  mockPortfolioHistory,
  mockAllocation,
  mockFlowSeries,
  mockAlphaSeries,
} from "./data/mockData";
import type { Token, Reward, NewsPost } from "./types";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Toaster, toast } from "react-hot-toast";
import {
  Menu,
  WalletMinimal,
  PieChart,
  Gift,
  UserRound,
  UserPlus,
  LogIn,
  PlusCircle,
  Sparkles,
  Send,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  X,
  Castle,
  LineChart as LineChartIcon,
  Lock,
  Newspaper,
  Heart,
  Repeat2,
  MessageCircle,
  BadgeCheck,
  ExternalLink,
  Zap,
  Activity,
  TrendingUp,
  Gauge,
} from "lucide-react";

// ���������� ������ X (�� ������ Twitter)
const XIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// ���������� ������ Discord
const DiscordIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import "./App.css";

type PageKey = "dashboard" | "defi" | "portfolio" | "create" | "clicker" | "rewards" | "profile" | "news";
type SocialProvider = "Telegram" | "Discord" | "X" | "Email";
type AuthMode = "login" | "register";
type AuthSession = { provider: SocialProvider | "Email"; identifier: string; mode: AuthMode };
type ClickerState = { charge: number; streak: number; totalClicks: number; boostLevel: number; autopilot: boolean };
type EquityPoint = { label: string; value: number; pnl: number; deposits: number };
type AllocationSlice = { name: string; symbol?: string; value: number; color: string };
type FlowPoint = { label: string; inflow: number; outflow: number };
type AlphaPoint = { label: string; alpha: number; beta: number };

const navItems: Array<{ key: PageKey; label: string; icon: ReactNode; badge?: string }> = [
  { key: "dashboard", label: "Dashboard", icon: <LineChartIcon size={18} />, badge: "live" },
  { key: "news", label: "News", icon: <Newspaper size={18} /> },
  { key: "defi", label: "DeFi", icon: <Castle size={18} />, badge: "new" },
  { key: "portfolio", label: "Portfolio", icon: <PieChart size={18} /> },
  { key: "create", label: "Create Token", icon: <PlusCircle size={18} /> },
  { key: "clicker", label: "Clicker", icon: <Zap size={18} />, badge: "arcade" },
  { key: "rewards", label: "Rewards", icon: <Gift size={18} /> },
  { key: "profile", label: "Profile", icon: <UserRound size={18} /> },
];
const gatedPages = new Set<PageKey>(["defi", "portfolio", "create"]);
const AUTH_STORAGE_KEY = "ml-terminal-auth";

const usd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);

const compact = (value: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);

const shortAddress = (value?: string) => (value ? `${value.slice(0, 4)}...${value.slice(-4)}` : "-");

const timeAgo = (timestamp: number) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

export default function App() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLiveLoading, setIsLiveLoading] = useState(true);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activePage, setActivePage] = useState<PageKey>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsible, setIsSidebarCollapsible] = useState(
    typeof window !== "undefined" ? window.matchMedia("(max-width: 1024px)").matches : false,
  );
  const [isMobileWidth, setIsMobileWidth] = useState(
    typeof window !== "undefined" ? window.matchMedia("(max-width: 480px)").matches : false,
  );
  const cursorRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rewards, setRewards] = useState<Reward[]>(mockRewards);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [authModal, setAuthModal] = useState<AuthMode | null>(null);
  const authFormDefaults = {
    email: "",
    password: "",
    username: "",
    otp: "",
    invite: "",
    sessionLength: "24h",
    remember: true,
    enable2fa: false,
    marketing: false,
    acceptTerms: true,
  };
  const [authForm, setAuthForm] = useState(authFormDefaults);
  const [otpRequested, setOtpRequested] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [newsPosts] = useState<NewsPost[]>(mockNewsPosts);
  const [createDraft, setCreateDraft] = useState({
    name: "Orbiton",
    symbol: "ORB",
    chain: "Solana",
    supply: 1_000_000_000,
    hardcap: 75,
    website: "https://orbiton.fun",
    telegram: "https://t.me/orbiton",
  });
  const [portfolioHistory, setPortfolioHistory] = useState<EquityPoint[]>(mockPortfolioHistory);
  const [allocationSlices, setAllocationSlices] = useState<AllocationSlice[]>(mockAllocation);
  const [flowSeries, setFlowSeries] = useState<FlowPoint[]>(mockFlowSeries);
  const [alphaSeries, setAlphaSeries] = useState<AlphaPoint[]>(mockAlphaSeries);
  const [riskHealth, setRiskHealth] = useState(72);
  const [clickerState, setClickerState] = useState<ClickerState>({
    charge: 28,
    streak: 0,
    totalClicks: 0,
    boostLevel: 1,
    autopilot: false,
  });
  const [lastArcadeReward, setLastArcadeReward] = useState<Reward | null>(null);

  const { address, isConnected } = useAccount();
  const { connectors, connectAsync, isLoading, pendingConnector } = useConnect();
  const { disconnect } = useDisconnect();

  const isWalletConnected = isConnected;
  const isAuthenticated = !!authSession;
  const isOnchainReady = isAuthenticated && isWalletConnected;
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;

    if (isMobileWidth) {
      root.style.setProperty("--cursor-trail-visible", "0");
      return;
    }

    root.style.setProperty("--cursor-trail-visible", "0.9");
    const handlePointerMove = (event: PointerEvent) => {
      cursorRef.current = { x: event.clientX, y: event.clientY };
      root.style.setProperty("--cursor-x", `${event.clientX}px`);
      root.style.setProperty("--cursor-y", `${event.clientY}px`);
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [isMobileWidth]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mobileQuery = window.matchMedia("(max-width: 480px)");
    const handleMobileChange = (event: MediaQueryListEvent) => setIsMobileWidth(event.matches);

    setIsMobileWidth(mobileQuery.matches);
    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener("change", handleMobileChange);
      return () => mobileQuery.removeEventListener("change", handleMobileChange);
    }
    mobileQuery.addListener(handleMobileChange);
    return () => mobileQuery.removeListener(handleMobileChange);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(max-width: 1024px)");
    const updateSidebarMode = (matches: boolean) => {
      setIsSidebarCollapsible(matches);
      if (!matches) {
        setSidebarOpen(false);
      }
    };
    const handleMediaChange = (event: MediaQueryListEvent) => {
      updateSidebarMode(event.matches);
    };

    updateSidebarMode(mediaQuery.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange);
      return () => mediaQuery.removeEventListener("change", handleMediaChange);
    }
    mediaQuery.addListener(handleMediaChange);
    return () => mediaQuery.removeListener(handleMediaChange);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const resolveTokenAddress = (payload: any) =>
      payload?.token ?? payload?.address ?? payload?.ca ?? payload?.contract ?? payload?.mint ?? payload?.id ?? null;

    const toNumber = (value: any) => {
      if (value === null || value === undefined) return undefined;
      const num = Number(value);
      return Number.isFinite(num) ? num : undefined;
    };

    const upsertToken = (
      incoming: Partial<Token> & { token?: string },
      options?: { bumpTrades?: number; bumpBuys?: number; bumpSells?: number; bumpVolume?: number; placeOnTop?: boolean },
    ) => {
      const address = resolveTokenAddress(incoming);
      if (!address) return;
      const payload = { ...incoming, token: address };

      setTokens(prev => {
        const index = prev.findIndex(item => item.token === address);
        if (index === -1) {
          const base: Token = {
            token: address,
            name: payload.name ?? payload.symbol ?? "New token",
            symbol: payload.symbol ?? (payload.name ?? "TKN").slice(0, 4).toUpperCase(),
            decimals: payload.decimals ?? 9,
            supply: payload.supply ?? 0,
            hardcap: payload.hardcap ?? 0,
            price: payload.price ?? 0,
            priceChange24h: payload.priceChange24h ?? 0,
            volume24h: (payload.volume24h ?? 0) + (options?.bumpVolume ?? 0),
            marketCap: payload.marketCap,
            holders: payload.holders ?? 0,
            liquidity: payload.liquidity,
            photo: payload.photo,
            metadataUri: payload.metadataUri,
            createdAt: payload.createdAt ?? Date.now(),
            creator: payload.creator,
            raised: payload.raised ?? 0,
            trades: (payload.trades ?? 0) + (options?.bumpTrades ?? 0),
            buys: (payload.buys ?? 0) + (options?.bumpBuys ?? 0),
            sells: (payload.sells ?? 0) + (options?.bumpSells ?? 0),
          };
          const next = options?.placeOnTop === false ? [...prev, base] : [base, ...prev];
          return next;
        }

        const current = prev[index];
        const updated: Token = {
          ...current,
          ...payload,
          price: payload.price ?? current.price,
          priceChange24h: payload.priceChange24h ?? current.priceChange24h,
          volume24h: (payload.volume24h ?? current.volume24h ?? 0) + (options?.bumpVolume ?? 0),
          marketCap: payload.marketCap ?? current.marketCap,
          holders: payload.holders ?? current.holders,
          liquidity: payload.liquidity ?? current.liquidity,
          createdAt: payload.createdAt ?? current.createdAt ?? Date.now(),
          raised: payload.raised ?? current.raised,
          trades: (payload.trades ?? current.trades ?? 0) + (options?.bumpTrades ?? 0),
          buys: (payload.buys ?? current.buys ?? 0) + (options?.bumpBuys ?? 0),
          sells: (payload.sells ?? current.sells ?? 0) + (options?.bumpSells ?? 0),
        };
        const next = [...prev];
        next[index] = updated;
        return next;
      });
    };

    const handlePriceUpdate = (payload: any) => {
      const token = resolveTokenAddress(payload);
      if (!token) return;
      upsertToken({
        token,
        name: payload.name ?? payload.tokenName,
        symbol: payload.symbol ?? payload.ticker,
        price: toNumber(payload.price ?? payload.priceUsd ?? payload.lastPrice),
        priceChange24h: toNumber(payload.priceChange24h ?? payload.change24h ?? payload.change),
        marketCap: toNumber(payload.marketCap ?? payload.mcap ?? payload.mc),
        volume24h: toNumber(payload.volume24h ?? payload.volume ?? payload.vol24h ?? payload.v24),
        holders: payload.holders ?? payload.holdersCount,
        liquidity: toNumber(payload.liquidity ?? payload.liq),
      });
      setIsLiveLoading(false);
    };

    const handleTrade = (payload: any) => {
      const token = resolveTokenAddress(payload);
      if (!token) return;
      const isBuy = payload.side === "buy" || payload.side === 1 || payload.side === "1" || payload.direction === "buy";
      const volumeDelta =
        toNumber(payload.volume ?? payload.volume24h ?? payload.amountUsd ?? payload.sol ?? payload.quoteVolume) ?? 0;
      upsertToken(
        {
          token,
          name: payload.name,
          symbol: payload.symbol,
          price: toNumber(payload.price ?? payload.lastPrice ?? payload.priceUsd),
        },
        {
          bumpTrades: 1,
          bumpBuys: isBuy ? 1 : 0,
          bumpSells: isBuy ? 0 : 1,
          bumpVolume: volumeDelta,
        },
      );
      setIsLiveLoading(false);
    };

    const handleNewToken = (payload: any) => {
      const token = resolveTokenAddress(payload);
      if (!token) return;
      upsertToken(
        {
          token,
          name: payload.name ?? payload.tokenName,
          symbol: payload.symbol ?? payload.ticker,
          decimals: payload.decimals ?? payload.dec ?? 9,
          supply: toNumber(payload.supply ?? payload.totalSupply) ?? 0,
          hardcap: toNumber(payload.hardcap ?? payload.hardCap ?? payload.maxRaise) ?? 0,
          price: toNumber(payload.price ?? payload.launchPrice),
          priceChange24h: toNumber(payload.priceChange24h ?? payload.change24h),
          volume24h: toNumber(payload.volume24h ?? payload.volume),
          marketCap: toNumber(payload.marketCap ?? payload.mcap),
          holders: payload.holders ?? 0,
          photo: payload.photo ?? payload.logo ?? payload.image,
          createdAt: payload.createdAt ?? Date.now(),
          creator: payload.creator ?? payload.owner ?? payload.wallet,
          raised: toNumber(payload.raised ?? payload.totalRaised),
        },
        { placeOnTop: true },
      );
      setIsLiveLoading(false);
    };

    const handleGlobal = (payload: any) => {
      if (payload?.type === "newToken" || payload?.type === "token") {
        handleNewToken(payload);
      } else if (payload?.type === "price") {
        handlePriceUpdate(payload);
      } else if (payload?.type === "trade") {
        handleTrade(payload);
      }
    };

    const fetchInitial = async () => {
      try {
        // Prefer full list; live endpoint can be empty/unstable.
        const liveTokens = await tokenApi.getTokens();
        if (!isMounted) return;
        if (liveTokens.length) {
          setTokens(liveTokens);
        } else {
          const fallback = await tokenApi.getLiveTokens();
          setTokens(fallback.length ? fallback : mockTokens);
        }
      } catch (error) {
        console.error("Failed to fetch tokens", error);
        if (isMounted) {
          setTokens(mockTokens);
        }
      } finally {
        if (isMounted) {
          setIsLiveLoading(false);
        }
      }
    };

    const handleConnected = () => {
      setIsWsConnected(true);
      setIsLiveLoading(false);
    };
    const handleDisconnected = () => setIsWsConnected(false);

    fetchInitial();

    wsManager.on("connected", handleConnected);
    wsManager.on("disconnected", handleDisconnected);
    wsManager.on("priceUpdate", handlePriceUpdate);
    wsManager.on("trade", handleTrade);
    wsManager.on("newToken", handleNewToken);
    wsManager.on("global", handleGlobal);
    wsManager.connect();

    return () => {
      isMounted = false;
      wsManager.off("connected", handleConnected);
      wsManager.off("disconnected", handleDisconnected);
      wsManager.off("priceUpdate", handlePriceUpdate);
      wsManager.off("trade", handleTrade);
      wsManager.off("newToken", handleNewToken);
      wsManager.off("global", handleGlobal);
      wsManager.disconnect();
    };
  }, []);

  useEffect(() => {
    if (tokens.length > 5) return;
    const interval = setInterval(async () => {
      try {
        const refreshed = await tokenApi.getTokens();
        if (refreshed.length) {
          setTokens(refreshed);
          setIsLiveLoading(false);
        }
      } catch (error) {
        console.warn("Retry fetch tokens failed", error);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [tokens.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPortfolioHistory(prev => {
        const last = prev[prev.length - 1] ?? {
          label: "Now",
          value: mockPortfolio.totalValue,
          pnl: mockPortfolio.totalPnl,
          deposits: 1200,
        };
        const now = new Date();
        const label = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
        const drift = 1 + (Math.random() - 0.5) * 0.016;
        const noise = (Math.random() - 0.5) * 140;
        const nextValue = Math.max(3200, last.value * drift + noise);
        const baseline = mockPortfolio.totalValue;
        const nextPnl = nextValue - baseline;
        const nextDeposits = Math.max(800, last.deposits + (Math.random() - 0.55) * 140);
        const point: EquityPoint = {
          label,
          value: Number(nextValue.toFixed(2)),
          pnl: Number(nextPnl.toFixed(2)),
          deposits: Number(nextDeposits.toFixed(2)),
        };
        return [...prev.slice(-23), point];
      });

      setAllocationSlices(prev => {
        const jittered = prev.map(slice => ({
          ...slice,
          value: Math.max(6, slice.value + (Math.random() - 0.5) * 3.2),
        }));
        const total = jittered.reduce((sum, slice) => sum + slice.value, 0);
        return jittered.map(slice => ({
          ...slice,
          value: Number(((slice.value / total) * 100).toFixed(1)),
        }));
      });

      setFlowSeries(prev => {
        const now = new Date();
        const label = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
        const inflow = Math.round(320 + Math.random() * 380);
        const outflow = Math.round(140 + Math.random() * 250);
        const next: FlowPoint = { label, inflow, outflow };
        return [...prev.slice(-9), next];
      });

      setAlphaSeries(prev => {
        const now = new Date();
        const label = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
        const nextAlpha = Number((1 + Math.random() * 0.3).toFixed(2));
        const nextBeta = Number((0.7 + Math.random() * 0.35).toFixed(2));
        return [...prev.slice(-11), { label, alpha: nextAlpha, beta: nextBeta }];
      });

      setRiskHealth(prev => {
        const drift = (Math.random() - 0.5) * 3.5;
        const next = Math.min(96, Math.max(48, prev + drift));
        return Number(next.toFixed(1));
      });
    }, 5200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(AUTH_STORAGE_KEY) : null;
    if (stored) {
      try {
        setAuthSession(JSON.parse(stored));
      } catch (error) {
        console.warn("Failed to restore auth session", error);
      }
    }
  }, []);

  useEffect(() => {
    if (!authSession) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession));
  }, [authSession]);

  const passwordScore = useMemo(() => {
    const pass = authForm.password;
    let score = 0;
    if (pass.length >= 6) score += 30;
    if (pass.length >= 10) score += 20;
    if (/[A-Z]/.test(pass)) score += 15;
    if (/[0-9]/.test(pass)) score += 15;
    if (/[^a-zA-Z0-9]/.test(pass)) score += 20;
    return Math.min(score, 100);
  }, [authForm.password]);
  const passwordLabel = passwordScore >= 80 ? "Strong" : passwordScore >= 50 ? "Okay" : "Weak";

  const authReadiness = useMemo(() => {
    let score = 20;
    if (authForm.email) score += 15;
    if (authForm.password.length >= 8) score += 15;
    if (authForm.enable2fa || authForm.otp) score += 20;
    if (authForm.remember) score += 10;
    if (authForm.acceptTerms) score += 10;
    if (authForm.sessionLength === "7d") score += 10;
    return Math.min(score, 100);
  }, [authForm]);

  const filteredTokens = useMemo(() => {
    if (!searchQuery) return tokens;
    const query = searchQuery.toLowerCase();
    return tokens.filter(
      token =>
        token.name?.toLowerCase().includes(query) ||
        token.symbol?.toLowerCase().includes(query) ||
        token.token?.toLowerCase().includes(query),
    );
  }, [tokens, searchQuery]);

  const totalMarketCap = useMemo(() => tokens.reduce((sum, token) => sum + (token.marketCap ?? 0), 0), [tokens]);
  const totalVolume = useMemo(() => tokens.reduce((sum, token) => sum + (token.volume24h ?? 0), 0), [tokens]);
  const avgChange = useMemo(
    () => (tokens.length ? tokens.reduce((sum, token) => sum + (token.priceChange24h ?? 0), 0) / tokens.length : 0),
    [tokens],
  );
  const latestEquity = portfolioHistory[portfolioHistory.length - 1] ?? mockPortfolioHistory[0];
  const equityChange = useMemo(() => {
    if (!portfolioHistory.length) return { absolute: 0, percent: 0 };
    const first = portfolioHistory[0].value;
    const last = portfolioHistory[portfolioHistory.length - 1].value;
    const absolute = last - first;
    const percent = first ? (absolute / first) * 100 : 0;
    return { absolute, percent };
  }, [portfolioHistory]);
  const latestFlow = flowSeries[flowSeries.length - 1] ?? { inflow: 0, outflow: 0, label: "" };
  const netFlow = latestFlow.inflow - latestFlow.outflow;
  const topAllocation = useMemo(() => {
    if (!allocationSlices.length) return null;
    const sorted = [...allocationSlices].sort((a, b) => b.value - a.value);
    return sorted[0];
  }, [allocationSlices]);
  const drawdown = useMemo(() => {
    if (!portfolioHistory.length) return 0;
    const peak = portfolioHistory.reduce((max, point) => Math.max(max, point.value), portfolioHistory[0].value);
    const last = portfolioHistory[portfolioHistory.length - 1].value;
    return peak ? ((peak - last) / peak) * 100 : 0;
  }, [portfolioHistory]);
  const allocationChartData = useMemo(
    () => allocationSlices.map(slice => ({ ...slice, fill: slice.color })),
    [allocationSlices],
  );
  const flowChartData = useMemo(
    () => flowSeries.map(item => ({ ...item, outflow: -item.outflow })),
    [flowSeries],
  );

  const handleConnect = async (target: "metaMask" | "trust") => {
    if (!isAuthenticated) {
      toast.error("Authorize first, then connect a wallet");
      return;
    }

    const targetWalletName = target === "metaMask" ? "MetaMask" : "Trust Wallet";

    // Отключаем текущий кошелек полностью
    if (isWalletConnected) {
      toast(`Switching to ${targetWalletName}...`, { duration: 2000 });
      disconnect();
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    // Проверяем наличие кошельков через window.ethereum
    const ethereum = (window as any).ethereum;

    if (!ethereum) {
      toast.error("No wallet detected. Please install a wallet extension.");
      return;
    }

    // Для MetaMask
    if (target === "metaMask") {
      if (!ethereum.isMetaMask && !ethereum.providers?.find((p: any) => p.isMetaMask)) {
        toast.error("MetaMask not detected. Please install MetaMask extension.");
        return;
      }

      // Если есть несколько провайдеров, выбираем MetaMask
      if (ethereum.providers) {
        const metamaskProvider = ethereum.providers.find((p: any) => p.isMetaMask);
        if (metamaskProvider) {
          (window as any).ethereum = metamaskProvider;
        }
      }
    }

    // Для Trust Wallet
    if (target === "trust") {
      if (!ethereum.isTrust && !ethereum.providers?.find((p: any) => p.isTrust)) {
        toast.error("Trust Wallet not detected. Please install Trust Wallet extension.");
        return;
      }

      // Если есть несколько провайдеров, выбираем Trust Wallet
      if (ethereum.providers) {
        const trustProvider = ethereum.providers.find((p: any) => p.isTrust);
        if (trustProvider) {
          (window as any).ethereum = trustProvider;
        }
      }
    }

    // Находим или создаем коннектор
    let connector = connectors.find(conn => {
      const name = conn.name.toLowerCase();
      if (target === "metaMask") {
        return name.includes("metamask") || name.includes("meta mask");
      }
      if (target === "trust") {
        return name.includes("trust");
      }
      return false;
    });

    // Fallback на Injected коннектор
    if (!connector) {
      connector = connectors.find(conn =>
        conn.name.toLowerCase().includes("injected") ||
        conn.name.toLowerCase().includes("inject")
      );
    }

    if (!connector) {
      toast.error(`Could not find connector for ${targetWalletName}`);
      return;
    }

    try {
      await connectAsync({ connector });
      toast.success(`Connected to ${targetWalletName}`);
    } catch (error: any) {
      console.error("Connection error:", error);
      if (error?.message?.includes("User rejected") || error?.message?.includes("rejected")) {
        toast.error("Connection rejected by user");
      } else if (error?.message?.includes("Already processing")) {
        toast.error("Please wait...");
        setTimeout(() => handleConnect(target), 1000);
      } else {
        toast.error(error?.message || `Failed to connect to ${targetWalletName}`);
      }
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast.success("Wallet disconnected");
  };

  const openAuthModal = (mode: AuthMode) => {
    setAuthModal(mode);
    setAuthError(null);
    setOtpRequested(false);
  };

  const closeAuthModal = () => {
    setAuthModal(null);
    setAuthError(null);
    setOtpRequested(false);
    setAuthForm(authFormDefaults);
  };

  const handleSocialAuth = (provider: SocialProvider, mode: AuthMode = "login") => {
    setAuthError(null);
    setAuthSession({ provider, identifier: provider, mode });
    toast.success(mode === "login" ? `Signed in via ${provider}` : `Registered via ${provider}`);
    closeAuthModal();
  };

  const handleSocialLogout = () => {
    setAuthSession(null);
    setAuthForm(authFormDefaults);
    setOtpRequested(false);
    if (isWalletConnected) disconnect();
    toast("Signed out of session");
  };

  const handleEmailAuth = (mode: AuthMode) => {
    setAuthError(null);
    if (!authForm.email.trim()) {
      setAuthError("Email is required");
      return;
    }
    if (authForm.password.trim().length < 6) {
      setAuthError("Add a stronger password (6+ chars)");
      return;
    }
    if (mode === "register" && !authForm.acceptTerms) {
      setAuthError("Confirm terms & privacy to continue");
      return;
    }
    if ((authForm.enable2fa || authForm.otp.trim()) && authForm.otp.trim().length < 4) {
      setAuthError("Enter the 2FA code we sent");
      return;
    }
    const identifier = authForm.username.trim() || authForm.email.split("@")[0];
    setAuthSession({ provider: "Email", identifier, mode });
    toast.success(
      mode === "login"
        ? `Logged in via email (mock). ${authForm.remember ? "Session pinned to this device." : "Ephemeral session."}`
        : `Registered via email (mock). ${authForm.enable2fa ? "2FA toggled on." : "You can add 2FA anytime."}`,
    );
    setOtpRequested(false);
    closeAuthModal();
  };

  const handleMagicLink = () => {
    if (!authForm.email.trim()) {
      setAuthError("Add email to send a magic link");
      return;
    }
    toast.success("Magic link sent (mock) � check inbox");
  };

  const handleRequestOtp = () => {
    if (!authForm.email.trim()) {
      setAuthError("Add email to receive a one-time code");
      return;
    }
    setOtpRequested(true);
    setAuthError(null);
    toast.success("2FA code sent (mock)");
  };

  const generateStrongPassword = () => {
    const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const pick = () => alphabet[Math.floor(Math.random() * alphabet.length)];
    const result = Array.from({ length: 12 }, pick).join("");
    setAuthForm(prev => ({ ...prev, password: result }));
    toast.success("New strong password suggested");
  };

  const handleCreateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAuthenticated) {
      toast.error("Authenticate first");
      return;
    }
    if (!isWalletConnected) {
      toast.error("Connect wallet to save drafts");
      return;
    }
    toast.success("Draft saved. Token ready for review.");
  };

  const handleClaimReward = (id: string) => {
    setClaimingId(id);
    setTimeout(() => {
      setRewards(prev => prev.map(reward => (reward.id === id ? { ...reward, claimed: true } : reward)));
      setClaimingId(null);
      toast.success('Reward claimed');
    }, 650);
  };

  const mintArcadeReward = (payload: { amount: number; tier: string; streak: number }) => {
    const wallet = address ?? authSession?.identifier ?? rewards[0]?.wallet ?? mockRewards[0].wallet;
    const reward: Reward = {
      id: `arcade-${Date.now()}`,
      wallet,
      type: `${payload.tier} Drop`,
      amount: payload.amount,
      description: `Clicker streak x${payload.streak} forged this drop`,
      timestamp: Date.now(),
      claimed: false,
    };
    setRewards(prev => [reward, ...prev]);
    setLastArcadeReward(reward);
    toast.success("Arcade drop added to Rewards");
  };

  const handleClickerTap = () => {
    let minted: { amount: number; tier: string; streak: number } | null = null;
    setClickerState(prev => {
      const nextClicks = prev.totalClicks + 1;
      const nextStreak = prev.streak + 1;
      const gain = 9 + Math.min(nextStreak, 18) * 0.45 + prev.boostLevel * 1.8 + (prev.autopilot ? 4 : 0);
      let charge = prev.charge + gain;
      let boostLevel = prev.boostLevel;

      if (charge >= 100) {
        const tier = boostLevel >= 4 ? "Overdrive" : nextStreak >= 12 ? "Combo" : "Arcade";
        const amount = Math.round(30 + nextStreak * 1.1 + boostLevel * 9 + (prev.autopilot ? 10 : 0));
        minted = { amount, tier, streak: nextStreak };
        charge -= 100;
        boostLevel = Math.min(6, boostLevel + 1);
      }

      return {
        charge: Math.min(charge, 100),
        streak: nextStreak,
        totalClicks: nextClicks,
        boostLevel,
        autopilot: prev.autopilot,
      };
    });

    if (minted) {
      mintArcadeReward(minted);
    }
  };

  const handleClickerPulse = () => {
    let minted: { amount: number; tier: string; streak: number } | null = null;
    setClickerState(prev => {
      if (prev.charge < 45) return prev;
      minted = {
        amount: Math.round(prev.charge * 0.6 + prev.boostLevel * 10),
        tier: "Pulse",
        streak: Math.max(prev.streak, 1),
      };
      return {
        ...prev,
        charge: Math.max(0, prev.charge - 45),
        streak: Math.max(0, prev.streak - 1),
      };
    });
    if (minted) {
      mintArcadeReward(minted);
    } else {
      toast.error("Charge to at least 45% to pulse a drop");
    }
  };

  const toggleAutopilot = () => setClickerState(prev => ({ ...prev, autopilot: !prev.autopilot }));

  const ensureAuthed = (action: string) => {
    if (!isAuthenticated) {
      toast.error("Authorize first (email or socials)");
      return false;
    }
    if (!isWalletConnected) {
      toast.error(`Connect wallet to ${action}`);
      return false;
    }
    return true;
  };

  const pageTitle = navItems.find(item => item.key === activePage)?.label ?? 'Dashboard';
  const liveToken = tokens[0];
  const clickerProgress = Math.min(100, Math.round(clickerState.charge));
  const nextDropGap = Math.max(0, 100 - clickerProgress);
  const estimatedDrop = Math.round(30 + clickerState.boostLevel * 9 + Math.max(clickerState.streak, 1));
  const profileHandle = useMemo(() => {
    if (authSession?.identifier && authSession.identifier !== authSession.provider) return authSession.identifier;
    if (authSession?.provider) return `${authSession.provider} session`;
    return "Guest";
  }, [authSession]);
  const profileAuthLabel = isAuthenticated
    ? `${authSession?.provider} ${authSession?.mode === "register" ? "- registered" : "- login"}`
    : "Guest mode";
  const sessionSecurityScore = Math.min(100, authReadiness + (isWalletConnected ? 12 : 0) + (otpRequested ? 8 : 0));
  const recentSessions = useMemo(
    () => [
      {
        id: "current",
        device: "Chrome � Desktop",
        location: "Moscow, RU",
        ip: "176.23.89.12",
        status: isAuthenticated ? "Active" : "Preview",
        provider: authSession?.provider ?? "Guest",
        identifier: authSession?.identifier ?? "Local preview",
        lastActive: Date.now() - 2 * 60 * 1000,
      },
      {
        id: "mobile",
        device: "Telegram � Mobile",
        location: "Dubai, AE",
        ip: "45.91.22.110",
        status: "Trusted",
        provider: "Telegram",
        identifier: "@mem-bridge",
        lastActive: Date.now() - 50 * 60 * 1000,
      },
      {
        id: "api",
        device: "Session link � Web",
        location: "Frankfurt, DE",
        ip: "edge",
        status: "Signed out",
        provider: "Email",
        identifier: "One-time link",
        lastActive: Date.now() - 28 * 60 * 60 * 1000,
      },
    ],
    [authSession, isAuthenticated],
  );

  const cardAnim = useMemo(
    () =>
      isMobileWidth
        ? {
            initial: { opacity: 1, y: 0 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0 },
          }
        : {
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.35, ease: [0.25, 0.8, 0.5, 1] as const },
          },
    [isMobileWidth],
  );
  const allowChartAnimation = !isMobileWidth;
  const clickerMotionProps = useMemo(
    () => (isMobileWidth ? {} : { whileTap: { scale: 0.97 }, whileHover: { scale: 1.01 } }),
    [isMobileWidth],
  );

  const toastBaseStyle = {
    background: "linear-gradient(120deg, rgba(122, 224, 255, 0.18), rgba(192, 139, 255, 0.14))",
    border: "1px solid var(--border)",
    color: "var(--text)",
    fontWeight: 700,
    fontSize: "14px",
    letterSpacing: "-0.01em",
    padding: "16px 18px",
    borderRadius: "16px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(122, 224, 255, 0.3)",
    backdropFilter: "blur(10px)",
    minWidth: "320px",
    maxWidth: "520px",
    lineHeight: "1.5",
  };

  const authOverlay =
    !isAuthenticated || !isWalletConnected
      ? (
        <div className="auth-wall">
          <Lock size={20} />
          <p>
            {!isAuthenticated
              ? "Sign in with email or socials before touching wallets."
              : "Now connect a wallet to interact onchain."}
          </p>
          <div className="connect-group wall">
            {!isAuthenticated ? (
              <>
                <button className="btn-primary" onClick={() => openAuthModal("login")}>
                  <LogIn size={14} />
                  Login
                </button>
                <button className="ghost" onClick={() => openAuthModal("register")}>
                  <UserPlus size={14} />
                  Register
                </button>
                <button className="btn-connect alt" onClick={() => handleSocialAuth("Telegram", "login")}>
                  <Send size={14} />
                  Telegram
                </button>
                <button className="btn-connect alt" onClick={() => handleSocialAuth("Discord", "login")}>
                  <DiscordIcon size={14} />
                  Discord
                </button>
                <button className="btn-connect alt" onClick={() => handleSocialAuth("X", "login")}>
                  <XIcon size={14} />
                  X
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn-connect"
                  onClick={() => handleConnect("metaMask")}
                  disabled={isLoading && pendingConnector?.name === "MetaMask"}
                >
                  MetaMask
                </button>
                <button
                  className="btn-connect"
                  onClick={() => handleConnect("trust")}
                  disabled={isLoading && pendingConnector?.name === "Trust Wallet"}
                >
                  Trust Wallet
                </button>
              </>
            )}
          </div>
        </div>
      )
      : null;

  const renderAuthModal = () => {
    if (!authModal) return null;
    const mode = authModal;
    return (
      <div className="modal-backdrop" onClick={closeAuthModal}>
        <div className="modal" onClick={event => event.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-headings">
              <div className="panel-title">{mode === "login" ? "Login" : "Register"}</div>
              <div className="modal-badges">
                <span className="pill pill-live">{mode === "login" ? "Returning session" : "Fresh account"}</span>
                <span className="pill pill-ghost">{authReadiness}% ready</span>
              </div>
              <p className="panel-subtitle">
                {mode === "login"
                  ? "Use email, socials, magic links or OTP to reopen your lane."
                  : "Layer in username, invites, 2FA and session prefs from the start."}
              </p>
            </div>
            <button className="icon-button ghost" onClick={closeAuthModal}>
              <X size={16} />
            </button>
          </div>

          <div className="modal-body">
            <div className="modal-grid">
              <form
                className="modal-form"
                onSubmit={event => {
                  event.preventDefault();
                  handleEmailAuth(mode);
                }}
              >
                {mode === "login" && (
                  <div className="inline-callout">
                    <span className="muted">No account yet?</span>
                    <button type="button" className="ghost tiny" onClick={() => setAuthModal("register")}>
                      Register
                    </button>
                  </div>
                )}

                <label className="field">
                  <div className="field-row">
                    <span>Email</span>
                    <button type="button" className="ghost tiny" onClick={handleMagicLink}>
                      Send magic link
                    </button>
                  </div>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={e => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="name@email.com"
                    required
                  />
                </label>

                {mode === "register" && (
                  <label className="field">
                    <div className="field-row">
                      <span>Username</span>
                      <span className="label">Visible across launchpad</span>
                    </div>
                    <input
                      value={authForm.username}
                      onChange={e => setAuthForm(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="orbiton-builder"
                      required
                    />
                  </label>
                )}

                <label className="field">
                  <div className="field-row">
                    <span>Password</span>
                    <button type="button" className="ghost tiny" onClick={generateStrongPassword}>
                      Suggest strong
                    </button>
                  </div>
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={e => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Make it spicy"
                  />
                  <div className="strength">
                    <div className="strength-bar">
                      <span style={{ width: `${passwordScore}%` }} />
                    </div>
                    <span className="label">{passwordLabel} � auto-lock in {authForm.sessionLength}</span>
                  </div>
                </label>

                <label className="field">
                  <div className="field-row">
                    <span>2FA / OTP</span>
                    <button type="button" className="ghost tiny" onClick={handleRequestOtp}>
                      {otpRequested ? "Resend code" : "Send code"}
                    </button>
                  </div>
                  <input
                    value={authForm.otp}
                    onChange={e => setAuthForm(prev => ({ ...prev, otp: e.target.value }))}
                    placeholder="123456"
                  />
                </label>

                {mode === "register" && (
                  <label className="field">
                    <div className="field-row">
                      <span>Invite / referral</span>
                      <span className="label">Optional but unlocks perks</span>
                    </div>
                    <input
                      value={authForm.invite}
                      onChange={e => setAuthForm(prev => ({ ...prev, invite: e.target.value }))}
                      placeholder="moon-crew-2024"
                    />
                  </label>
                )}

                <label className="field">
                  <span>Session length</span>
                  <select
                    value={authForm.sessionLength}
                    onChange={e => setAuthForm(prev => ({ ...prev, sessionLength: e.target.value }))}
                  >
                    <option value="1h">1 hour</option>
                    <option value="24h">24 hours</option>
                    <option value="7d">7 days</option>
                  </select>
                </label>

                <div className="toggle-grid">
                  <label className="toggle-row">
                    <div>
                      <div className="value">Remember this device</div>
                      <div className="label">Keeps session warm for {authForm.sessionLength}</div>
                    </div>
                    <span className="switch">
                      <input
                        type="checkbox"
                        checked={authForm.remember}
                        onChange={e => setAuthForm(prev => ({ ...prev, remember: e.target.checked }))}
                      />
                      <span className="switch-handle" />
                    </span>
                  </label>

                  <label className="toggle-row">
                    <div>
                      <div className="value">Enable 2FA challenge</div>
                      <div className="label">Adds OTP at every sign-in.</div>
                    </div>
                    <span className="switch">
                      <input
                        type="checkbox"
                        checked={authForm.enable2fa}
                        onChange={e => setAuthForm(prev => ({ ...prev, enable2fa: e.target.checked }))}
                      />
                      <span className="switch-handle" />
                    </span>
                  </label>

                  {mode === "register" && (
                    <label className="toggle-row">
                      <div>
                        <div className="value">Product drops + memes</div>
                        <div className="label">Get weekly rollups (mock emails).</div>
                      </div>
                      <span className="switch">
                        <input
                          type="checkbox"
                          checked={authForm.marketing}
                          onChange={e => setAuthForm(prev => ({ ...prev, marketing: e.target.checked }))}
                        />
                        <span className="switch-handle" />
                      </span>
                    </label>
                  )}

                  <label className="toggle-row">
                    <div>
                      <div className="value">Terms & privacy</div>
                      <div className="label">You agree to mock launchpad rules.</div>
                    </div>
                    <span className="switch">
                      <input
                        type="checkbox"
                        checked={authForm.acceptTerms}
                        onChange={e => setAuthForm(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                      />
                      <span className="switch-handle" />
                    </span>
                  </label>
                </div>

                {authError && <div className="form-error">{authError}</div>}

                <div className="modal-actions">
                  <button type="submit" className="btn-primary">
                    {mode === "login" ? "Login with email" : "Register with email"}
                  </button>
                  <div className="secondary-actions">
                    <button type="button" className="ghost" onClick={handleMagicLink}>
                      Magic link
                    </button>
                    <button type="button" className="ghost" onClick={handleRequestOtp}>
                      {otpRequested ? "Resend 2FA code" : "Send 2FA code"}
                    </button>
                  </div>
                  <div className="social-inline">
                    <span className="label">Or socials</span>
                    <div className="connect-group">
                      <button type="button" className="btn-connect alt" onClick={() => handleSocialAuth("Telegram", mode)}>
                        <Send size={14} />
                        Telegram
                      </button>
                      <button type="button" className="btn-connect alt" onClick={() => handleSocialAuth("Discord", mode)}>
                        <DiscordIcon size={14} />
                        Discord
                      </button>
                      <button type="button" className="btn-connect alt" onClick={() => handleSocialAuth("X", mode)}>
                        <XIcon size={14} />
                        X
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              <div className="modal-aside">
                <div className="modal-card highlight">
                  <div className="modal-card-head">
                    <div>
                      <div className="panel-title">Session preview</div>
                      <p className="panel-subtitle">Live summary of this auth attempt.</p>
                    </div>
                    <ShieldCheck size={16} />
                  </div>
                  <div className="meta-grid">
                    <div className="session-preview-row">
                      <span className="label">Mode</span>
                      <span className="value">{mode === "login" ? "Returning user" : "New creator"}</span>
                    </div>
                    <div className="session-preview-row">
                      <span className="label">Session</span>
                      <span className="value">{authForm.sessionLength}</span>
                    </div>
                    <div className="session-preview-row">
                      <span className="label">Device trust</span>
                      <span className="value">{authForm.remember ? "Pinned" : "One-off"}</span>
                    </div>
                    <div className="session-preview-row">
                      <span className="label">2FA</span>
                      <span className={`pill ${authForm.enable2fa || authForm.otp ? 'pill-positive' : 'pill-negative'}`}>
                        {authForm.enable2fa || authForm.otp ? "On" : "Off"}
                      </span>
                    </div>
                  </div>
                  <div className="readiness">
                    <div className="readiness-track">
                      <span style={{ width: `${authReadiness}%` }} />
                    </div>
                    <span className="label">{authReadiness}% ready to launch</span>
                  </div>
                </div>

                <div className="modal-card">
                  <div className="modal-card-head">
                    <div className="panel-title">Security checklist</div>
                    <p className="panel-subtitle">Keep these green for smooth deploy.</p>
                  </div>
                  <div className="status-list">
                    <div className={`status-row ${authForm.password.length >= 10 ? 'ok' : ''}`}>
                      <CheckCircle2 size={14} />
                      <span>Mix symbols & capitals</span>
                    </div>
                    <div className={`status-row ${authForm.enable2fa || authForm.otp ? 'ok' : ''}`}>
                      <CheckCircle2 size={14} />
                      <span>2FA / OTP toggled</span>
                    </div>
                    <div className={`status-row ${authForm.acceptTerms ? 'ok' : ''}`}>
                      <CheckCircle2 size={14} />
                      <span>Terms & privacy accepted</span>
                    </div>
                    <div className={`status-row ${authForm.remember ? 'ok' : ''}`}>
                      <CheckCircle2 size={14} />
                      <span>Device trust selected</span>
                    </div>
                  </div>
                </div>

                <div className="modal-card">
                  <div className="modal-card-head">
                    <div className="panel-title">Extras</div>
                    <p className="panel-subtitle">Optional boosts for this session.</p>
                  </div>
                  <div className="pill-row">
                    <span className="pill pill-live">Auto-lock {authForm.sessionLength}</span>
                    <span className="pill pill-ghost">{authForm.remember ? "Trusted device" : "Ephemeral"}</span>
                    <span className="pill pill-ghost">{authForm.marketing ? "Drops enabled" : "Silent mode"}</span>
                  </div>
                  <div className="inline-callout">
                    <Sparkles size={14} />
                    <span>Use socials or magic link to breeze through login.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-mark">
              <Sparkles size={14} />
            </div>
            <div>
              <div className="brand-title">MEML</div>
              <div className="brand-subtitle">Launch your coin!</div>
            </div>
          </div>
          {isSidebarCollapsible && (
            <button className="icon-button ghost sidebar-close" onClick={() => setSidebarOpen(false)}>
              <X size={16} />
            </button>
          )}
        </div>

        <nav className="nav">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`nav-item ${activePage === item.key ? 'active' : ''}`}
              onClick={() => {
                if (!isAuthenticated && gatedPages.has(item.key)) {
                  toast.error("Login or register to open this page");
                  openAuthModal("login");
                  return;
                }
                if (!isWalletConnected && gatedPages.has(item.key)) {
                  toast.error("Connect a wallet after login to access this section");
                  return;
                }
                setActivePage(item.key);
                setSidebarOpen(false);
              }}
            >
              <div className="nav-icon">{item.icon}</div>
              <div className="nav-text">
                <span>{item.label}</span>
                {item.badge && <span className="pill pill-live">{item.badge}</span>}
              </div>
            </button>
          ))}
        </nav>

        <div className="sidebar-stats">
          <div className="sidebar-card glass">
            <div className="sidebar-card-head">
              <ShieldCheck size={14} />
              <span>Market Cap</span>
            </div>
            <div className="sidebar-value">{usd(totalMarketCap)}</div>
            <div className="sidebar-foot positive">
              <CheckCircle2 size={14} />
              <span>+{avgChange.toFixed(2)}% day</span>
            </div>
          </div>

          <div className="sidebar-card glass">
            <div className="sidebar-card-head">
              <BarChart3 size={14} />
              <span>24h Volume</span>
            </div>
            <div className="sidebar-value">{usd(totalVolume)}</div>
            <div className="sidebar-foot neutral">Across all live pairs</div>
          </div>

          <div className="sidebar-card glass">
            <div className="sidebar-card-head">
              <Sparkles size={14} />
              <span>Live price</span>
            </div>
            <div className="sidebar-value">
              {liveToken?.price ? usd(liveToken.price) : '$0.00'}
              <span className={`pill ${avgChange >= 0 ? 'pill-positive' : 'pill-negative'}`}>
                {avgChange >= 0 ? '+' : ''}
                {avgChange.toFixed(2)}%
              </span>
            </div>
            <div className="sidebar-foot success">
              <span className={`dot ${isWsConnected ? 'online' : ''}`} />{" "}
              {isWsConnected ? "Live feed online" : "Live feed reconnecting"}
            </div>
          </div>
        </div>
      </aside>

      <div className="content">
        <header className="topbar">
          {isSidebarCollapsible && (
            <button className="icon-button ghost burger" onClick={() => setSidebarOpen(true)}>
              <Menu size={18} />
            </button>
          )}
          <div className="page-heading">
            <div className="page-title">
              {pageTitle}
              <span className="dot live" />
            </div>

          </div>

          <div className="top-actions">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <div className="session-bar tight">
              {!isAuthenticated ? (
                <>
                  <div className="session-pair">
                    <button className="btn-primary" onClick={() => openAuthModal("login")}>
                      <LogIn size={14} />
                      Login
                    </button>
                    <button className="ghost" onClick={() => openAuthModal("register")}>
                      <UserPlus size={14} />
                      Register
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="wallet-stack">
                    {!isWalletConnected ? (
                      <>
                        <button
                          className="btn-connect"
                          onClick={() => handleConnect("metaMask")}
                          disabled={isLoading && pendingConnector?.name === "MetaMask"}
                        >
                          Connect MetaMask
                        </button>
                        <button
                          className="btn-connect"
                          onClick={() => handleConnect("trust")}
                          disabled={isLoading && pendingConnector?.name === "Trust Wallet"}
                        >
                          Connect Trust Wallet
                        </button>
                      </>
                    ) : (
                      <div className="wallet-chip">
                        <WalletMinimal size={16} />
                        <div>
                          <div className="wallet-label">Wallet ready</div>
                          <div className="wallet-address">{shortAddress(address)}</div>
                        </div>
                        <button className="ghost tiny" onClick={handleDisconnect}>Disconnect</button>
                      </div>
                    )}
                  </div>
                  <button className="btn-signout" onClick={handleSocialLogout}>Sign out</button>
                  <button className="user-chip linky" type="button" onClick={() => setActivePage("profile")}>
                    <UserRound size={16} />
                    <div>
                      <div className="wallet-label">Profile</div>
                      <div className="wallet-address">{isAuthenticated ? "Session active" : "Guest"}</div>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="page">
          {gatedPages.has(activePage) && (!isAuthenticated || !isWalletConnected) && (
            <div className="page-guard">
              <div>
                <div className="panel-title">Authorization required</div>
                <p className="panel-subtitle">
                  {!isAuthenticated
              ? "Sign in with email or socials before touching wallets."
              : "Now connect a wallet to interact onchain."}
                </p>
              </div>
              <div className="connect-group">
                {!isAuthenticated ? (
                  <>
                    <button className="btn-primary" onClick={() => openAuthModal("login")}>
                      Login
                    </button>
                    <button className="ghost" onClick={() => openAuthModal("register")}>
                      Register
                    </button>
                    <button className="btn-connect alt" onClick={() => handleSocialAuth("Telegram", "login")}>Telegram</button>
                    <button className="btn-connect alt" onClick={() => handleSocialAuth("Discord", "login")}>Discord</button>
                    <button className="btn-connect alt" onClick={() => handleSocialAuth("X", "login")}>X</button>
                  </>
                ) : (
                  <>
                    <button className="btn-connect" onClick={() => handleConnect("metaMask")}>
                      MetaMask
                    </button>
                    <button className="btn-connect" onClick={() => handleConnect("trust")}>
                      Trust Wallet
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
          {activePage === 'dashboard' && (
            <>
              <section className="grid stats-grid">
                {[
                  { title: 'Active tokens', value: tokens.length, icon: <LineChartIcon size={16} />, tone: 'primary' },
                  { title: '24h Volume', value: usd(totalVolume), icon: <BarChart3 size={16} />, tone: 'success' },
                  { title: 'Market Cap', value: usd(totalMarketCap), icon: <ShieldCheck size={16} />, tone: 'warning' },
                  {
                    title: 'Avg change',
                    value: `${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%`,
                    icon: <Sparkles size={16} />,
                    tone: 'info',
                  },
                ].map((card, i) => (
                  <motion.div key={card.title} {...cardAnim} transition={{ ...cardAnim.transition, delay: i * 0.03 }}>
                    <div className="stat-card">
                      <div className="stat-head">
                        <div className={`stat-icon ${card.tone}`}>{card.icon}</div>
                        <span>{card.title}</span>
                      </div>
                      <div className="stat-value">{card.value}</div>
                      <div className="stat-foot">Live snapshot</div>
                    </div>
                  </motion.div>
                ))}
              </section>

              <section className="grid charts-grid">
                <motion.div {...cardAnim}>
                  <div className="panel">
                    <div className="panel-head">
                      <div>
                        <div className="panel-title">Market pulse</div>
                        <p className="panel-subtitle">candle-free area chart, updates with price drift.</p>
                      </div>
                     
                    </div>
                    <div className="chart">
                      <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={mockChartData}>
                          <defs>
                            <linearGradient id="chartYellow" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#7ae0ff" stopOpacity={0.8} />
                              <stop offset="100%" stopColor="#c08bff" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="time" tick={{ fill: '#94a7c6', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#94a7c6', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{ background: '#0c0f1b', border: '1px solid #7ae0ff', color: '#e8f2ff' }}
                            labelStyle={{ color: '#e8f2ff' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#7ae0ff"
                            fill="url(#chartYellow)"
                            strokeWidth={2}
                            isAnimationActive={allowChartAnimation}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </motion.div>

                <motion.div {...cardAnim}>
                  <div className="panel secondary">
                    <div className="panel-head">
                      <div className="panel-title">DeFi highlights</div>
                      <p className="panel-subtitle">Top pools by APR (mocked).</p>
                    </div>
                    <div className="pool-grid">
                      {mockPools.map(pool => (
                        <div key={pool.id} className="pool-card">
                          <div className="pool-head">
                            <div className="pill pill-live">pool</div>
                            <div className="pill pill-positive">{pool.apr}% APR</div>
                          </div>
                          <div className="value">{pool.name}</div>
                          <div className="label">TVL {usd(pool.tvl)}</div>
                          <div className="label">24h vol {usd(pool.volume24h)}</div>
                          <div className="pool-actions">
                            <button className="btn-primary ghosty" onClick={() => ensureAuthed('add liquidity')}>
                              Add
                            </button>
                            <button className="ghost tiny" onClick={() => ensureAuthed('claim fees')}>
                              Fees {usd(pool.rewards)}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </section>

              <motion.div {...cardAnim}>
                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <div className="panel-title">Live order flow</div>
                      <p className="panel-subtitle">
                        WebSocket live feed {isWsConnected ? 'synced' : 'reconnecting...'}
                      </p>
                    </div>
                   
                  </div>
                  <TokenTable tokens={filteredTokens} loading={isLiveLoading} />
                </div>
              </motion.div>
            </>
          )}
          {activePage === 'defi' && (
            <section className="grid defi-grid">
              <motion.div {...cardAnim}>
                <div className="panel">
                  <div className="panel-head">
                    <div className="panel-title">Liquidity pools</div>
                    <p className="panel-subtitle">Stake LP, earn fees + rewards.</p>
                  </div>
                  <div className="pool-list">
                    {mockPools.map(pool => (
                      <div key={pool.id} className="pool-row">
                        <div>
                          <div className="value">{pool.name}</div>
                          <div className="label">TVL {usd(pool.tvl)} | 24h vol {usd(pool.volume24h)}</div>
                        </div>
                        <div className="pill pill-positive">{pool.apr}% APR</div>
                        <div className="label">My LP {usd(pool.myLiquidity)}</div>
                        <div className="pool-actions">
                          <button className="btn-primary ghosty" onClick={() => ensureAuthed('add liquidity')}>
                            Add
                          </button>
                          <button className="ghost tiny" onClick={() => ensureAuthed('remove liquidity')}>
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {authOverlay}
                </div>
              </motion.div>

              <motion.div {...cardAnim}>
                <div className="panel secondary">
                  <div className="panel-head">
                    <div className="panel-title">Vaults</div>
                    <p className="panel-subtitle">Auto-compounding strategies.</p>
                  </div>
                  <div className="vault-list">
                    {mockVaults.map(vault => (
                      <div key={vault.id} className="vault-card">
                        <div className="vault-head">
                          <div className="value">{vault.name}</div>
                          <div className="pill pill-positive">{vault.apy}% APY</div>
                        </div>
                        <div className="label">TVL {usd(vault.tvl)} | Lock {vault.lockup}</div>
                        <div className="vault-actions">
                          <div className="label">Deposited {usd(vault.deposited)}</div>
                          <button className="btn-connect" onClick={() => ensureAuthed('deposit to vault')}>
                            Deposit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {authOverlay}
                </div>
              </motion.div>
            </section>
          )}
          {activePage === 'portfolio' && (
            <>
              <section className="grid portfolio-grid">
                <motion.div {...cardAnim}>
                  <div className="panel">
                    <div className="panel-head">
                      <div>
                        <div className="panel-title">Portfolio performance</div>
                        <p className="panel-subtitle">Aggregated balances from mock wallet.</p>
                      </div>
                      <div className={`pill ${mockPortfolio.totalPnl >= 0 ? 'pill-positive' : 'pill-negative'}`}>
                        {mockPortfolio.totalPnl >= 0 ? '+' : ''}
                        {usd(mockPortfolio.totalPnl)} PnL
                      </div>
                    </div>
                    <div className="portfolio-summary">
                      <div>
                        <div className="label">Total value</div>
                        <div className="value">{usd(mockPortfolio.totalValue)}</div>
                      </div>
                      <div>
                        <div className="label">PNL</div>
                        <div className={`value ${mockPortfolio.totalPnl >= 0 ? 'positive' : 'negative'}`}>
                          {usd(mockPortfolio.totalPnl)}
                        </div>
                      </div>
                      <div>
                        <div className="label">Wallet</div>
                        <div className="value">{shortAddress(mockPortfolio.wallet)}</div>
                      </div>
                    </div>

                    <div className="portfolio-list">
                      {mockPortfolio.tokens.map(token => (
                        <div key={token.token} className="portfolio-row">
                          <div>
                            <div className="label">{token.token}</div>
                            <div className="value">{compact(token.balance)} units</div>
                          </div>
                          <div className="value">{usd(token.value)}</div>
                          <div className={`pill ${token.pnl >= 0 ? 'pill-positive' : 'pill-negative'}`}>
                            {token.pnl >= 0 ? '+' : ''}
                            {token.pnlPercentage}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <motion.div {...cardAnim}>
                  <div className="panel secondary">
                    <div className="panel-head">
                      <div className="panel-title">Automation</div>
                      <p className="panel-subtitle">Recent limit orders (mocked).</p>
                    </div>
                    <div className="orders">
                      {mockOrders.map(order => (
                        <div key={order.orderId} className="order-card">
                          <div className="order-head">
                            <span className={`pill ${order.side === 'buy' ? 'pill-positive' : 'pill-negative'}`}>
                              {order.side.toUpperCase()}
                            </span>
                            <span className="order-status">{order.status}</span>
                          </div>
                          <div className="order-body">
                            <div className="label">Token</div>
                            <div className="value">{order.token}</div>
                            <div className="label">Trigger</div>
                            <div className="value">{order.triggerPriceSol} SOL</div>
                            <div className="label">Amount</div>
                            <div className="value">{order.amountSol} SOL</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {authOverlay}
                  </div>
                </motion.div>
              </section>

              <section className="grid portfolio-analytics">
                <motion.div {...cardAnim}>
                  <div className="panel">
                    <div className="panel-head">
                      <div>
                        <div className="panel-title">Equity curve</div>
                        <p className="panel-subtitle">NAV feed refreshing in real time.</p>
                      </div>
                      <div className={`pill ${equityChange.absolute >= 0 ? 'pill-positive' : 'pill-negative'}`}>
                        {equityChange.absolute >= 0 ? '+' : '-'}
                        {usd(Math.abs(equityChange.absolute))}
                        <span className="label">{equityChange.percent.toFixed(2)}%</span>
                      </div>
                    </div>
                    <div className="chart-meta">
                      <div>
                        <div className="label">Balance</div>
                        <div className="value">{usd(latestEquity.value)}</div>
                      </div>
                      <div>
                        <div className="label">Deposits</div>
                        <div className="value">{usd(latestEquity.deposits)}</div>
                      </div>
                      <div>
                        <div className="label">Net flow</div>
                        <div className={`value ${netFlow >= 0 ? 'positive' : 'negative'}`}>
                          {netFlow >= 0 ? '+' : '-'}
                          {usd(Math.abs(netFlow))}
                        </div>
                      </div>
                      <span className="pill pill-live">streaming</span>
                    </div>
                    <div className="chart" role="img" aria-label="Portfolio equity curve updated every few seconds">
                      <ResponsiveContainer width="100%" height={230}>
                        <AreaChart data={portfolioHistory}>
                          <defs>
                            <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#7ae0ff" stopOpacity={0.7} />
                              <stop offset="100%" stopColor="#7ae0ff" stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="rgba(148, 167, 198, 0.12)" vertical={false} />
                          <XAxis dataKey="label" tick={{ fill: '#94a7c6', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis yAxisId="value" tick={{ fill: '#94a7c6', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis yAxisId="pnl" orientation="right" tick={false} axisLine={false} />
                          <Tooltip
                            contentStyle={{ background: '#0c0f1b', border: '1px solid #7ae0ff', color: '#e8f2ff' }}
                            labelStyle={{ color: '#e8f2ff' }}
                          />
                          <Area
                            yAxisId="value"
                            type="monotone"
                            dataKey="value"
                            stroke="#7ae0ff"
                            fill="url(#equityFill)"
                            strokeWidth={2.2}
                            isAnimationActive={allowChartAnimation}
                          />
                          <Line
                            yAxisId="pnl"
                            type="monotone"
                            dataKey="pnl"
                            stroke="#c08bff"
                            strokeWidth={1.6}
                            dot={false}
                            isAnimationActive={allowChartAnimation}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </motion.div>

                <motion.div {...cardAnim}>
                  <div className="panel secondary">
                    <div className="panel-head">
                      <div className="panel-title">Alpha / beta</div>
                      <p className="panel-subtitle">strategy vs market correlation.</p>
                    </div>
                    <div className="chart-meta">
                      <div className="chart-icon">
                        <Activity size={16} />
                        <span className="label">Alpha</span>
                        <span className="value">{(alphaSeries.at(-1)?.alpha ?? 0).toFixed(2)}x</span>
                      </div>
                      <div className="chart-icon">
                        <TrendingUp size={16} />
                        <span className="label">Beta</span>
                        <span className="value">{(alphaSeries.at(-1)?.beta ?? 0).toFixed(2)}x</span>
                      </div>
                      <div className="chart-icon">
                        <Gauge size={16} />
                        <span className="label">Health</span>
                        <span className="value">{riskHealth}%</span>
                      </div>
                    </div>
                    <div className="chart" role="img" aria-label="Alpha and beta chart">
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={alphaSeries}>
                          <CartesianGrid stroke="rgba(148, 167, 198, 0.12)" vertical={false} />
                          <XAxis dataKey="label" tick={{ fill: '#94a7c6', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis
                            tick={{ fill: '#94a7c6', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            domain={['dataMin', 'dataMax']}
                          />
                          <Tooltip
                            contentStyle={{ background: '#0c0f1b', border: '1px solid #7df7c2', color: '#e8f2ff' }}
                            labelStyle={{ color: '#e8f2ff' }}
                          />
                          <Line
                            type="monotone"
                            dataKey="alpha"
                            stroke="#7df7c2"
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={allowChartAnimation}
                          />
                          <Line
                            type="monotone"
                            dataKey="beta"
                            stroke="#7ae0ff"
                            strokeWidth={2}
                            dot={false}
                            strokeDasharray="5 5"
                            isAnimationActive={allowChartAnimation}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="chart-stat-grid">
                      <div className="chart-stat">
                        <div className="label">Drawdown</div>
                        <div className="value">{drawdown.toFixed(2)}%</div>
                      </div>
                      <div className="chart-stat">
                        <div className="label">Stability</div>
                        <div className="risk-meter" aria-label={`Portfolio health ${riskHealth}%`}>
                          <div className="risk-meter-fill" style={{ width: `${riskHealth}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div {...cardAnim}>
                  <div className="panel secondary">
                    <div className="panel-head">
                      <div className="panel-title">Holdings map</div>
                      <p className="panel-subtitle">Normalized positions from the wallet.</p>
                    </div>
                    <div className="chart" role="img" aria-label="Portfolio allocation donut">
                      <ResponsiveContainer width="100%" height={240}>
                        <RadialBarChart
                          innerRadius="30%"
                          outerRadius="95%"
                          data={allocationChartData}
                          startAngle={90}
                          endAngle={-270}
                        >
                          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                          <RadialBar background dataKey="value" cornerRadius={8} isAnimationActive={allowChartAnimation} />
                          <Tooltip
                            formatter={(value: number, name: string, entry: any) =>
                              [`${value.toFixed(1)}%`, entry?.payload?.symbol ?? name]
                            }
                            contentStyle={{ background: '#0c0f1b', border: '1px solid #7ae0ff', color: '#e8f2ff' }}
                            itemStyle={{ color: '#e8f2ff' }}
                            labelStyle={{ color: '#e8f2ff' }}
                          />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="chart-legend">
                      {allocationSlices.map(slice => (
                        <div key={slice.name} className="legend-chip">
                          <span className="legend-swatch" style={{ background: slice.color }} />
                          <span className="value">{slice.symbol ?? slice.name}</span>
                          <span className="label">{slice.value.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <motion.div {...cardAnim}>
                  <div className="panel">
                    <div className="panel-head">
                      <div className="panel-title">Net flows</div>
                      <p className="panel-subtitle">Deposits vs withdrawals, refreshed live.</p>
                    </div>
                    <div className="chart" role="img" aria-label="Bar chart of inflows and outflows">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={flowChartData}>
                          <CartesianGrid stroke="rgba(148, 167, 198, 0.12)" vertical={false} />
                          <XAxis dataKey="label" tick={{ fill: '#94a7c6', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#94a7c6', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip
                            formatter={(value: number) => usd(Math.abs(value))}
                            contentStyle={{ background: '#0c0f1b', border: '1px solid #c08bff', color: '#e8f2ff' }}
                            labelStyle={{ color: '#e8f2ff' }}
                          />
                          <Bar
                            dataKey="inflow"
                            name="Inflow"
                            stackId="flows"
                            fill="#7df7c2"
                            radius={[8, 8, 0, 0]}
                            isAnimationActive={allowChartAnimation}
                          />
                          <Bar
                            dataKey="outflow"
                            name="Outflow"
                            stackId="flows"
                            fill="#ff8ba7"
                            radius={[0, 0, 8, 8]}
                            isAnimationActive={allowChartAnimation}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="chart-stat-grid">
                      <div className="chart-stat">
                        <div className="label">Latest inflow</div>
                        <div className="value">{usd(latestFlow.inflow ?? 0)}</div>
                      </div>
                      <div className="chart-stat">
                        <div className="label">Latest outflow</div>
                        <div className="value">{usd(latestFlow.outflow ?? 0)}</div>
                      </div>
                      <div className="chart-stat">
                        <div className="label">Net</div>
                        <div className={`value ${netFlow >= 0 ? 'positive' : 'negative'}`}>
                          {netFlow >= 0 ? '+' : '-'}
                          {usd(Math.abs(netFlow))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div {...cardAnim}>
                  <div className="panel secondary">
                    <div className="panel-head">
                      <div className="panel-title">PnL & drawdown</div>
                      <p className="panel-subtitle">Same feed, isolated to profit curve.</p>
                    </div>
                    <div className="chart" role="img" aria-label="PnL area chart for the wallet">
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={portfolioHistory}>
                          <defs>
                            <linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#c08bff" stopOpacity={0.7} />
                              <stop offset="100%" stopColor="#c08bff" stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="rgba(148, 167, 198, 0.12)" vertical={false} />
                          <XAxis dataKey="label" tick={{ fill: '#94a7c6', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#94a7c6', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip
                            formatter={(value: number) => usd(value)}
                            contentStyle={{ background: '#0c0f1b', border: '1px solid #c08bff', color: '#e8f2ff' }}
                            labelStyle={{ color: '#e8f2ff' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="pnl"
                            stroke="#c08bff"
                            fill="url(#pnlFill)"
                            strokeWidth={2.2}
                            isAnimationActive={allowChartAnimation}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="chart-stat-grid">
                      <div className="chart-stat">
                        <div className="label">Live PnL</div>
                        <div className={`value ${latestEquity.pnl >= 0 ? 'positive' : 'negative'}`}>
                          {latestEquity.pnl >= 0 ? '+' : '-'}
                          {usd(Math.abs(latestEquity.pnl))}
                        </div>
                      </div>
                      {topAllocation && (
                        <div className="chart-stat">
                          <div className="label">Top slice</div>
                          <div className="value">{topAllocation.symbol ?? topAllocation.name}</div>
                          <div className="label">{topAllocation.value.toFixed(1)}% allocation</div>
                        </div>
                      )}
                      <div className="chart-stat">
                        <div className="label">Health</div>
                        <div className="value">{riskHealth}%</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </section>
            </>
          )}
          {activePage === 'create' && (
            <section className="grid create-grid">
              <motion.div {...cardAnim}>
                <div className="panel">
                  <div className="panel-head">
                    <div className="panel-title">Create token draft</div>
                    <p className="panel-subtitle">Requires wallet authorization.</p>
                  </div>
                  {!isOnchainReady && <div className="auth-badge">Locked</div>}
                  <form className="form" onSubmit={handleCreateSubmit}>
                    <label className="field">
                      <span>Name</span>
                      <input
                        value={createDraft.name}
                        onChange={e => setCreateDraft(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Token name"
                        required
                        disabled={!isOnchainReady}
                      />
                    </label>
                    <label className="field">
                      <span>Symbol</span>
                      <input
                        value={createDraft.symbol}
                        onChange={e => setCreateDraft(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                        placeholder="TICK"
                        required
                        disabled={!isOnchainReady}
                      />
                    </label>
                    <label className="field">
                      <span>Chain</span>
                      <select
                        value={createDraft.chain}
                        onChange={e => setCreateDraft(prev => ({ ...prev, chain: e.target.value }))}
                        disabled={!isOnchainReady}
                      >
                        <option>Solana</option>
                        <option>Ethereum</option>
                        <option>Base</option>
                        <option>Polygon</option>
                      </select>
                    </label>
                    <label className="field">
                      <span>Supply</span>
                      <input
                        type="number"
                        value={createDraft.supply}
                        onChange={e => setCreateDraft(prev => ({ ...prev, supply: Number(e.target.value) }))}
                        min={1}
                        disabled={!isOnchainReady}
                      />
                    </label>
                    <label className="field">
                      <span>Hardcap (SOL)</span>
                      <input
                        type="number"
                        value={createDraft.hardcap}
                        onChange={e => setCreateDraft(prev => ({ ...prev, hardcap: Number(e.target.value) }))}
                        min={1}
                        disabled={!isOnchainReady}
                      />
                    </label>
                    <label className="field">
                      <span>Website</span>
                      <input
                        value={createDraft.website}
                        onChange={e => setCreateDraft(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://..."
                        disabled={!isOnchainReady}
                      />
                    </label>
                    <label className="field">
                      <span>Telegram</span>
                      <input
                        value={createDraft.telegram}
                        onChange={e => setCreateDraft(prev => ({ ...prev, telegram: e.target.value }))}
                        placeholder="https://t.me/..."
                        disabled={!isOnchainReady}
                      />
                    </label>
                    <div className="form-actions">
                      <button type="submit" className="btn-primary" disabled={!isOnchainReady}>
                        Save draft
                      </button>
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => (isOnchainReady ? toast('Preflight checks queued') : ensureAuthed('run preflight'))}
                      >
                        Run preflight
                      </button>
                    </div>
                  </form>
                  {authOverlay}
                </div>
              </motion.div>

              <motion.div {...cardAnim}>
                <div className="panel secondary">
                  <div className="panel-head">
                    <div className="panel-title">Preview</div>
                    <p className="panel-subtitle">Sends to wagmi client when you deploy.</p>
                  </div>
                  <div className="draft-preview">
                    <div className="preview-row">
                      <span>Name</span>
                      <span>{createDraft.name}</span>
                    </div>
                    <div className="preview-row">
                      <span>Symbol</span>
                      <span>{createDraft.symbol}</span>
                    </div>
                    <div className="preview-row">
                      <span>Chain</span>
                      <span>{createDraft.chain}</span>
                    </div>
                    <div className="preview-row">
                      <span>Supply</span>
                      <span>{compact(createDraft.supply)}</span>
                    </div>
                    <div className="preview-row">
                      <span>Hardcap</span>
                      <span>{createDraft.hardcap} SOL</span>
                    </div>
                    <div className="preview-row">
                      <span>Links</span>
                      <span>
                        {createDraft.website || '-'} | {createDraft.telegram || '-'}
                      </span>
                    </div>
                    <div className="preview-row CTA">
                      <div>
                        <div className="label">Wallet</div>
                        <div className="value">{isOnchainReady ? shortAddress(address) : 'Connect to deploy'}</div>
                      </div>
                      <button
                        className="btn-primary ghosty"
                        type="button"
                        onClick={() => (isOnchainReady ? toast('Deploy simulated (mock)') : ensureAuthed('deploy mock'))}
                        disabled={!isOnchainReady}
                      >
                        Deploy mock <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>
          )}
          {activePage === 'clicker' && (
            <section className="grid clicker-grid">
              <motion.div {...cardAnim}>
                <div className="panel">
                  <div className="panel-head">
                    <div className="panel-title">Arcade clicker</div>
                    <p className="panel-subtitle">Charge the pad to farm rewards. Drops land in the Rewards tab.</p>
                  </div>
                  <div className="clicker-arena">
                    <div className="clicker-meter">
                      <div className="clicker-meter-fill" style={{ width: `${clickerProgress}%` }} />
                    </div>
                    <div className="clicker-meter-label">
                      <span>{clickerProgress}% charge</span>
                      <span>{nextDropGap > 0 ? `${nextDropGap}% until next drop` : "Drop ready"}</span>
                    </div>

                    <motion.button
                      type="button"
                      className="clicker-button"
                      onClick={handleClickerTap}
                      {...clickerMotionProps}
                    >
                      <div className="clicker-button-mark">
                        <Sparkles size={18} />
                      </div>
                      <div className="clicker-button-copy">
                        <span className="label">Tap to charge</span>
                        <div className="value">
                          +{(9 + Math.min(clickerState.streak + 1, 18) * 0.45 + clickerState.boostLevel * 1.8 + (clickerState.autopilot ? 4 : 0)).toFixed(1)}%
                        </div>
                        <div className="clicker-hint">Streak boosts reward size</div>
                      </div>
                      <div className="clicker-button-tags">
                        <span className="pill pill-live">{clickerState.autopilot ? "Auto gain" : "Manual"}</span>
                        <span className="pill pill-positive">x{clickerState.boostLevel.toFixed(1)} boost</span>
                      </div>
                    </motion.button>

                    <div className="clicker-meta">
                      <div className="clicker-stat">
                        <div className="label">Streak</div>
                        <div className="value">{clickerState.streak}x</div>
                        <div className="clicker-hint">Don't stop clicking</div>
                      </div>
                      <div className="clicker-stat">
                        <div className="label">Total clicks</div>
                        <div className="value">{clickerState.totalClicks}</div>
                        <div className="clicker-hint">Fuel for every drop</div>
                      </div>
                      <div className="clicker-stat">
                        <div className="label">Est. next drop</div>
                        <div className="value">{estimatedDrop} pts</div>
                        <div className="clicker-hint">Auto-routed to Rewards</div>
                      </div>
                    </div>

                    <div className="clicker-actions">
                      <button className="btn-primary" type="button" onClick={handleClickerPulse}>
                        Pulse drop (-45% charge)
                      </button>
                      <button
                        type="button"
                        className={`ghost ${clickerState.autopilot ? 'active' : ''}`}
                        onClick={toggleAutopilot}
                      >
                        {clickerState.autopilot ? 'Autopilot on' : 'Enable autopilot'}
                      </button>
                      <button type="button" className="ghost tiny" onClick={() => setActivePage('rewards')}>
                        View Rewards
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div {...cardAnim}>
                <div className="panel secondary">
                  <div className="panel-head">
                    <div className="panel-title">Drop log</div>
                    <p className="panel-subtitle">Latest clicker rewards and bonus paths.</p>
                  </div>
                  <div className="clicker-log">
                    {lastArcadeReward ? (
                      <div className="reward-card">
                        <div>
                          <div className="label">{lastArcadeReward.type}</div>
                          <div className="value">{lastArcadeReward.amount} pts</div>
                          <div className="label">Pushed {timeAgo(lastArcadeReward.timestamp)} ago</div>
                        </div>
                        <div className="reward-actions">
                          <div className="pill pill-live">Rewards tab</div>
                          <button className="btn-connect alt" type="button" onClick={() => setActivePage('rewards')}>
                            Open
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="auth-wall">
                        <p>Start tapping the pad to forge your first drop.</p>
                      </div>
                    )}
                    <div className="clicker-tips">
                      <div className="clicker-tip">
                        <div className="value">x10 streak</div>
                        <div className="clicker-hint">+8 pts on the next drop</div>
                      </div>
                      <div className="clicker-tip">
                        <div className="value">Overdrive</div>
                        <div className="clicker-hint">Boost grows every time you empty the meter</div>
                      </div>
                      <div className="clicker-tip">
                        <div className="value">Pulse</div>
                        <div className="clicker-hint">Trade 45% charge for a quick reward</div>
                      </div>
                      <div className="clicker-tip">
                        <div className="value">Autopilot</div>
                        <div className="clicker-hint">Adds +4% charge on each tap�good for mobile</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>
          )}
          {activePage === 'rewards' && (
            <motion.section {...cardAnim} className="panel">
              <div className="panel-head">
                <div className="panel-title">Rewards</div>
                <p className="panel-subtitle">Claimed state is locally.</p>
              </div>
              <div className="rewards">
                {rewards.map(reward => (
                  <div key={reward.id} className="reward-card">
                    <div>
                      <div className="label">{reward.type}</div>
                      <div className="value">{reward.description}</div>
                      <div className="label">{new Date(reward.timestamp).toLocaleString()}</div>
                    </div>
                    <div className="reward-actions">
                      <div className="value">{reward.amount} pts</div>
                      <button
                        className={`btn-connect ${reward.claimed ? 'claimed' : ''}`}
                        onClick={() => handleClaimReward(reward.id)}
                        disabled={reward.claimed || claimingId === reward.id}
                      >
                        {reward.claimed ? 'Claimed' : claimingId === reward.id ? 'Claiming...' : 'Claim'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {activePage === 'news' && (
            <motion.section {...cardAnim} className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Latest News</div>
                  <p className="panel-subtitle">Curated updates from the crypto community on X.</p>
                </div>
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="btn-connect alt">
                  <XIcon size={14} />
                  Subscribe on X
                  <ExternalLink size={14} />
                </a>
              </div>
              <div className="news-feed">
                {newsPosts.map(post => (
                  <div key={post.id} className="news-post">
                    <div className="post-header">
                      <img src={post.avatar} alt={post.author} className="post-avatar" />
                      <div className="post-author-info">
                        <div className="post-author">
                          {post.author}
                          {post.verified && <BadgeCheck size={16} className="verified-badge" />}
                        </div>
                        <div className="post-handle">{post.handle}</div>
                      </div>
                      <div className="post-time">{timeAgo(post.timestamp)}</div>
                    </div>
                    <div className="post-content">{post.content}</div>
                    {post.images && post.images.length > 0 && (
                      <div className="post-images">
                        {post.images.map((img, idx) => (
                          <img key={idx} src={img} alt="Post content" className="post-image" />
                        ))}
                      </div>
                    )}
                    <div className="post-actions">
                      <button className="post-action">
                        <MessageCircle size={16} />
                        <span>{compact(post.replies)}</span>
                      </button>
                      <button className="post-action">
                        <Repeat2 size={16} />
                        <span>{compact(post.retweets)}</span>
                      </button>
                      <button className="post-action">
                        <Heart size={16} />
                        <span>{compact(post.likes)}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {activePage === 'profile' && (
            <section className="grid profile-grid">
              <motion.div {...cardAnim}>
                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <div className="panel-title">Profile</div>
                      <p className="panel-subtitle">Auth details live here � header stays clean.</p>
                    </div>
                    <span className="pill pill-live">{profileAuthLabel}</span>
                  </div>
                  <div className="profile profile-columns">
                    <div className="profile-row">
                      <span className="label">Display</span>
                      <span className="value">{profileHandle}</span>
                    </div>
                    <div className="profile-row">
                      <span className="label">Status</span>
                      <span className="value">{isAuthenticated ? "Session active" : "Guest preview"}</span>
                    </div>
                    <div className="profile-row">
                      <span className="label">Auth method</span>
                      <span className="value">{profileAuthLabel}</span>
                    </div>
                    <div className="profile-row">
                      <span className="label">Wallet</span>
                      <span className="value">{isWalletConnected ? shortAddress(address) : "Not connected"}</span>
                    </div>
                    <div className="profile-row">
                      <span className="label">Session strength</span>
                      <span className="value">{sessionSecurityScore}%</span>
                    </div>
                    <div className="profile-row">
                      <span className="label">Notes</span>
                      <span className="value">Telegram / socials only surface here, not in the header.</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div {...cardAnim}>
                <div className="panel secondary">
                  <div className="panel-head">
                    <div className="panel-title">Authorization</div>
                    <p className="panel-subtitle">Manage sign-in without requiring a wallet.</p>
                  </div>
                  <div className="session">
                    <div className="session-row">
                      <span className="label">Current identity</span>
                      <span className="value">{profileHandle}</span>
                    </div>
                    <div className="session-row">
                      <span className="label">Method</span>
                      <span className={`pill ${isAuthenticated ? 'pill-live' : 'pill-negative'}`}>{profileAuthLabel}</span>
                    </div>
                    <div className="session-row">
                      <span className="label">Wallet</span>
                      <span className={`pill ${isWalletConnected ? 'pill-positive' : 'pill-negative'}`}>
                        {isWalletConnected ? shortAddress(address) : 'Optional'}
                      </span>
                    </div>
                    <div className="session-row">
                      <span className="label">Active sessions</span>
                      <span className="value">{recentSessions.length}</span>
                    </div>
                    <div className="session-row">
                      <span className="label">Session strength</span>
                      <span className={`pill ${sessionSecurityScore >= 70 ? 'pill-positive' : 'pill-negative'}`}>
                        {sessionSecurityScore}% ready
                      </span>
                    </div>
                    <div className="session-actions">
                      {!isAuthenticated && (
                        <>
                          <button className="btn-primary" onClick={() => openAuthModal("login")}>Login</button>
                          <button className="ghost" onClick={() => openAuthModal("register")}>Register</button>
                          <button className="btn-connect alt" onClick={() => handleSocialAuth("Telegram")}><Send size={14} />Telegram</button>
                          <button className="btn-connect alt" onClick={() => handleSocialAuth("Discord")}><DiscordIcon size={14} />Discord</button>
                          <button className="btn-connect alt" onClick={() => handleSocialAuth("X")}><XIcon size={14} />X</button>
                        </>
                      )}
                      {isAuthenticated && !isWalletConnected && (
                        <>
                          <button className="btn-connect" onClick={() => handleConnect('metaMask')}>
                            MetaMask
                          </button>
                          <button className="btn-connect" onClick={() => handleConnect('trust')}>
                            Trust Wallet
                          </button>
                        </>
                      )}
                      {isAuthenticated && (
                        <button className="btn-signout" onClick={handleSocialLogout}>Sign out</button>
                      )}
                      {isWalletConnected && (
                        <button className="ghost" onClick={handleDisconnect}>Disconnect wallet</button>
                      )}
                    </div>
                    <div className="session-tags">
                      <span className="pill pill-live">{isAuthenticated ? "Signed in" : "Guest mode"}</span>
                      <span className={`pill ${isWalletConnected ? 'pill-positive' : 'pill-negative'}`}>
                        {isWalletConnected ? "Wallet linked" : "Wallet optional"}
                      </span>
                      <span className="pill">{recentSessions.length} sessions logged</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div {...cardAnim} style={{ gridColumn: "1 / -1" }}>
                <div className="panel secondary">
                  <div className="panel-head">
                    <div className="panel-title">Recent sessions</div>
                    <p className="panel-subtitle">devices and last activity for transparency.</p>
                  </div>
                  <div className="session-list">
                    {recentSessions.map(session => (
                      <div key={session.id} className="session-card">
                        <div className="session-card-head">
                          <div>
                            <div className="value">{session.device}</div>
                            <div className="label">{session.location} - {session.ip}</div>
                          </div>
                          <span
                            className={`pill ${
                              session.status === 'Active'
                                ? 'pill-positive'
                                : session.status === 'Signed out'
                                  ? 'pill-negative'
                                  : 'pill-live'
                            }`}
                          >
                            {session.status}
                          </span>
                        </div>
                        <div className="session-card-meta">
                          <span className="label">Auth: {session.provider}</span>
                          <span className="label">Identity: {session.identifier}</span>
                          <span className="label">Last active {timeAgo(session.lastActive)} ago</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </section>
          )}
        </main>
      </div>

      {renderAuthModal()}
      <Toaster
        position="bottom-right"
        gutter={14}
        containerStyle={{ bottom: 18, right: 12 }}
        toastOptions={{
          duration: 3800,
          className: "ml-toast",
          style: toastBaseStyle,
          success: {
            iconTheme: { primary: "var(--positive)", secondary: "#0a0c16" },
            style: {
              borderColor: "rgba(125, 247, 194, 0.65)",
              boxShadow: "0 18px 48px rgba(125, 247, 194, 0.3), 0 0 0 1px rgba(125, 247, 194, 0.35)",
            },
          },
          error: {
            iconTheme: { primary: "var(--negative)", secondary: "#0a0c16" },
            style: {
              borderColor: "rgba(255, 139, 166, 0.65)",
              boxShadow: "0 18px 48px rgba(255, 139, 166, 0.3), 0 0 0 1px rgba(255, 139, 166, 0.35)",
            },
          },
          loading: {
            iconTheme: { primary: "var(--accent-2)", secondary: "#0a0c16" },
          },
        }}
      />
    </div>
  );
}
