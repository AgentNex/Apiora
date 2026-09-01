'use client';

import React from 'react';
import {
  CodeIcon,
  HistoryIcon,
  BookmarkIcon,
  ShieldIcon,
  SparklesIcon,
  LayersIcon,
  ActivityIcon
} from './Icons';
import { RequestHistoryItem, SavedRequest } from '../lib/api/types';

interface SidebarProps {
  activeTab: 'playground' | 'history' | 'saved' | 'environments';
  onSelectTab: (tab: 'playground' | 'history' | 'saved' | 'environments') => void;
  historyItems: RequestHistoryItem[];
  savedRequests: SavedRequest[];
  onSelectHistoryItem: (item: RequestHistoryItem) => void;
  onSelectSavedRequest: (saved: SavedRequest) => void;
  onNewRequest: () => void;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  historyItems,
  savedRequests,
  onSelectHistoryItem,
  onSelectSavedRequest,
  onNewRequest
}: SidebarProps) {
  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - var(--header-height))',
        overflowY: 'auto',
        zIndex: 10
      }}
    >
      {/* Navigation section */}
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <button
          onClick={() => onSelectTab('playground')}
          className={`forge-btn ${activeTab === 'playground' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ justifyContent: 'flex-start', width: '100%', padding: '8px 12px' }}
        >
          <CodeIcon size={15} />
          <span>Playground</span>
        </button>

        <button
          onClick={() => onSelectTab('history')}
          className={`forge-btn ${activeTab === 'history' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ justifyContent: 'flex-start', width: '100%', padding: '8px 12px' }}
        >
          <HistoryIcon size={15} />
          <span>History</span>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '11px',
              background: 'rgba(255,255,255,0.08)',
              padding: '1px 6px',
              borderRadius: '999px'
            }}
          >
            {historyItems.length}
          </span>
        </button>

        <button
          onClick={() => onSelectTab('saved')}
          className={`forge-btn ${activeTab === 'saved' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ justifyContent: 'flex-start', width: '100%', padding: '8px 12px' }}
        >
          <BookmarkIcon size={15} />
          <span>Saved Collections</span>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '11px',
              background: 'rgba(255,255,255,0.08)',
              padding: '1px 6px',
              borderRadius: '999px'
            }}
          >
            {savedRequests.length}
          </span>
        </button>

        <button
          onClick={() => onSelectTab('environments')}
          className={`forge-btn ${activeTab === 'environments' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ justifyContent: 'flex-start', width: '100%', padding: '8px 12px' }}
        >
          <ShieldIcon size={15} />
          <span>Environments</span>
        </button>
      </div>

      <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0 12px' }} />

      {/* Quick Recent History List */}
      <div style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            letterSpacing: '0.05em',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>Recent Activity</span>
          <button
            onClick={() => onSelectTab('history')}
            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '11px' }}
          >
            View all
          </button>
        </div>

        {historyItems.length === 0 ? (
          <div
            style={{
              padding: '16px 8px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '12px'
            }}
          >
            No requests executed yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {historyItems.slice(0, 8).map((item) => {
              const isSuccess = item.status >= 200 && item.status < 300;
              const isClientError = item.status >= 400 && item.status < 500;

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectHistoryItem(item)}
                  className="glass-card"
                  style={{
                    padding: '8px 10px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className={`forge-badge method-badge-${item.method.toLowerCase()}`} style={{ fontSize: '9.5px', padding: '1px 5px' }}>
                      {item.method}
                    </span>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 600,
                        color: isSuccess ? 'var(--accent-emerald)' : isClientError ? 'var(--accent-amber)' : 'var(--accent-rose)'
                      }}
                    >
                      {item.status || 'ERR'}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '11.5px',
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontFamily: 'var(--font-mono)'
                    }}
                    title={item.endpoint}
                  >
                    {item.endpoint.replace(/^https?:\/\//, '')}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                    <span>{item.modelId || 'generic'}</span>
                    <span>{item.durationMs}ms</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Security notice footer */}
      <div
        style={{
          padding: '10px 12px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          lineHeight: '1.4'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '2px' }}>
          <ShieldIcon size={12} />
          <span>Local Security Policy</span>
        </div>
        API keys are kept in session memory by default and never stored in history logs.
      </div>
    </aside>
  );
}
