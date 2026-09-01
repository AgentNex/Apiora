'use client';

import React, { useState } from 'react';
import { SparklesIcon, CopyIcon, CheckIcon, TrashIcon, RefreshCwIcon } from './Icons';

export interface PromptVersion {
  id: string;
  versionNumber: number;
  label: string;
  content: string;
  timestamp: number;
}

interface PromptVersioningProps {
  currentContent: string;
  onRestoreVersion: (content: string) => void;
}

export function PromptVersioning({ currentContent, onRestoreVersion }: PromptVersioningProps) {
  const [versions, setVersions] = useState<PromptVersion[]>([
    {
      id: 'v1',
      versionNumber: 1,
      label: 'Initial Draft',
      content: currentContent,
      timestamp: Date.now()
    }
  ]);
  const [selectedVersionId, setSelectedVersionId] = useState<string>('v1');
  const [compareVersionId, setCompareVersionId] = useState<string>('v1');
  const [newLabel, setNewLabel] = useState('');

  const handleSaveVersion = () => {
    const nextNum = versions.length + 1;
    const newVer: PromptVersion = {
      id: `v_${Date.now()}`,
      versionNumber: nextNum,
      label: newLabel.trim() || `Iteration ${nextNum}`,
      content: currentContent,
      timestamp: Date.now()
    };
    setVersions((prev) => [newVer, ...prev]);
    setSelectedVersionId(newVer.id);
    setNewLabel('');
  };

  const selectedVer = versions.find((v) => v.id === selectedVersionId) || versions[0];
  const compareVer = versions.find((v) => v.id === compareVersionId) || versions[0];

  // Simple line diff computation
  const generateDiff = (textA: string, textB: string) => {
    const linesA = textA.split('\n');
    const linesB = textB.split('\n');
    const diffs: { type: 'added' | 'removed' | 'unchanged'; line: string }[] = [];

    const maxLen = Math.max(linesA.length, linesB.length);
    for (let i = 0; i < maxLen; i++) {
      const lineA = linesA[i];
      const lineB = linesB[i];

      if (lineA === lineB) {
        if (lineA !== undefined) diffs.push({ type: 'unchanged', line: lineA });
      } else {
        if (lineA !== undefined) diffs.push({ type: 'removed', line: lineA });
        if (lineB !== undefined) diffs.push({ type: 'added', line: lineB });
      }
    }
    return diffs;
  };

  const diffLines = generateDiff(compareVer.content, selectedVer.content);

  return (
    <div className="glass-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
          <SparklesIcon size={14} style={{ color: 'var(--accent-primary)' }} />
          <span>Prompt Version Control & Visual Diff</span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Label (e.g., added few-shot)"
            className="forge-input"
            style={{ fontSize: '11.5px', padding: '4px 8px', width: '160px' }}
          />
          <button
            type="button"
            onClick={handleSaveVersion}
            className="forge-btn forge-btn-primary"
            style={{ padding: '4px 10px', fontSize: '11.5px' }}
          >
            Save Snapshot
          </button>
        </div>
      </div>

      {/* Version Selector Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Comparing:</span>
          <select
            value={compareVersionId}
            onChange={(e) => setCompareVersionId(e.target.value)}
            className="forge-select"
            style={{ fontSize: '11.5px', padding: '3px 6px' }}
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                v{v.versionNumber}: {v.label}
              </option>
            ))}
          </select>
        </div>

        <span style={{ color: 'var(--text-muted)' }}>→</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Target:</span>
          <select
            value={selectedVersionId}
            onChange={(e) => setSelectedVersionId(e.target.value)}
            className="forge-select"
            style={{ fontSize: '11.5px', padding: '3px 6px' }}
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                v{v.versionNumber}: {v.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => onRestoreVersion(selectedVer.content)}
          className="forge-btn forge-btn-ghost"
          style={{ padding: '3px 8px', fontSize: '11.5px', border: '1px solid var(--border-subtle)', marginLeft: 'auto' }}
        >
          <RefreshCwIcon size={12} />
          <span>Restore Target to Editor</span>
        </button>
      </div>

      {/* Visual Diff Window */}
      <div
        className="forge-input-mono"
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '10px',
          borderRadius: '6px',
          maxHeight: '260px',
          overflowY: 'auto',
          fontSize: '11.5px',
          lineHeight: '1.6',
          border: '1px solid var(--border-subtle)'
        }}
      >
        {diffLines.map((dl, idx) => (
          <div
            key={idx}
            style={{
              padding: '1px 6px',
              borderRadius: '2px',
              background:
                dl.type === 'added'
                  ? 'rgba(16, 185, 129, 0.2)'
                  : dl.type === 'removed'
                  ? 'rgba(244, 63, 94, 0.2)'
                  : 'transparent',
              color:
                dl.type === 'added'
                  ? 'var(--accent-emerald)'
                  : dl.type === 'removed'
                  ? 'var(--accent-rose)'
                  : 'var(--text-secondary)'
            }}
          >
            <span style={{ width: '18px', display: 'inline-block', color: 'var(--text-muted)' }}>
              {dl.type === 'added' ? '+' : dl.type === 'removed' ? '-' : ' '}
            </span>
            {dl.line || <span style={{ opacity: 0.4 }}>&empty;</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
