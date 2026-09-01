'use client';

import React from 'react';
import Link from 'next/link';
import {
  CodeIcon,
  HistoryIcon,
  BookmarkIcon,
  ShieldIcon,
  SparklesIcon,
  XIcon,
  PlusIcon
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
  isMobileDrawerOpen?: boolean;
  onCloseMobileDrawer?: () => void;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  historyItems,
  savedRequests,
  onSelectHistoryItem,
  onSelectSavedRequest,
  onNewRequest,
  isMobileDrawerOpen = false,
  onCloseMobileDrawer
}: SidebarProps) {
  const handleItemClick = (tab: 'playground' | 'history' | 'saved' | 'environments') => {
    onSelectTab(tab);
    if (onCloseMobileDrawer) onCloseMobileDrawer();
  };

  const navContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      {/* Drawer Header (only visible on mobile drawer) */}
      <div
        className="md:hidden"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface-elevated)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px' }}>
          <span>Navigation</span>
        </div>
        <button
          type="button"
          onClick={onCloseMobileDrawer}
          className="forge-btn forge-btn-ghost"
          style={{ padding: '6px', minHeight: '36px', minWidth: '36px' }}
          aria-label="Close drawer"
        >
          <XIcon size={16} />
        </button>
      </div>

      {/* Navigation Section */}
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <button
          type="button"
          onClick={() => handleItemClick('playground')}
          className={`forge-btn ${activeTab === 'playground' ? 'forge-btn-primary' : 'forge-btn-ghost'} sidebar-item-center`}
          style={{ justifyContent: 'flex-start', width: '100%', padding: '8px 12px' }}
          title="Playground"
        >
          <CodeIcon size={15} />
          <span className="sidebar-label">Playground</span>
        </button>

        <button
          type="button"
          onClick={() => handleItemClick('history')}
          className={`forge-btn ${activeTab === 'history' ? 'forge-btn-primary' : 'forge-btn-ghost'} sidebar-item-center`}
          style={{ justifyContent: 'flex-start', width: '100%', padding: '8px 12px' }}
          title="Request History"
        >
          <HistoryIcon size={15} />
          <span className="sidebar-label">History</span>
          <span
            className="sidebar-label"
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
          type="button"
          onClick={() => handleItemClick('saved')}
          className={`forge-btn ${activeTab === 'saved' ? 'forge-btn-primary' : 'forge-btn-ghost'} sidebar-item-center`}
          style={{ justifyContent: 'flex-start', width: '100%', padding: '8px 12px' }}
          title="Saved Collections"
        >
          <BookmarkIcon size={15} />
          <span className="sidebar-label">Saved</span>
          <span
            className="sidebar-label"
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
          type="button"
          onClick={() => handleItemClick('environments')}
          className={`forge-btn ${activeTab === 'environments' ? 'forge-btn-primary' : 'forge-btn-ghost'} sidebar-item-center`}
          style={{ justifyContent: 'flex-start', width: '100%', padding: '8px 12px' }}
          title="Environments"
        >
          <ShieldIcon size={15} />
          <span className="sidebar-label">Environments</span>
        </button>

        <Link
          href="/docs"
          className="forge-btn forge-btn-ghost sidebar-item-center"
          style={{ justifyContent: 'flex-start', width: '100%', padding: '8px 12px', textDecoration: 'none', color: 'var(--accent-cyan)' }}
          title="Documentation"
        >
          <SparklesIcon size={15} />
          <span className="sidebar-label">Docs Portal</span>
        </Link>
      </div>

      <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0 12px' }} />

      {/* Quick Recent Activity List */}
      <div className="sidebar-label" style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
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
            type="button"
            onClick={() => handleItemClick('history')}
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
            {historyItems.slice(0, 6).map((item) => {
              const isSuccess = item.status >= 200 && item.status < 300;
              const isClientError = item.status >= 400 && item.status < 500;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectHistoryItem(item);
                    if (onCloseMobileDrawer) onCloseMobileDrawer();
                  }}
                  className="glass-card"
                  style={{
                    padding: '8px 10px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className={`forge-badge method-badge-${item.method.toLowerCase()}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                      {item.method}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: isSuccess ? 'var(--accent-emerald)' : isClientError ? 'var(--accent-amber)' : 'var(--accent-rose)',
                        fontWeight: 600
                      }}
                    >
                      {item.status || 'ERR'}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {item.modelId || item.endpoint}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside
        className="desktop-sidebar hidden md:flex"
        style={{
          width: 'var(--sidebar-width)',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
          flexDirection: 'column',
          height: 'calc(100dvh - var(--header-height))',
          overflowY: 'auto',
          zIndex: 10,
          transition: 'width 0.2s ease'
        }}
      >
        {navContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      <div
        className={`mobile-drawer-overlay md:hidden ${isMobileDrawerOpen ? 'open' : ''}`}
        onClick={onCloseMobileDrawer}
      />
      <div className={`mobile-drawer-content md:hidden ${isMobileDrawerOpen ? 'open' : ''}`}>
        {navContent}
      </div>
    </>
  );
}
