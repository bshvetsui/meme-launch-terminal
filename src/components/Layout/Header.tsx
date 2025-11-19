// Header component for the trading terminal
import React from 'react';
import { Search, Menu, X } from 'lucide-react';

interface HeaderProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-success rounded-lg"></div>
              <span className="text-xl font-bold text-gradient">memeLaunch</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search tokens..."
                className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg border border-gray-700 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Navigation and Actions */}
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">Tokens</a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">Launch</a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">Portfolio</a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">Rewards</a>
            </nav>

            <button className="px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-opacity-90 transition-all">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};