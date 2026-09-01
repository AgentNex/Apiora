'use client';

import React from 'react';
import { ForgeLogo, SettingsIcon, SunIcon, MoonIcon, PlusIcon, BookmarkIcon, HistoryIcon, ShieldIcon } from './Icons';
import { StatusIndicator } from './StatusIndicator';
import { Environment } from '../lib/api/types';

interface TopNavProps {
  environments: Environment[];
  activeEnvironmentId: string;
  onSelectEnvironment: (id: string) => void;
  onNewRequest: () => void;
  onOpenSettings: () => void;
  onOpenEnvironments: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  activeTab: 'playground' | 'history' | 'saved' | 'environments';
  onSelectTab: (tab: 'playground' | 'history' | 'saved' | 'environments') => void;
}

export function TopNav({
  environments,
  activeEnvironmentId,
  onSelectEnvironment,
  onNewRequest,
  onOpenSettings,
  onOpenEnvironments,
  theme,
  onToggleTheme,
  activeTab,
  onSelectTab
}: TopNavProps) {
  const activeEnv = environments.find((e) => e.id === activeEnvironmentId) || environments[0];

  return (
    <header
      style={{
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'relative',
        zIndex: 20
      }}
    >
      {/* Brand & Workspace Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          onClick={() => onSelectTab('playground')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <ForgeLogo size={28} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                API FORGE
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: '4px',
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  color: '#ffffff',
                  letterSpacing: '0.05em'
                }}
              >
                AI
              </span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '-2px' }}>
              Universal Model Laboratory
            </div>
          </div>
        </div>

        <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)', margin: '0 4px' }} />

        {/* Navigation Tabs for Mobile / Desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => onSelectTab('playground')}
            className={`forge-btn ${activeTab === 'playground' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
            style={{ padding: '5px 10px', fontSize: '12.5px' }}
          >
            Playground
          </button>
          <button
            onClick={() => onSelectTab('history')}
            className={`forge-btn ${activeTab === 'history' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
            style={{ padding: '5px 10px', fontSize: '12.5px' }}
          >
            <HistoryIcon size={14} />
            <span className="hidden sm:inline">History</span>
          </button>
          <button
            onClick={() => onSelectTab('saved')}
            className={`forge-btn ${activeTab === 'saved' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
            style={{ padding: '5px 10px', fontSize: '12.5px' }}
          >
            <BookmarkIcon size={14} />
            <span className="hidden sm:inline">Saved</span>
          </button>
          <button
            onClick={() => onSelectTab('environments')}
            className={`forge-btn ${activeTab === 'environments' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
            style={{ padding: '5px 10px', fontSize: '12.5px' }}
          >
            <ShieldIcon size={14} />
            <span className="hidden sm:inline">Environments</span>
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* New Request Button */}
        <button
          onClick={onNewRequest}
          className="forge-btn"
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)'
          }}
          title="Create a fresh blank request"
        >
          <PlusIcon size={14} style={{ color: 'var(--accent-primary)' }} />
          <span>New</span>
        </button>

        {/* Environment Selector Dropdown */}
        <select
          value={activeEnvironmentId}
          onChange={(e) => onSelectEnvironment(e.target.value)}
          className="forge-select"
          style={{ padding: '5px 10px', fontSize: '12px', minWidth: '120px' }}
          title="Select Active Environment"
        >
          {environments.map((env) => (
            <option key={env.id} value={env.id}>
              {env.name}
            </option>
          ))}
        </select>

        {/* Status indicator */}
        <div className="hidden md:flex">
          <StatusIndicator
            activeEnvironmentName={activeEnv?.name}
            onOpenSettings={onOpenSettings}
            onOpenEnvironments={onOpenEnvironments}
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="forge-btn forge-btn-ghost"
          style={{ padding: '7px', borderRadius: '6px' }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
        >
          {theme === 'dark' ? <SunIcon size={15} /> : <MoonIcon size={15} />}
        </button>

        {/* Settings Modal Button */}
        <button
          onClick={onOpenSettings}
          className="forge-btn forge-btn-ghost"
          style={{ padding: '7px', borderRadius: '6px' }}
          title="Application Settings"
        >
          <SettingsIcon size={15} />
        </button>
      </div>
    </header>
  );
}
