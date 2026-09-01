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
  PlusIcon,
  ActivityIcon
} from './Icons';
import { RequestHistoryItem, SavedRequest } from '../lib/api/types';

interface SidebarProps {
  activeTab: 'playground' | 'arena' | 'pipeline' | 'history' | 'saved' | 'environments';
  onSelectTab: (tab: 'playground' | 'arena' | 'pipeline' | 'history' | 'saved' | 'environments') => void;
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
  const handleItemClick = (tab: 'playground' | 'arena' | 'pipeline' | 'history' | 'saved' | 'environments') => {
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
          <span>Apiora Navigation</span>
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
          onClick={() => handleItemClick('arena')}
          className={`forge-btn ${activeTab === 'arena' ? 'forge-btn-primary' : 'forge-btn-ghost'} sidebar-item-center`}
          style={{ justifyContent: 'flex-start', width: '100%', padding: '8px 12px' }}
          title="Multi-Model Comparison Arena"
        >
          <SparklesIcon size={15} style={{ color: 'var(--accent-primary)' }} />
          <span className="sidebar-label">Model Arena</span>
        </button>

        <button
          type="button"
          onClick={() => handleItemClick('pipeline')}
          className={`forge-btn ${activeTab === 'pipeline' ? 'forge-btn-primary' : 'forge-btn-ghost'} sidebar-item-center`}
          style={{ justifyContent: 'flex-start', width: '100%', padding: '8px 12px' }}
          title="Sequential Request Pipelines"
        >
          <ActivityIcon size={15} style={{ color: 'var(--accent-cyan)' }} />
          <span className="sidebar-label">Pipelines</span>
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
              borderRadius: '4px',
              color: 'var(--text-muted)'
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
              borderRadius: '4px',
              color: 'var(--text-muted)'
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
          title="Environment Variables"
        >
          <ShieldIcon size={15} />
          <span className="sidebar-label">Environments</span>
        </button>

        <Link
          href="/docs"
          onClick={() => onCloseMobileDrawer && onCloseMobileDrawer()}
          className="forge-btn forge-btn-ghost sidebar-item-center"
          style={{ justifyContent: 'flex-start', width: '100%', padding: '8px 12px', textDecoration: 'none', color: 'var(--accent-cyan)' }}
          title="Interactive Documentation"
        >
          <CodeIcon size={15} />
          <span className="sidebar-label">Documentation</span>
        </Link>
      </div>

      {/* Recent History Snippets in Sidebar */}
      <div className="sidebar-history-container" style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Recent Requests
          </span>
          {historyItems.length > 0 && (
            <button
              type="button"
              onClick={() => handleItemClick('history')}
              style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '11px', cursor: 'pointer' }}
            >
              View all
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {historyItems.slice(0, 5).map((item) => {
            const isSuccess = item.status >= 200 && item.status < 300;
            return (
              <div
                key={item.id}
                onClick={() => {
                  onSelectHistoryItem(item);
                  if (onCloseMobileDrawer) onCloseMobileDrawer();
                }}
                className="history-card"
                style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '3px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className={`forge-badge method-badge-${item.method.toLowerCase()}`} style={{ fontSize: '9px', padding: '1px 4px' }}>
                    {item.method}
                  </span>
                  <span style={{ fontSize: '10.5px', color: isSuccess ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
                    {item.status}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.modelId || item.endpoint}
                </div>
              </div>
            );
          })}
          {historyItems.length === 0 && (
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 0' }}>
              No recent requests yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop & Tablet Sidebar Rail */}
      <aside
        className="sidebar-rail hidden md:flex glass-panel"
        style={{
          flexDirection: 'column',
          borderRight: '1px solid var(--border-subtle)',
          borderRadius: 0,
          borderTop: 'none',
          borderBottom: 'none',
          borderLeft: 'none',
          height: 'calc(100dvh - var(--header-height))',
          position: 'relative',
          zIndex: 10
        }}
      >
        {navContent}
      </aside>

      {/* 2. Mobile Slide-Over Drawer with backdrop */}
      {isMobileDrawerOpen && (
        <div className="md:hidden">
          <div
            className="mobile-drawer-overlay"
            onClick={onCloseMobileDrawer}
            aria-hidden="true"
          />
          <div
            className="mobile-drawer-content"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
