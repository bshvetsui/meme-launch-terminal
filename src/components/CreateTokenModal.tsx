import React, { useState } from 'react';
import { tokenApi } from '../services/api';
import type { Token } from '../types';
import './CreateTokenModal.css';

interface CreateTokenModalProps {
  onClose: () => void;
  onSuccess: (token: Token) => void;
}

export const CreateTokenModal: React.FC<CreateTokenModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    photo: '',
    twitter: '',
    telegram: '',
    website: '',
    supply: '1000000000',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: Create draft
      const draftData = {
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        photo: formData.photo || `https://ui-avatars.com/api/?name=${formData.symbol}&background=random`,
        twitter: formData.twitter,
        telegram: formData.telegram,
        website: formData.website,
        supply: parseInt(formData.supply),
      };

      const draft = await tokenApi.createDraft(draftData);

      // Step 2: Generate token transaction
      const generateResponse = await tokenApi.generateTokenTx(draft.token);

      // Step 3: Sign transaction (in real app would use wallet)
      // For now, just simulate success
      const signedToken = {
        ...draft,
        ...generateResponse,
        status: 'pending'
      };

      onSuccess(signedToken);
    } catch (err: any) {
      setError(err.message || 'Failed to create token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-header">
          <h2>Create New Token</h2>
          <p>Launch your meme token on Solana</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Token Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Pepe Meme"
                required
              />
            </div>

            <div className="form-group">
              <label>Symbol *</label>
              <input
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                placeholder="e.g. PEPE"
                required
                maxLength={10}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your token..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Token Supply</label>
            <input
              type="number"
              name="supply"
              value={formData.supply}
              onChange={handleChange}
              placeholder="1000000000"
            />
          </div>

          <div className="form-group">
            <label>Logo URL</label>
            <input
              type="url"
              name="photo"
              value={formData.photo}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Twitter</label>
              <input
                type="text"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="@username"
              />
            </div>

            <div className="form-group">
              <label>Telegram</label>
              <input
                type="text"
                name="telegram"
                value={formData.telegram}
                onChange={handleChange}
                placeholder="@channel"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Token'}
          </button>
        </form>
      </div>
    </div>
  );
};