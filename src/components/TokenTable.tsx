// Token table component matching the screenshot
import React, { memo } from 'react';
import type { Token } from '../types';
import { formatPrice, formatVolume, formatProgress, getTimeAgo, shortenAddress } from '../utils/formatters';
import './TokenTable.css';

interface TokenTableProps {
  tokens: Token[];
  loading: boolean;
  onTradeClick?: (token: Token) => void;
}

export const TokenTable = memo<TokenTableProps>(({ tokens, loading, onTradeClick }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
                    {shortenAddress(token.token || '')}
                  </span>
                  <button
                    className="btn-copy"
                    onClick={() => copyToClipboard(token.token || '')}
                    title="Copy address"
                  >
                    📋
                  </button>
                  <div className="ca-creator">
                    by {shortenAddress(token.creator || 'Unknown')}
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
                <button
                  className="btn-trade"
                  onClick={() => onTradeClick?.(token)}
                >
                  Trade
                </button>
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