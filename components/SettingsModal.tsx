'use client';

import React, { useState } from 'react';
import {
  SettingsIcon,
  XIcon,
  ShieldIcon,
  ActivityIcon,
  SunIcon,
  MoonIcon,
  CopyIcon,
  CheckIcon,
  SparklesIcon
} from './Icons';
import { exportAllData, importAllData } from '../lib/storage/indexed-db';

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
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const jsonStr = await exportAllData();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `apiora_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to export data: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const res = await importAllData(text);
      if (res.success) {
        setImportStatus(`Successfully restored ${res.count} items! Reloading...`);
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setImportStatus(`Import Error: ${res.error}`);
      }
    } catch (err: any) {
      setImportStatus(`Import Failed: ${err.message}`);
    }
  };

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
          maxWidth: '500px',
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
            aria-label="Close settings"
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
            Applies to outbound calls before triggering Gateway Timeout.
          </span>
        </div>

        {/* 3. Ambient Animation & Device Performance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Ambient Motion Performance
          </label>
          <select
            value={animationMode}
            onChange={(e) => onChangeAnimationMode(e.target.value as any)}
            className="forge-select"
          >
            <option value="auto">Auto (Detect hardware RAM & motion preference)</option>
            <option value="full">Full Motion (60 FPS CSS)</option>
            <option value="reduced">Reduced / Low Power Mode</option>
            <option value="disabled">Disabled (Static canvas)</option>
          </select>
        </div>

        {/* 4. Complete Data Backup / Export / Import (Phase 2 Hardening) */}
        <div className="glass-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <SparklesIcon size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span>Data Portability & Offline Backup</span>
          </div>

          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.45' }}>
            All your History, Saved Collections, and Environments are stored in this browser only (IndexedDB). Export a complete JSON backup to transfer data to another machine or browser.
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleExportData}
              disabled={isExporting}
              className="forge-btn forge-btn-primary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              Export All Data (JSON)
            </button>

            <label
              className="forge-btn forge-btn-ghost"
              style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
            >
              <span>Import Backup JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {importStatus && (
            <div style={{ fontSize: '11.5px', color: 'var(--accent-emerald)', marginTop: '4px' }}>
              {importStatus}
            </div>
          )}
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
