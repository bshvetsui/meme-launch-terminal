// Individual token row component
import React from 'react';
import type { Token } from '../../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TokenRowProps {
  token: Token;
}

export const TokenRow: React.FC<TokenRowProps> = ({ token }) => {
  const formatNumber = (num: number) => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const formatPrice = (price: number) => {
    if (price < 0.0001) return price.toExponential(2);
    return `$${price.toFixed(6)}`;
  };

  return (
    <tr className="border-b border-gray-800 hover:bg-secondary/50 transition-colors">
      <td className="p-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-success flex items-center justify-center">
            <span className="text-xs font-bold text-black">
              {token.symbol?.substring(0, 2) || 'TK'}
            </span>
          </div>
          <div>
            <div className="font-medium text-white">{token.name}</div>
            <div className="text-sm text-gray-400">{token.symbol}</div>
          </div>
        </div>
      </td>

      <td className="p-3 text-right">
        <div className="text-white font-mono">{formatPrice(token.price || 0)}</div>
      </td>

      <td className="p-3 text-right">
        <div className={`flex items-center justify-end space-x-1 ${
          (token.priceChange24h || 0) >= 0 ? 'text-success' : 'text-danger'
        }`}>
          {(token.priceChange24h || 0) >= 0 ? (
            <TrendingUp size={16} />
          ) : (
            <TrendingDown size={16} />
          )}
          <span className="font-mono">
            {Math.abs(token.priceChange24h || 0).toFixed(2)}%
          </span>
        </div>
      </td>

      <td className="p-3 text-right hidden md:table-cell">
        <div className="text-white font-mono">
          ${formatNumber(token.volume24h || 0)}
        </div>
      </td>

      <td className="p-3 text-right hidden lg:table-cell">
        <div className="text-white font-mono">
          ${formatNumber(token.marketCap || 0)}
        </div>
      </td>

      <td className="p-3">
        <div className="flex items-center justify-center space-x-2">
          <button className="px-4 py-1.5 bg-primary text-black font-medium rounded hover:bg-opacity-90 transition-all">
            Trade
          </button>
        </div>
      </td>
    </tr>
  );
};