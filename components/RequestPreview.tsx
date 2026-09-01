'use client';

import React, { useState } from 'react';
import { ApiRequestConfig, Environment } from '../lib/api/types';
import { prepareRequest, generateCurlCommand } from '../lib/api/request-builder';
import { CopyIcon, CheckIcon, TerminalIcon, ShieldIcon } from './Icons';

interface RequestPreviewProps {
  config: ApiRequestConfig;
  environment?: Environment | null;
}

export function RequestPreview({ config, environment }: RequestPreviewProps) {
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedFetch, setCopiedFetch] = useState(false);
  const [maskSecrets, setMaskSecrets] = useState(true);

  const prepared = prepareRequest(config, environment);
  const curlCmd = generateCurlCommand(prepared, maskSecrets);

  const fetchCode = `fetch("${prepared.url}", {
  method: "${prepared.method}",
  headers: ${JSON.stringify(maskSecrets ? prepared.maskedHeaders : prepared.headers, null, 4)},
  body: ${prepared.body ? JSON.stringify(prepared.body) : 'undefined'}
});`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCmd);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 1500);
  };

  const handleCopyFetch = () => {
    navigator.clipboard.writeText(fetchCode);
    setCopiedFetch(true);
    setTimeout(() => setCopiedFetch(false), 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Top Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
          <TerminalIcon size={15} style={{ color: 'var(--accent-primary)' }} />
          <span>Compiled Request Preview</span>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <ShieldIcon size={13} style={{ color: maskSecrets ? 'var(--accent-emerald)' : 'var(--accent-amber)' }} />
          <input
            type="checkbox"
            checked={maskSecrets}
            onChange={(e) => setMaskSecrets(e.target.checked)}
            style={{ accentColor: 'var(--accent-primary)' }}
          />
          <span>Mask Sensitive Credentials</span>
        </label>
      </div>

      {/* Target URL & Method */}
      <div className="glass-card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className={`forge-badge method-badge-${prepared.method.toLowerCase()}`}>
          {prepared.method}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12.5px', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
          {prepared.url}
        </span>
      </div>

      {/* cURL Command Box */}
      <div className="glass-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            cURL Terminal Command
          </span>
          <button
            type="button"
            onClick={handleCopyCurl}
            className="forge-btn forge-btn-ghost"
            style={{ padding: '3px 8px', fontSize: '11.5px' }}
          >
            {copiedCurl ? <CheckIcon size={13} style={{ color: 'var(--accent-emerald)' }} /> : <CopyIcon size={13} />}
            <span>{copiedCurl ? 'Copied!' : 'Copy cURL'}</span>
          </button>
        </div>

        <pre
          style={{
            background: 'var(--bg-input)',
            padding: '10px',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            overflowX: 'auto',
            color: '#38bdf8',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}
        >
          {curlCmd}
        </pre>
      </div>

      {/* Headers Breakdown */}
      <div className="glass-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Compiled Outbound Headers ({Object.keys(prepared.headers).length})
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {Object.entries(maskSecrets ? prepared.maskedHeaders : prepared.headers).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>{k}:</span>
              <span style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Body Payload */}
      {prepared.body && (
        <div className="glass-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Final Request Body Payload
            </span>
            <button
              type="button"
              onClick={handleCopyFetch}
              className="forge-btn forge-btn-ghost"
              style={{ padding: '3px 8px', fontSize: '11.5px' }}
            >
              {copiedFetch ? <CheckIcon size={13} style={{ color: 'var(--accent-emerald)' }} /> : <CopyIcon size={13} />}
              <span>Copy JS fetch</span>
            </button>
          </div>

          <pre
            style={{
              background: 'var(--bg-input)',
              padding: '10px',
              borderRadius: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              overflowX: 'auto',
              color: '#f8fafc',
              maxHeight: '240px'
            }}
          >
            {prepared.body}
          </pre>
        </div>
      )}
    </div>
  );
}
