'use client';

import React from 'react';
import { SettingsIcon, XIcon, ShieldIcon, ActivityIcon, SunIcon, MoonIcon } from './Icons';
import { AnimationLevel } from '../lib/api/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  onChangeTheme: (theme: 'dark' | 'light') => void;
  timeoutSeconds: number;
  onChangeTimeoutSeconds: (timeout: number) => void;
  rememberApiKeys: boolean;
  onChangeRememberApiKeys: (remember: boolean) => void;
  animationMode: 'auto' | 'full' | 'reduced' | 'disabled';
  onChangeAnimationMode: (mode: 'auto' | 'full' | 'reduced' | 'disabled') => void;
  onClearAllData: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  theme,
  onChangeTheme,
  timeoutSeconds,
  onChangeTimeoutSeconds,
  rememberApiKeys,
  onChangeRememberApiKeys,
  animationMode,
  onChangeAnimationMode,
  onClearAllData
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '16px'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SettingsIcon size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Application Settings
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="forge-btn forge-btn-ghost"
            style={{ padding: '4px' }}
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* 1. Theme Setting */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Interface Theme
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => onChangeTheme('dark')}
              className={`forge-btn ${theme === 'dark' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
              style={{ padding: '8px', border: '1px solid var(--border-subtle)' }}
            >
              <MoonIcon size={14} />
              <span>Obsidian Dark</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeTheme('light')}
              className={`forge-btn ${theme === 'light' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
              style={{ padding: '8px', border: '1px solid var(--border-subtle)' }}
            >
              <SunIcon size={14} />
              <span>Clean Light</span>
            </button>
          </div>
        </div>

        {/* 2. Timeout Setting */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Request Timeout</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{timeoutSeconds}s</span>
          </div>
          <input
            type="range"
            min="10"
            max="300"
            step="5"
            value={timeoutSeconds}
            onChange={(e) => onChangeTimeoutSeconds(parseInt(e.target.value))}
            style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            Applies to outbound proxy calls before triggering 504 Gateway Timeout.
          </span>
        </div>

        {/* 3. Ambient Animation & Device Performance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Ambient Background & Motion
          </label>
          <select
            value={animationMode}
            onChange={(e) => onChangeAnimationMode(e.target.value as any)}
            className="forge-select"
          >
            <option value="auto">Auto (Detect device RAM & hardware)</option>
            <option value="full">Full Motion (60 FPS CSS)</option>
            <option value="reduced">Reduced / Low Power Mode</option>
            <option value="disabled">Disabled (Static canvas)</option>
          </select>
        </div>

        {/* 4. Local API Key Persistence Disclaimer */}
        <div className="glass-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              <ShieldIcon size={14} style={{ color: 'var(--accent-amber)' }} />
              <span>Remember API Keys Locally</span>
            </div>
            <input
              type="checkbox"
              checked={rememberApiKeys}
              onChange={(e) => onChangeRememberApiKeys(e.target.checked)}
              style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px', cursor: 'pointer' }}
            />
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            When disabled (default), API keys exist strictly in active memory. If enabled, keys are stored in encrypted browser storage on this device.
          </div>
        </div>

        {/* 5. Clear Storage */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Reset all database caches
          </div>
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset all local IndexedDB history and environments?')) {
                onClearAllData();
              }
            }}
            className="forge-btn forge-btn-danger"
            style={{ padding: '5px 10px', fontSize: '12px' }}
          >
            Reset Database
          </button>
        </div>
      </div>
    </div>
  );
}
