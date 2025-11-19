// Token launch component for creating new tokens
import React, { useState } from 'react';
import { Upload, AlertCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export const LaunchToken: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    supply: '1000000000',
    decimals: '9',
    hardcap: '',
    website: '',
    twitter: '',
    telegram: '',
    imageUrl: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLaunch = async () => {
    // Validate required fields
    if (!formData.name || !formData.symbol || !formData.supply || !formData.hardcap) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate token creation
      console.log('Launching token:', formData);
      toast.success('Token launch initiated successfully!');
    } catch (error) {
      console.error('Error launching token:', error);
      toast.error('Failed to launch token');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-effect rounded-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-gradient">Launch Your Token</h2>

        {/* Info Banner */}
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6 flex items-start space-x-3">
          <Info className="text-primary mt-0.5" size={20} />
          <div className="text-sm">
            <p className="font-medium text-primary mb-1">Fair Launch Protocol</p>
            <p className="text-gray-300">
              All tokens are launched with a fair distribution model. No pre-mine, no team allocation.
              The hardcap determines the maximum SOL that can be raised during the bonding curve phase.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Token Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-3">Token Information</h3>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Token Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Solana Meme"
                className="w-full px-4 py-3 bg-secondary rounded-lg border border-gray-700 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Token Symbol <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleInputChange}
                placeholder="e.g., SMEME"
                maxLength={10}
                className="w-full px-4 py-3 bg-secondary rounded-lg border border-gray-700 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your token..."
                rows={4}
                className="w-full px-4 py-3 bg-secondary rounded-lg border border-gray-700 focus:border-primary focus:outline-none transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Total Supply <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                name="supply"
                value={formData.supply}
                onChange={handleInputChange}
                placeholder="1000000000"
                className="w-full px-4 py-3 bg-secondary rounded-lg border border-gray-700 focus:border-primary focus:outline-none transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Hardcap (SOL) <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                name="hardcap"
                value={formData.hardcap}
                onChange={handleInputChange}
                placeholder="85"
                className="w-full px-4 py-3 bg-secondary rounded-lg border border-gray-700 focus:border-primary focus:outline-none transition-colors font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum SOL to be raised during bonding curve
              </p>
            </div>
          </div>

          {/* Social & Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-3">Social & Media</h3>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Token Image</label>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="mx-auto mb-3 text-gray-400" size={40} />
                <p className="text-sm text-gray-400">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to 2MB
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://yourtoken.com"
                className="w-full px-4 py-3 bg-secondary rounded-lg border border-gray-700 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Twitter/X</label>
              <input
                type="text"
                name="twitter"
                value={formData.twitter}
                onChange={handleInputChange}
                placeholder="@yourtoken"
                className="w-full px-4 py-3 bg-secondary rounded-lg border border-gray-700 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Telegram</label>
              <input
                type="url"
                name="telegram"
                value={formData.telegram}
                onChange={handleInputChange}
                placeholder="https://t.me/yourtoken"
                className="w-full px-4 py-3 bg-secondary rounded-lg border border-gray-700 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Launch Summary */}
        <div className="mt-8 p-6 bg-secondary rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Launch Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Creation Fee</span>
              <span className="font-mono">0.01 SOL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Initial Liquidity</span>
              <span className="font-mono">Auto-generated</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Trading Start</span>
              <span className="font-mono">Immediately after creation</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">LP Tokens</span>
              <span className="font-mono">Burned</span>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="mt-6 p-4 bg-danger/10 border border-danger/30 rounded-lg flex items-start space-x-3">
          <AlertCircle className="text-danger mt-0.5" size={20} />
          <div className="text-sm">
            <p className="font-medium text-danger mb-1">Important Notice</p>
            <p className="text-gray-300">
              Token creation is irreversible. Ensure all information is correct before launching.
              The smart contract will be immutable and ownership will be renounced.
            </p>
          </div>
        </div>

        {/* Launch Button */}
        <button
          onClick={handleLaunch}
          disabled={isLoading || !formData.name || !formData.symbol || !formData.hardcap}
          className="w-full mt-8 py-4 bg-gradient-to-r from-primary to-success text-black font-bold text-lg rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Launching...' : 'Launch Token'}
        </button>
      </div>
    </div>
  );
};