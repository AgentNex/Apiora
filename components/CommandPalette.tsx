'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PROVIDER_PRESETS } from '../lib/api/presets';
import { ProviderPreset } from '../lib/api/types';
import { SparklesIcon, SearchIcon, LayersIcon, TerminalIcon, SunIcon, MoonIcon, PlayIcon, XIcon } from './Icons';

interface CommandItem {
  id: string;
  category: 'Presets' | 'Navigation' | 'Actions';
  title: string;
  subtitle?: string;
  icon?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: ProviderPreset) => void;
  onNavigate: (tab: 'playground' | 'arena' | 'pipeline' | 'history' | 'saved' | 'environments') => void;
  onToggleTheme: () => void;
  onSendRequest: () => void;
  onOpenSettings: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onSelectPreset,
  onNavigate,
  onToggleTheme,
  onSendRequest,
  onOpenSettings
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items: CommandItem[] = [
    // Actions
    {
      id: 'act_send',
      category: 'Actions',
      title: 'Send API Request',
      subtitle: 'Execute active model request (Ctrl/Cmd + Enter)',
      action: () => {
        onSendRequest();
        onClose();
      }
    },
    {
      id: 'act_theme',
      category: 'Actions',
      title: 'Toggle Theme',
      subtitle: 'Switch between Obsidian Dark and Clean Light',
      action: () => {
        onToggleTheme();
        onClose();
      }
    },
    {
      id: 'act_settings',
      category: 'Actions',
      title: 'Open Settings & Backup',
      subtitle: 'Manage local storage, timeouts, and export backup',
      action: () => {
        onOpenSettings();
        onClose();
      }
    },

    // Navigation
    {
      id: 'nav_playground',
      category: 'Navigation',
      title: 'API Playground',
      subtitle: 'Direct model request builder & response viewer',
      action: () => {
        onNavigate('playground');
        onClose();
      }
    },
    {
      id: 'nav_arena',
      category: 'Navigation',
      title: 'Multi-Model Arena',
      subtitle: 'Concurrent benchmarking & side-by-side comparison',
      action: () => {
        onNavigate('arena');
        onClose();
      }
    },
    {
      id: 'nav_pipeline',
      category: 'Navigation',
      title: 'Request Chaining & Pipelines',
      subtitle: 'Multi-step sequential LLM pipelines',
      action: () => {
        onNavigate('pipeline');
        onClose();
      }
    },
    {
      id: 'nav_history',
      category: 'Navigation',
      title: 'Request History',
      subtitle: 'View past executions and saved telemetry',
      action: () => {
        onNavigate('history');
        onClose();
      }
    },
    {
      id: 'nav_saved',
      category: 'Navigation',
      title: 'Saved Collections',
      subtitle: 'Organized request templates',
      action: () => {
        onNavigate('saved');
        onClose();
      }
    },
    {
      id: 'nav_environments',
      category: 'Navigation',
      title: 'Environment Variables',
      subtitle: 'Manage active variables and secrets',
      action: () => {
        onNavigate('environments');
        onClose();
      }
    },

    // Presets
    ...PROVIDER_PRESETS.map((preset) => ({
      id: `preset_${preset.id}`,
      category: 'Presets' as const,
      title: `${preset.name} (${preset.defaultModel})`,
      subtitle: `${preset.provider || preset.name} • ${preset.defaultMethod} ${preset.endpointTemplate}`,
      action: () => {
        onSelectPreset(preset);
        onNavigate('playground');
        onClose();
      }
    }))
  ];

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase())) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        paddingLeft: '16px',
        paddingRight: '16px',
        zIndex: 200
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          borderRadius: '10px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--border-subtle)'
        }}
      >
        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(0, 0, 0, 0.3)'
          }}
        >
          <SearchIcon size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, preset, or tab... (↑↓ to navigate)"
            className="forge-input-mono"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '13.5px',
              color: 'var(--text-primary)'
            }}
          />
          <kbd
            style={{
              padding: '2px 6px',
              fontSize: '11px',
              borderRadius: '4px',
              background: 'rgba(255,255,255,0.08)',
              color: 'var(--text-muted)'
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '6px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No matching commands or presets found.
            </div>
          ) : (
            filtered.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                    border: isSelected ? '1px solid var(--accent-primary)' : '1px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.title}
                    </div>
                    {item.subtitle && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {item.subtitle}
                      </div>
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: '10.5px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
