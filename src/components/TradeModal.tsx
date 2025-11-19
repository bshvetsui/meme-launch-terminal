import React, { useState } from 'react';
import type { Token } from '../types';
import { formatPrice, formatVolume, shortenAddress } from '../utils/formatters';
import './TradeModal.css';

interface TradeModalProps {
  token: Token;
  onClose: () => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({ token, onClose }) => {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState('1');
  const [showSettings, setShowSettings] = useState(false);

  const calculateReceive = () => {
    if (!amount || isNaN(Number(amount))) return 0;
    const price = token.price || 0.00001;
    return tradeType === 'buy'
      ? Number(amount) / price
      : Number(amount) * price;
  };

  const handleTrade = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Trade:', { token, type: tradeType, amount });
    // Implement actual trade logic
  };

  const transactions = [
    { date: '21s ago', type: 'buy', sol: 0.10, tokens: '3.49M', account: 'GTMm...jhvq', txn: '3bbX...Nkwu' },
    { date: '22s ago', type: 'sell', sol: 0.01, tokens: '357.55K', account: 'safu...2Hvk', txn: '3tjh...wbM4' },
    { date: '27s ago', type: 'buy', sol: 0.01, tokens: '357.55K', account: 'safu...2Hvk', txn: '41Sm...7nfq' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="trade-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="trade-container">
          {/* Left side - Token info and trade form */}
          <div className="trade-left">
            <div className="token-header">
              <img
                src={token.photo || `https://ui-avatars.com/api/?name=${token.symbol}&background=random`}
                alt={token.name}
                className="token-large-avatar"
              />
              <div className="token-details">
                <h2>{token.name} / {token.symbol}</h2>
                <p className="token-creator">by {shortenAddress(token.creator || 'Unknown')}</p>
                <p className="token-time">Created {new Date(token.createdAt || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="token-stats">
              <div className="stat-item">
                <span className="stat-label">Current price:</span>
                <span className="stat-value">{token.price?.toFixed(6)} SOL</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Available tokens:</span>
                <span className="stat-value">{formatVolume(token.supply)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Progress:</span>
                <div className="progress-bar-mini">
                  <div
                    className="progress-fill-mini"
                    style={{ width: `${((token.raised || 0) / (token.hardcap || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="trade-form">
              <div className="trade-tabs">
                <button
                  className={`trade-tab ${tradeType === 'buy' ? 'active' : ''}`}
                  onClick={() => setTradeType('buy')}
                >
                  Buy
                </button>
                <button
                  className={`trade-tab ${tradeType === 'sell' ? 'active' : ''}`}
                  onClick={() => setTradeType('sell')}
                >
                  Sell
                </button>
              </div>

              <form onSubmit={handleTrade}>
                <div className="form-group">
                  <label>Amount to {tradeType} (SOL)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>You will receive:</label>
                  <div className="receive-amount">
                    {calculateReceive().toLocaleString()} {tradeType === 'buy' ? 'tokens' : 'SOL'}
                  </div>
                </div>

                <button type="submit" className="btn-trade-submit">
                  {tradeType === 'buy' ? 'Buy' : 'Sell'}
                </button>

                <button
                  type="button"
                  className="btn-settings"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  ⚙️ Custom Settings
                </button>

                {showSettings && (
                  <div className="trade-settings">
                    <div className="form-group">
                      <label>Slippage Tolerance (%)</label>
                      <input
                        type="number"
                        value={slippage}
                        onChange={(e) => setSlippage(e.target.value)}
                        min="0.1"
                        max="50"
                        step="0.1"
                      />
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Right side - Transactions */}
          <div className="trade-right">
            <h3>Transactions</h3>
            <div className="transactions-table">
              <table>
                <thead>
                  <tr>
                    <th>DATE</th>
                    <th>TYPE</th>
                    <th>SOL</th>
                    <th>TOKEN</th>
                    <th>ACCOUNT</th>
                    <th>TXN</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, i) => (
                    <tr key={i}>
                      <td className="tx-date">{tx.date}</td>
                      <td className={`tx-type ${tx.type}`}>{tx.type}</td>
                      <td className="tx-sol">{tx.sol}</td>
                      <td className="tx-tokens">{tx.tokens}</td>
                      <td className="tx-account">
                        <a href={`https://solscan.io/account/${tx.account}`} target="_blank" rel="noopener noreferrer">
                          {tx.account}
                        </a>
                      </td>
                      <td className="tx-txn">
                        <a href={`https://solscan.io/tx/${tx.txn}`} target="_blank" rel="noopener noreferrer">
                          {tx.txn}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};