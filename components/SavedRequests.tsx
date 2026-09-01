'use client';

import React, { useState } from 'react';
import { ApiRequestConfig, SavedRequest } from '../lib/api/types';
import { BookmarkIcon, PlusIcon, TrashIcon, PlayIcon, LayersIcon } from './Icons';

interface SavedRequestsProps {
  savedRequests: SavedRequest[];
  onSelectSavedRequest: (saved: SavedRequest) => void;
  onSaveCurrentRequest: (name: string, collection: string) => void;
  onDeleteSavedRequest: (id: string) => void;
  currentConfig: ApiRequestConfig;
}

export function SavedRequests({
  savedRequests,
  onSelectSavedRequest,
  onSaveCurrentRequest,
  onDeleteSavedRequest,
  currentConfig
}: SavedRequestsProps) {
  const [isSavingModalOpen, setIsSavingModalOpen] = useState(false);
  const [requestName, setRequestName] = useState('');
  const [collectionName, setCollectionName] = useState('General');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');

  const collections = Array.from(new Set(savedRequests.map((s) => s.collection || 'General')));

  const filteredRequests =
    selectedCollection === 'all'
      ? savedRequests
      : savedRequests.filter((s) => (s.collection || 'General') === selectedCollection);

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestName.trim()) return;
    onSaveCurrentRequest(requestName.trim(), collectionName.trim() || 'General');
    setRequestName('');
    setIsSavingModalOpen(false);
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
          <BookmarkIcon size={20} style={{ color: 'var(--accent-primary)' }} />
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Saved Request Collections
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Organize, template, and reuse custom AI prompts and configurations.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setRequestName(currentConfig.modelId ? `${currentConfig.modelId} Test` : 'New Request Template');
            setIsSavingModalOpen(true);
          }}
          className="forge-btn forge-btn-primary"
          style={{ padding: '7px 14px', fontSize: '12.5px' }}
        >
          <PlusIcon size={14} />
          <span>Save Current Request</span>
        </button>
      </div>

      {/* Collection Filter Tabs */}
      {collections.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setSelectedCollection('all')}
            className={`forge-btn ${selectedCollection === 'all' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
            style={{ padding: '4px 10px', fontSize: '12px' }}
          >
            All ({savedRequests.length})
          </button>
          {collections.map((col) => (
            <button
              key={col}
              type="button"
              onClick={() => setSelectedCollection(col)}
              className={`forge-btn ${selectedCollection === col ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
              style={{ padding: '4px 10px', fontSize: '12px' }}
            >
              {col}
            </button>
          ))}
        </div>
      )}

      {/* Requests Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
        {filteredRequests.length === 0 ? (
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
            No saved requests yet in this collection.
          </div>
        ) : (
          filteredRequests.map((saved) => (
            <div
              key={saved.id}
              className="glass-card"
              style={{
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '10px',
                cursor: 'pointer'
              }}
              onClick={() => onSelectSavedRequest(saved)}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {saved.name}
                  </span>
                  <span className="forge-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
                    {saved.collection}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className={`forge-badge method-badge-${saved.config.method.toLowerCase()}`}>
                    {saved.config.method}
                  </span>
                  <span style={{ fontSize: '11.5px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                    {saved.config.modelId || 'generic'}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {saved.config.endpoint}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {new Date(saved.updatedAt).toLocaleDateString()}
                </span>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete saved request "${saved.name}"?`)) {
                        onDeleteSavedRequest(saved.id);
                      }
                    }}
                    className="forge-btn forge-btn-ghost"
                    style={{ padding: '4px 6px', color: 'var(--accent-rose)' }}
                    title="Delete Saved Request"
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Save Modal */}
      {isSavingModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px'
          }}
        >
          <form
            onSubmit={handleSaveSubmit}
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '420px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Save Request to Collection
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Request Name</label>
              <input
                type="text"
                required
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
                placeholder="e.g. Gemini 1.5 Pro Coding Benchmark"
                className="forge-input"
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Collection / Folder</label>
              <input
                type="text"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder="e.g. Chatbots, Embeddings, Production"
                className="forge-input"
              />
            </div>

            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Note: API keys are not saved by default to protect credentials.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setIsSavingModalOpen(false)}
                className="forge-btn forge-btn-ghost"
              >
                Cancel
              </button>
              <button type="submit" className="forge-btn forge-btn-primary">
                Save Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
