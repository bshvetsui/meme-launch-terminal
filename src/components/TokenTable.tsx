// Token table component matching the screenshot
import React, { memo } from 'react';
import type { Token } from '../types';
import './TokenTable.css';

interface TokenTableProps {
  tokens: Token[];
  loading: boolean;
}

export const TokenTable = memo<TokenTableProps>(({ tokens, loading }) => {
  const formatPrice = (price?: number) => {
    if (!price) return '$0';
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `$${(price / 1000).toFixed(0)}K`;
    return `$${price.toFixed(0)}`;
  };

  const formatVolume = (volume?: number) => {
    if (!volume) return '$0';
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(0)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(0)}K`;
    return `$${volume.toFixed(0)}`;
  };

  const formatProgress = (current?: number, total?: number) => {
    if (!current || !total) return 0;
    return Math.min((current / total) * 100, 100);
  };

  const getTimeAgo = (timestamp?: number) => {
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

  if (loading) {
    return <div className="loading">Loading tokens...</div>;
  }

  return (
    <div className="token-table">
      <table>
        <thead>
          <tr>
            <th className="th-token">TOKEN</th>
            <th className="th-ca">CA</th>
            <th className="th-right">VOLUME</th>
            <th className="th-right">MARKET CAP</th>
            <th className="th-progress">PROGRESS</th>
            <th className="th-right"># HOLDERS</th>
            <th className="th-action">TRADE</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token, index) => (
            <tr key={token.token || index}>
              <td className="td-token">
                <div className="token-info">
                  <img
                    src={token.photo || `https://ui-avatars.com/api/?name=${token.symbol}&background=random`}
                    alt={token.symbol}
                    className="token-avatar"
                  />
                  <div>
                    <div className="token-name">{token.name || 'Unknown Token'}</div>
                    <div className="token-time">{getTimeAgo(token.createdAt)}</div>
                  </div>
                </div>
              </td>

              <td className="td-ca">
                <div className="ca-info">
                  <span className="ca-address">
                    {token.token ? `${token.token.slice(0, 4)}...${token.token.slice(-4)}` : 'N/A'}
                  </span>
                  <button className="btn-copy">📋</button>
                  <div className="ca-creator">
                    by {token.creator ? `${token.creator.slice(0, 4)}...${token.creator.slice(-4)}` : 'Unknown'}
                  </div>
                </div>
              </td>

              <td className="td-right">
                <div className="volume-info">
                  <div className="volume-amount">{formatVolume(token.volume24h)}</div>
                  <div className="volume-count">{token.trades || 0} / {token.buys || 0}</div>
                </div>
              </td>

              <td className="td-right">
                <div className="market-cap">{formatPrice(token.marketCap)}</div>
                <div className="market-price">${token.price?.toFixed(6) || '0.000000'}</div>
              </td>

              <td className="td-progress">
                <div className="progress-container">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${formatProgress(token.raised, token.hardcap)}%` }}
                    />
                  </div>
                  <div className="progress-stats">
                    <span className="progress-percent">{formatProgress(token.raised, token.hardcap).toFixed(2)}%</span>
                    <span className="progress-change">
                      {token.priceChange24h ?
                        <span className={token.priceChange24h > 0 ? 'positive' : 'negative'}>
                          {token.priceChange24h > 0 ? '↑' : '↓'} {Math.abs(token.priceChange24h).toFixed(2)}%
                        </span>
                        : '0.00%'
                      }
                    </span>
                  </div>
                </div>
              </td>

              <td className="td-right">
                <div className="holders">{token.holders || 1}</div>
              </td>

              <td className="td-action">
                <button className="btn-trade">⚡ Trade</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {tokens.length === 0 && (
        <div className="empty-state">
          <p>No tokens found</p>
        </div>
      )}
    </div>
  );
});