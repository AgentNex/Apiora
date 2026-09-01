'use client';

import React from 'react';
import { CpuIcon } from './Icons';

interface ModelInputProps {
  modelId: string;
  onChangeModelId: (id: string) => void;
  presetModelSuggestion?: string;
}

const COMMON_MODELS = [
  'gpt-4o',
  'gpt-4o-mini',
  'claude-3-5-sonnet-20241022',
  'claude-3-5-haiku-20241022',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'deepseek-chat',
  'deepseek-reasoner',
  'llama-3.3-70b-versatile',
  'mistral-large-latest',
  'qwen-2.5-72b-instruct'
];

export function ModelInput({
  modelId,
  onChangeModelId
}: ModelInputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
      <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <CpuIcon size={13} style={{ color: 'var(--accent-cyan)' }} />
        <span>Model ID (Unrestricted)</span>
      </label>

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          list="model-suggestions"
          value={modelId}
          onChange={(e) => onChangeModelId(e.target.value)}
          placeholder="e.g. gpt-4o, claude-3-5-sonnet, custom-finetune"
          className="forge-input forge-input-mono"
        />
        <datalist id="model-suggestions">
          {COMMON_MODELS.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
      </div>
    </div>
  );
}
