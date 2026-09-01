'use client';

import React, { useState } from 'react';
import { PROVIDER_PRESETS } from '../lib/api/presets';
import { ProviderPreset } from '../lib/api/types';
import { SparklesIcon, ChevronDownIcon, CheckIcon } from './Icons';

interface ProviderPresetSelectorProps {
  activePresetId?: string;
  onApplyPreset: (preset: ProviderPreset) => void;
}

export function ProviderPresetSelector({
  activePresetId,
  onApplyPreset
}: ProviderPresetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activePreset = PROVIDER_PRESETS.find((p) => p.id === activePresetId) || PROVIDER_PRESETS[0];

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="forge-btn"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          padding: '7px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <SparklesIcon size={14} style={{ color: 'var(--accent-primary)' }} />
        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '12.5px' }}>
          Preset: {activePreset.name}
        </span>
        <ChevronDownIcon size={13} style={{ color: 'var(--text-muted)' }} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          />
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              width: '340px',
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '8px',
              zIndex: 50,
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)'
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                padding: '4px 8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Choose Model Endpoint Preset
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
              {PROVIDER_PRESETS.map((preset) => {
                const isSelected = preset.id === activePresetId;

                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onApplyPreset(preset);
                      setIsOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: isSelected ? '1px solid var(--border-accent)' : '1px solid transparent',
                      background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.12s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                        {preset.name}
                      </span>
                      {isSelected && <CheckIcon size={14} style={{ color: 'var(--accent-primary)' }} />}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                      {preset.description}
                    </span>
                    <span style={{ fontSize: '10.5px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      {preset.defaultModel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
