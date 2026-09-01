'use client';

import React, { useState } from 'react';
import { ApiRequestConfig, Environment } from '../lib/api/types';
import { prepareRequest } from '../lib/api/request-builder';
import { generateSnippet, TargetLanguage } from '../lib/api/code-generator';
import { CopyIcon, CheckIcon, TerminalIcon, ShieldIcon, CodeIcon } from './Icons';

interface RequestPreviewProps {
  config: ApiRequestConfig;
  environment?: Environment | null;
}

export function RequestPreview({ config, environment }: RequestPreviewProps) {
  const [targetLang, setTargetLang] = useState<TargetLanguage>('curl');
  const [maskSecrets, setMaskSecrets] = useState(true);
  const [copied, setCopied] = useState(false);

  const prepared = prepareRequest(config, environment);
  const snippet = generateSnippet(config, environment, targetLang, maskSecrets);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
          <CodeIcon size={15} style={{ color: 'var(--accent-primary)' }} />
          <span>Multi-Language SDK & Code Exporter</span>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <ShieldIcon size={13} style={{ color: maskSecrets ? 'var(--accent-emerald)' : 'var(--accent-amber)' }} />
          <input
            type="checkbox"
            checked={maskSecrets}
            onChange={(e) => setMaskSecrets(e.target.checked)}
            style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
          />
          <span>Mask API Key in Preview</span>
        </label>
      </div>

      {/* Target URL & Method */}
      <div className="glass-card" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className={`forge-badge method-badge-${prepared.method.toLowerCase()}`}>
          {prepared.method}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
          {prepared.url}
        </span>
      </div>

      {/* Language Selector Pills */}
      <div className="touch-pill-row" style={{ padding: '2px 0' }}>
        {[
          { id: 'curl', label: 'cURL' },
          { id: 'python-sdk', label: 'Python (SDK)' },
          { id: 'python-requests', label: 'Python (Requests)' },
          { id: 'typescript-sdk', label: 'TypeScript (SDK)' },
          { id: 'typescript-fetch', label: 'JavaScript (Fetch)' },
          { id: 'go', label: 'Go (net/http)' },
          { id: 'rust', label: 'Rust (reqwest)' }
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTargetLang(item.id as TargetLanguage)}
            className={`forge-btn ${targetLang === item.id ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
            style={{ padding: '4px 10px', fontSize: '11.5px', border: '1px solid var(--border-subtle)' }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Code Snippet Box */}
      <div className="glass-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Generated Code ({targetLang})
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="forge-btn forge-btn-ghost"
            style={{ padding: '4px 10px', fontSize: '11.5px', border: '1px solid var(--border-subtle)' }}
          >
            {copied ? <CheckIcon size={13} style={{ color: 'var(--accent-emerald)' }} /> : <CopyIcon size={13} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
          </button>
        </div>

        <pre
          style={{
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '12px',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            lineHeight: '1.5',
            overflowX: 'auto',
            color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            border: '1px solid var(--border-subtle)'
          }}
        >
          {snippet}
        </pre>
      </div>
    </div>
  );
}
