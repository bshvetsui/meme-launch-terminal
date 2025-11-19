// Price chart component using Recharts
import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { mockChartData } from '../../data/mockData';

interface PriceChartProps {
  tokenSymbol?: string;
}

export const PriceChart: React.FC<PriceChartProps> = () => {
  const data = mockChartData;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className="glass-effect p-3 rounded-lg">
          <p className="text-sm text-gray-400">{payload[0].payload.time}</p>
          <p className="text-lg font-mono text-primary">
            ${payload[0].value.toFixed(6)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-effect rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Price Chart</h2>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 bg-primary text-black rounded text-sm font-medium">
            24H
          </button>
          <button className="px-3 py-1 bg-secondary text-gray-300 rounded text-sm hover:bg-gray-700">
            7D
          </button>
          <button className="px-3 py-1 bg-secondary text-gray-300 rounded text-sm hover:bg-gray-700">
            30D
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2B35" />
          <XAxis
            dataKey="time"
            stroke="#6B7280"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            stroke="#6B7280"
            tick={{ fontSize: 12 }}
            domain={['dataMin', 'dataMax']}
            tickFormatter={(value) => `$${value.toFixed(5)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#00D4FF"
            strokeWidth={2}
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div>
          <p className="text-sm text-gray-400">24h High</p>
          <p className="text-lg font-mono text-success">$0.012900</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">24h Low</p>
          <p className="text-lg font-mono text-danger">$0.012000</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">24h Volume</p>
          <p className="text-lg font-mono">$125.0K</p>
        </div>
      </div>
    </div>
  );
};