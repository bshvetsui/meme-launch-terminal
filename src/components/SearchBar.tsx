// Search bar component
import React from 'react';
import './SearchBar.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="search-bar">
      <svg className="search-icon" viewBox="0 0 24 24" width="20" height="20">
        <path fill="none" stroke="currentColor" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <input
        type="text"
        className="search-input"
        placeholder="Search tokens..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button className="search-clear" onClick={() => onChange('')}>
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </button>
      )}
    </div>
  );
};