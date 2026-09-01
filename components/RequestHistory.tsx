'use client';

import React, { useState } from 'react';
import { RequestHistoryItem } from '../lib/api/types';
import { TrashIcon, HistoryIcon, PlayIcon, CopyIcon, CheckIcon } from './Icons';

interface RequestHistoryProps {
  historyItems: RequestHistoryItem[];
  onSelectHistoryItem: (item: RequestHistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
}

export function RequestHistory({
  historyItems,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  onClearHistory
}: RequestHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = historyItems.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.endpoint.toLowerCase().includes(term) ||
      item.method.toLowerCase().includes(term) ||
      item.modelId.toLowerCase().includes(term) ||
      String(item.status).includes(term)
    );
  });

  const handleCopyEndpoint = (e: React.MouseEvent, id: string, endpoint: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(endpoint);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1200);
  };

  const handleExportHistory = () => {
    const blob = new Blob([JSON.stringify(historyItems, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api_forge_history_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '100%',
        overflowY: 'auto'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HistoryIcon size={20} style={{ color: 'var(--accent-primary)' }} />
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Execution History
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {historyItems.length} total requests stored locally in IndexedDB (API keys stripped for security).
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={handleExportHistory}
            disabled={historyItems.length === 0}
            className="forge-btn forge-btn-ghost"
            style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid var(--border-subtle)' }}
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to clear all history records?')) {
                onClearHistory();
              }
            }}
            disabled={historyItems.length === 0}
            className="forge-btn forge-btn-danger"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <TrashIcon size={14} />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Search filter */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Filter by URL, method, model, or status code..."
        className="forge-input forge-input-mono"
        style={{ padding: '9px 12px' }}
      />

      {/* History Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredItems.length === 0 ? (
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            {historyItems.length === 0
              ? 'No request history recorded yet. Send your first API request to see it here.'
              : 'No history matches your search filter.'}
          </div>
        ) : (
          filteredItems.map((item) => {
            const isSuccess = item.status >= 200 && item.status < 300;
            const isClientError = item.status >= 400 && item.status < 500;
            const statusColor = isSuccess
              ? 'var(--accent-emerald)'
              : isClientError
              ? 'var(--accent-amber)'
              : 'var(--accent-rose)';

            return (
              <div
                key={item.id}
                onClick={() => onSelectHistoryItem(item)}
                className="glass-card"
                style={{
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                  <span className={`forge-badge method-badge-${item.method.toLowerCase()}`}>
                    {item.method}
                  </span>

                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: statusColor,
                      fontFamily: 'var(--font-mono)',
                      minWidth: '32px'
                    }}
                  >
                    {item.status || 'ERR'}
                  </span>

                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        fontSize: '13px',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.endpoint}
                    </span>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <span>Model: <strong style={{ color: 'var(--accent-cyan)' }}>{item.modelId || 'generic'}</strong></span>
                      <span>Latency: {item.durationMs}ms</span>
                      <span>Size: {(item.sizeBytes / 1024).toFixed(1)} KB</span>
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={(e) => handleCopyEndpoint(e, item.id, item.endpoint)}
                    className="forge-btn forge-btn-ghost"
                    style={{ padding: '6px' }}
                    title="Copy Endpoint URL"
                  >
                    {copiedId === item.id ? <CheckIcon size={14} style={{ color: 'var(--accent-emerald)' }} /> : <CopyIcon size={14} />}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHistoryItem(item.id);
                    }}
                    className="forge-btn forge-btn-ghost"
                    style={{ padding: '6px', color: 'var(--accent-rose)' }}
                    title="Delete Record"
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
