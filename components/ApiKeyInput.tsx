'use client';

import React, { useState } from 'react';
import { AuthType } from '../lib/api/types';
import { KeyIcon, EyeIcon, EyeOffIcon, CopyIcon, CheckIcon, XIcon, ShieldIcon } from './Icons';

interface ApiKeyInputProps {
  authType: AuthType;
  onChangeAuthType: (type: AuthType) => void;
  apiKey: string;
  onChangeApiKey: (key: string) => void;
  customAuthHeaderKey?: string;
  onChangeCustomAuthHeaderKey?: (key: string) => void;
  customAuthQueryKey?: string;
  onChangeCustomAuthQueryKey?: (key: string) => void;
}

export function ApiKeyInput({
  authType,
  onChangeAuthType,
  apiKey,
  onChangeApiKey,
  customAuthHeaderKey = 'x-goog-api-key',
  onChangeCustomAuthHeaderKey,
  customAuthQueryKey = 'key',
  onChangeCustomAuthQueryKey
}: ApiKeyInputProps) {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="glass-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          <KeyIcon size={14} style={{ color: 'var(--accent-amber)' }} />
          <span>Authentication Strategy</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <ShieldIcon size={12} style={{ color: 'var(--accent-emerald)' }} />
          <span>Masked in Session</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px' }}>
        {[
          { id: 'bearer', label: 'Bearer Token' },
          { id: 'x-api-key', label: 'x-api-key' },
          { id: 'custom-header', label: 'Custom Header' },
          { id: 'query-param', label: 'Query Param' },
          { id: 'none', label: 'No Auth' }
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChangeAuthType(item.id as AuthType)}
            className={`forge-btn ${authType === item.id ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
            style={{ padding: '6px 10px', fontSize: '12px', border: '1px solid var(--border-subtle)' }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {authType !== 'none' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Custom Header or Query Key inputs */}
          {authType === 'custom-header' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', width: '100px' }}>Header Name:</label>
              <input
                type="text"
                value={customAuthHeaderKey}
                onChange={(e) => onChangeCustomAuthHeaderKey && onChangeCustomAuthHeaderKey(e.target.value)}
                placeholder="e.g. x-goog-api-key, Authorization, api-key"
                className="forge-input forge-input-mono"
              />
            </div>
          )}

          {authType === 'query-param' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', width: '100px' }}>Param Name:</label>
              <input
                type="text"
                value={customAuthQueryKey}
                onChange={(e) => onChangeCustomAuthQueryKey && onChangeCustomAuthQueryKey(e.target.value)}
                placeholder="e.g. key, api_key, token"
                className="forge-input forge-input-mono"
              />
            </div>
          )}

          {/* API Key value input with Show/Hide/Copy/Clear */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => onChangeApiKey(e.target.value)}
                placeholder="Enter API Key or use {{API_KEY}} variable"
                className="forge-input forge-input-mono"
                style={{ paddingRight: '36px' }}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title={showKey ? 'Hide API Key' : 'Show API Key'}
              >
                {showKey ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!apiKey}
              className="forge-btn forge-btn-ghost"
              style={{ padding: '8px 10px' }}
              title="Copy API Key"
            >
              {copied ? <CheckIcon size={14} style={{ color: 'var(--accent-emerald)' }} /> : <CopyIcon size={14} />}
            </button>

            <button
              type="button"
              onClick={() => onChangeApiKey('')}
              disabled={!apiKey}
              className="forge-btn forge-btn-ghost"
              style={{ padding: '8px 10px' }}
              title="Clear Key"
            >
              <XIcon size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
