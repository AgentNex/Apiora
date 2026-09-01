'use client';

import React from 'react';
import { HttpMethod } from '../lib/api/types';
import { GlobeIcon, XIcon } from './Icons';

interface EndpointInputProps {
  method: HttpMethod;
  onChangeMethod: (method: HttpMethod) => void;
  endpoint: string;
  onChangeEndpoint: (endpoint: string) => void;
}

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export function EndpointInput({
  method,
  onChangeMethod,
  endpoint,
  onChangeEndpoint
}: EndpointInputProps) {
  let isInvalidUrl = false;
  if (endpoint.trim() && !endpoint.includes('{{')) {
    try {
      new URL(endpoint.trim());
    } catch {
      isInvalidUrl = true;
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-input)',
          border: isInvalidUrl ? '1px solid var(--accent-rose)' : '1px solid var(--border-subtle)',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)'
        }}
      >
        {/* Method Selector */}
        <select
          value={method}
          onChange={(e) => onChangeMethod(e.target.value as HttpMethod)}
          style={{
            background: 'var(--bg-card)',
            border: 'none',
            borderRight: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            fontWeight: 700,
            fontSize: '12.5px',
            padding: '10px 14px',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        {/* URL Input */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, padding: '0 12px', gap: '8px' }}>
          <GlobeIcon size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            value={endpoint}
            onChange={(e) => onChangeEndpoint(e.target.value)}
            placeholder="https://api.openai.com/v1/chat/completions or {{BASE_URL}}/chat"
            className="forge-input-mono"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '13px',
              padding: '9px 0'
            }}
          />
          {endpoint && (
            <button
              onClick={() => onChangeEndpoint('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              title="Clear Endpoint"
            >
              <XIcon size={14} />
            </button>
          )}
        </div>
      </div>

      {isInvalidUrl && (
        <span style={{ fontSize: '11px', color: 'var(--accent-rose)', marginLeft: '4px' }}>
          Please enter a valid HTTP/HTTPS URL or use an environment variable (e.g. &#123;&#123;BASE_URL&#125;&#125;).
        </span>
      )}
    </div>
  );
}
