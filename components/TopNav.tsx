'use client';

import React from 'react';
import {
  ForgeLogo,
  SettingsIcon,
  SunIcon,
  MoonIcon,
  PlusIcon,
  BookmarkIcon,
  HistoryIcon,
  ShieldIcon,
  CodeIcon,
  MenuIcon
} from './Icons';
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
  onToggleMobileDrawer?: () => void;
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
  onSelectTab,
  onToggleMobileDrawer
}: TopNavProps) {
  const activeEnv = environments.find((e) => e.id === activeEnvironmentId) || environments[0];

  return (
    <header
      style={{
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'relative',
        zIndex: 20
      }}
    >
      {/* Left: Brand & Mobile Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Mobile Hamburger Drawer Trigger */}
        <button
          type="button"
          onClick={onToggleMobileDrawer}
          className="md:hidden forge-btn forge-btn-ghost"
          style={{ padding: '8px', minHeight: '38px', minWidth: '38px' }}
          aria-label="Toggle navigation drawer"
        >
          <MenuIcon size={18} />
        </button>

        {/* Logo & Title */}
        <div
          onClick={() => onSelectTab('playground')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <ForgeLogo size={28} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontWeight: 700, fontSize: '14.5px', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                APIORA
              </span>
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: 700,
                  padding: '1px 4px',
                  borderRadius: '4px',
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  color: '#ffffff'
                }}
              >
                AI
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:block" style={{ width: '1px', height: '18px', background: 'var(--border-subtle)', margin: '0 2px' }} />

        {/* Desktop Navigation Tabs (Hidden on mobile phone; mobile uses drawer) */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => onSelectTab('playground')}
            className={`forge-btn ${activeTab === 'playground' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
            style={{ padding: '5px 10px', fontSize: '12px' }}
          >
            Playground
          </button>
          <button
            onClick={() => onSelectTab('history')}
            className={`forge-btn ${activeTab === 'history' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
            style={{ padding: '5px 10px', fontSize: '12px' }}
          >
            <HistoryIcon size={13} />
            <span>History</span>
          </button>
          <button
            onClick={() => onSelectTab('saved')}
            className={`forge-btn ${activeTab === 'saved' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
            style={{ padding: '5px 10px', fontSize: '12px' }}
          >
            <BookmarkIcon size={13} />
            <span>Saved</span>
          </button>
          <button
            onClick={() => onSelectTab('environments')}
            className={`forge-btn ${activeTab === 'environments' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
            style={{ padding: '5px 10px', fontSize: '12px' }}
          >
            <ShieldIcon size={13} />
            <span>Environments</span>
          </button>
          <a
            href="/docs"
            className="forge-btn forge-btn-ghost"
            style={{ padding: '5px 10px', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-cyan)' }}
            title="Interactive Documentation"
          >
            <CodeIcon size={13} />
            <span>Docs</span>
          </a>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* New Request Button */}
        <button
          onClick={onNewRequest}
          className="forge-btn"
          style={{
            padding: '5px 10px',
            fontSize: '12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)'
          }}
          title="Create a fresh blank request"
        >
          <PlusIcon size={13} style={{ color: 'var(--accent-primary)' }} />
          <span className="hidden sm:inline">New</span>
        </button>

        {/* Environment Selector Dropdown */}
        <select
          value={activeEnvironmentId}
          onChange={(e) => onSelectEnvironment(e.target.value)}
          className="forge-select"
          style={{ padding: '4px 8px', fontSize: '11.5px', maxWidth: '130px' }}
          title="Select Active Environment"
        >
          {environments.map((env) => (
            <option key={env.id} value={env.id}>
              {env.name}
            </option>
          ))}
        </select>

        {/* Status indicator */}
        <div className="hidden lg:flex">
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
          style={{ padding: '6px', borderRadius: '6px' }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <SunIcon size={14} /> : <MoonIcon size={14} />}
        </button>

        {/* Settings Modal Button */}
        <button
          onClick={onOpenSettings}
          className="forge-btn forge-btn-ghost"
          style={{ padding: '6px', borderRadius: '6px' }}
          title="Application Settings"
          aria-label="Open settings"
        >
          <SettingsIcon size={14} />
        </button>
      </div>
    </header>
  );
}
