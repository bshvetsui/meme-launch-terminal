// Token list component displaying all available tokens
import React, { useState, useEffect } from 'react';
import type { Token } from '../../types';
import { mockTokens } from '../../data/mockData';
import { TokenRow } from './TokenRow';
import { ArrowUpDown, TrendingUp, Clock, DollarSign } from 'lucide-react';

type SortField = 'name' | 'price' | 'priceChange24h' | 'volume24h' | 'marketCap' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export const TokenList: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>(mockTokens);
  const [sortField, setSortField] = useState<SortField>('volume24h');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filter, setFilter] = useState<'all' | 'gainers' | 'losers' | 'new'>('all');

  useEffect(() => {
    // Sort and filter tokens
    let filteredTokens = [...mockTokens];

    // Apply filter
    switch (filter) {
      case 'gainers':
        filteredTokens = filteredTokens.filter(t => (t.priceChange24h || 0) > 0);
        break;
      case 'losers':
        filteredTokens = filteredTokens.filter(t => (t.priceChange24h || 0) < 0);
        break;
      case 'new':
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        filteredTokens = filteredTokens.filter(t => (t.createdAt || 0) > dayAgo);
        break;
    }

    // Apply sorting
    filteredTokens.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (aValue === undefined) aValue = 0;
      if (bValue === undefined) bValue = 0;

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setTokens(filteredTokens);
  }, [sortField, sortOrder, filter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="w-full">
      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 mb-4 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'all'
              ? 'bg-primary text-black'
              : 'bg-secondary text-gray-300 hover:bg-gray-700'
          }`}
        >
          All Tokens
        </button>
        <button
          onClick={() => setFilter('gainers')}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
            filter === 'gainers'
              ? 'bg-success text-black'
              : 'bg-secondary text-gray-300 hover:bg-gray-700'
          }`}
        >
          <TrendingUp size={16} />
          <span>Gainers</span>
        </button>
        <button
          onClick={() => setFilter('losers')}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
            filter === 'losers'
              ? 'bg-danger text-white'
              : 'bg-secondary text-gray-300 hover:bg-gray-700'
          }`}
        >
          <TrendingUp size={16} className="rotate-180" />
          <span>Losers</span>
        </button>
        <button
          onClick={() => setFilter('new')}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
            filter === 'new'
              ? 'bg-warning text-black'
              : 'bg-secondary text-gray-300 hover:bg-gray-700'
          }`}
        >
          <Clock size={16} />
          <span>New</span>
        </button>
      </div>

      {/* Token Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left p-3 text-gray-400 font-medium">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-1 hover:text-primary transition-colors"
                >
                  <span>Token</span>
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="text-right p-3 text-gray-400 font-medium">
                <button
                  onClick={() => handleSort('price')}
                  className="flex items-center space-x-1 hover:text-primary transition-colors ml-auto"
                >
                  <span>Price</span>
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="text-right p-3 text-gray-400 font-medium">
                <button
                  onClick={() => handleSort('priceChange24h')}
                  className="flex items-center space-x-1 hover:text-primary transition-colors ml-auto"
                >
                  <span>24h %</span>
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="text-right p-3 text-gray-400 font-medium hidden md:table-cell">
                <button
                  onClick={() => handleSort('volume24h')}
                  className="flex items-center space-x-1 hover:text-primary transition-colors ml-auto"
                >
                  <span>Volume</span>
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="text-right p-3 text-gray-400 font-medium hidden lg:table-cell">
                <button
                  onClick={() => handleSort('marketCap')}
                  className="flex items-center space-x-1 hover:text-primary transition-colors ml-auto"
                >
                  <span>Market Cap</span>
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="text-center p-3 text-gray-400 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token) => (
              <TokenRow key={token.token} token={token} />
            ))}
          </tbody>
        </table>
      </div>

      {tokens.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <DollarSign size={48} className="mx-auto mb-4 opacity-50" />
          <p>No tokens found</p>
        </div>
      )}
    </div>
  );
};