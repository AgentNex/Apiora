'use client';

import React from 'react';
import { HeaderEntry } from '../lib/api/types';
import { PlusIcon, TrashIcon, LayersIcon } from './Icons';

interface HeaderEditorProps {
  headers: HeaderEntry[];
  onChangeHeaders: (headers: HeaderEntry[]) => void;
}

export function HeaderEditor({ headers, onChangeHeaders }: HeaderEditorProps) {
  const handleToggle = (id: string) => {
    onChangeHeaders(
      headers.map((h) => (h.id === id ? { ...h, enabled: !h.enabled } : h))
    );
  };

  const handleUpdate = (id: string, field: 'key' | 'value', val: string) => {
    onChangeHeaders(
      headers.map((h) => (h.id === id ? { ...h, [field]: val } : h))
    );
  };

  const handleDelete = (id: string) => {
    onChangeHeaders(headers.filter((h) => h.id !== id));
  };

  const handleAdd = () => {
    onChangeHeaders([
      ...headers,
      { id: 'h_' + Math.random().toString(36).substring(2, 7), key: '', value: '', enabled: true }
    ]);
  };

  const handleAddPreset = (key: string, value: string) => {
    if (headers.some((h) => h.key.toLowerCase() === key.toLowerCase())) return;
    onChangeHeaders([
      ...headers,
      { id: 'h_' + Math.random().toString(36).substring(2, 7), key, value, enabled: true }
    ]);
  };

  return (
    <div className="glass-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
          <LayersIcon size={15} style={{ color: 'var(--accent-primary)' }} />
          <span>HTTP Headers ({headers.filter((h) => h.enabled).length} active)</span>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="forge-btn forge-btn-primary"
          style={{ padding: '5px 10px', fontSize: '12px' }}
        >
          <PlusIcon size={13} />
          <span>Add Header</span>
        </button>
      </div>

      {/* Quick Add Presets Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Quick Add:</span>
        <button
          type="button"
          onClick={() => handleAddPreset('Content-Type', 'application/json')}
          className="forge-btn forge-btn-ghost"
          style={{ padding: '2px 6px', fontSize: '11px' }}
        >
          + Content-Type: json
        </button>
        <button
          type="button"
          onClick={() => handleAddPreset('Accept', 'application/json')}
          className="forge-btn forge-btn-ghost"
          style={{ padding: '2px 6px', fontSize: '11px' }}
        >
          + Accept: json
        </button>
        <button
          type="button"
          onClick={() => handleAddPreset('anthropic-version', '2023-06-01')}
          className="forge-btn forge-btn-ghost"
          style={{ padding: '2px 6px', fontSize: '11px' }}
        >
          + anthropic-version
        </button>
        <button
          type="button"
          onClick={() => handleAddPreset('HTTP-Referer', 'https://apiforge.ai')}
          className="forge-btn forge-btn-ghost"
          style={{ padding: '2px 6px', fontSize: '11px' }}
        >
          + OpenRouter Referer
        </button>
      </div>

      {/* Dynamic Headers Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {headers.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            No custom headers configured. Click "Add Header" above.
          </div>
        ) : (
          headers.map((h) => (
            <div
              key={h.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '32px 1fr 1.5fr 36px',
                gap: '8px',
                alignItems: 'center',
                background: h.enabled ? 'var(--bg-input)' : 'rgba(255,255,255,0.02)',
                padding: '6px 8px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                opacity: h.enabled ? 1 : 0.6
              }}
            >
              {/* Enable checkbox */}
              <input
                type="checkbox"
                checked={h.enabled}
                onChange={() => handleToggle(h.id)}
                style={{ cursor: 'pointer', accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
                title={h.enabled ? 'Disable header' : 'Enable header'}
              />

              {/* Key Input */}
              <input
                type="text"
                value={h.key}
                onChange={(e) => handleUpdate(h.id, 'key', e.target.value)}
                placeholder="Header name (e.g. Content-Type)"
                className="forge-input-mono"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '12.5px'
                }}
              />

              {/* Value Input */}
              <input
                type="text"
                value={h.value}
                onChange={(e) => handleUpdate(h.id, 'value', e.target.value)}
                placeholder="Value (supports {{VARIABLE}})"
                className="forge-input-mono"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '12.5px'
                }}
              />

              {/* Delete */}
              <button
                type="button"
                onClick={() => handleDelete(h.id)}
                className="forge-btn forge-btn-ghost"
                style={{ padding: '6px', color: 'var(--accent-rose)' }}
                title="Delete Header"
              >
                <TrashIcon size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
