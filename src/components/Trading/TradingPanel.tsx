// Trading panel component for buy/sell operations
import React, { useState } from 'react';
import type { Token } from '../../types';
import { AlertCircle } from 'lucide-react';

interface TradingPanelProps {
  token: Token | null;
}

export const TradingPanel: React.FC<TradingPanelProps> = ({ token }) => {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState('1');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState('');

  const handleTrade = () => {
    console.log('Executing trade:', {
      token: token?.symbol,
      side,
      amount,
      slippage,
      orderType,
      limitPrice: orderType === 'limit' ? limitPrice : undefined,
    });
  };

  if (!token) {
    return (
      <div className="glass-effect rounded-lg p-6 text-center">
        <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-gray-400">Select a token to start trading</p>
      </div>
    );
  }

  return (
    <div className="glass-effect rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">{token.name}</h2>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">{token.symbol}</span>
          <span className="font-mono">${token.price?.toFixed(6) || '0.000000'}</span>
        </div>
      </div>

      {/* Buy/Sell Toggle */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <button
          onClick={() => setSide('buy')}
          className={`py-3 rounded-lg font-medium transition-all ${
            side === 'buy'
              ? 'bg-success text-black'
              : 'bg-secondary text-gray-300 hover:bg-gray-700'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide('sell')}
          className={`py-3 rounded-lg font-medium transition-all ${
            side === 'sell'
              ? 'bg-danger text-white'
              : 'bg-secondary text-gray-300 hover:bg-gray-700'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Order Type */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Order Type</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setOrderType('market')}
            className={`py-2 rounded-lg text-sm font-medium transition-all ${
              orderType === 'market'
                ? 'bg-primary text-black'
                : 'bg-secondary text-gray-300 hover:bg-gray-700'
            }`}
          >
            Market
          </button>
          <button
            onClick={() => setOrderType('limit')}
            className={`py-2 rounded-lg text-sm font-medium transition-all ${
              orderType === 'limit'
                ? 'bg-primary text-black'
                : 'bg-secondary text-gray-300 hover:bg-gray-700'
            }`}
          >
            Limit
          </button>
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Amount (SOL)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full px-4 py-3 bg-secondary rounded-lg border border-gray-700 focus:border-primary focus:outline-none transition-colors font-mono"
        />
        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
          <span>Balance: 100.00 SOL</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setAmount('25')}
              className="px-2 py-1 bg-secondary rounded hover:bg-gray-700 transition-colors"
            >
              25%
            </button>
            <button
              onClick={() => setAmount('50')}
              className="px-2 py-1 bg-secondary rounded hover:bg-gray-700 transition-colors"
            >
              50%
            </button>
            <button
              onClick={() => setAmount('100')}
              className="px-2 py-1 bg-secondary rounded hover:bg-gray-700 transition-colors"
            >
              MAX
            </button>
          </div>
        </div>
      </div>

      {/* Limit Price Input */}
      {orderType === 'limit' && (
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Limit Price</label>
          <input
            type="number"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            placeholder="0.000000"
            className="w-full px-4 py-3 bg-secondary rounded-lg border border-gray-700 focus:border-primary focus:outline-none transition-colors font-mono"
          />
        </div>
      )}

      {/* Slippage Tolerance */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Slippage Tolerance</label>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSlippage('0.5')}
            className={`px-3 py-1 rounded text-sm ${
              slippage === '0.5' ? 'bg-primary text-black' : 'bg-secondary text-gray-300'
            }`}
          >
            0.5%
          </button>
          <button
            onClick={() => setSlippage('1')}
            className={`px-3 py-1 rounded text-sm ${
              slippage === '1' ? 'bg-primary text-black' : 'bg-secondary text-gray-300'
            }`}
          >
            1%
          </button>
          <button
            onClick={() => setSlippage('3')}
            className={`px-3 py-1 rounded text-sm ${
              slippage === '3' ? 'bg-primary text-black' : 'bg-secondary text-gray-300'
            }`}
          >
            3%
          </button>
          <input
            type="number"
            value={slippage}
            onChange={(e) => setSlippage(e.target.value)}
            className="flex-1 px-3 py-1 bg-secondary rounded text-sm border border-gray-700 focus:border-primary focus:outline-none"
            placeholder="Custom"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 p-4 bg-secondary rounded-lg">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">You Pay</span>
          <span className="font-mono">{amount || '0'} SOL</span>
        </div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">You Receive (est.)</span>
          <span className="font-mono">
            {amount && token.price
              ? (parseFloat(amount) / token.price).toFixed(2)
              : '0'}{' '}
            {token.symbol}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Price Impact</span>
          <span className="text-warning">~0.05%</span>
        </div>
      </div>

      {/* Trade Button */}
      <button
        onClick={handleTrade}
        disabled={!amount}
        className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
          side === 'buy'
            ? 'bg-success text-black hover:bg-opacity-90'
            : 'bg-danger text-white hover:bg-opacity-90'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {side === 'buy' ? 'Buy' : 'Sell'} {token.symbol}
      </button>
    </div>
  );
};