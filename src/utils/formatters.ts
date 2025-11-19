// Utility functions for formatting data

export const formatPrice = (price?: number): string => {
  if (!price) return '$0';
  if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `$${(price / 1000).toFixed(0)}K`;
  return `$${price.toFixed(0)}`;
};

export const formatVolume = (volume?: number): string => {
  if (!volume) return '$0';
  if (volume >= 1000000) return `$${(volume / 1000000).toFixed(0)}M`;
  if (volume >= 1000) return `$${(volume / 1000).toFixed(0)}K`;
  return `$${volume.toFixed(0)}`;
};

export const formatProgress = (current?: number, total?: number): number => {
  if (!current || !total) return 0;
  return Math.min((current / total) * 100, 100);
};

export const getTimeAgo = (timestamp?: number): string => {
  if (!timestamp) return 'now';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
};

export const shortenAddress = (address: string, chars = 4): string => {
  if (!address) return 'N/A';
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};