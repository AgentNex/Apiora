'use client';

import React, { useState } from 'react';
import { ApiResponseData } from '../lib/api/types';
import { JsonTreeView } from './JsonTreeView';
import { StreamViewer } from './StreamViewer';
import { CopyIcon, CheckIcon, LayersIcon, ActivityIcon, BracesIcon, FileTextIcon, InfoIcon } from './Icons';

interface ResponsePanelProps {
  response: ApiResponseData | null;
  isLoading: boolean;
  isStreamingActive: boolean;
  onStopStreaming: () => void;
}

type ResponseTab = 'pretty' | 'raw' | 'tree' | 'headers' | 'stream' | 'diagnostics';

export function ResponsePanel({
  response,
  isLoading,
  isStreamingActive,
  onStopStreaming
}: ResponsePanelProps) {
  const [activeTab, setActiveTab] = useState<ResponseTab>('pretty');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!response) return;
    const textToCopy =
      typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.rawText;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    if (!response) return;
    const content =
      typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.rawText;
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response_${response.requestId || 'dump'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // If initial loading state before first byte
  if (isLoading && !response) {
    return (
      <div
        className="glass-panel"
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          gap: '16px'
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '3px solid rgba(99, 102, 241, 0.2)',
            borderTopColor: 'var(--accent-primary)',
            animation: 'spin 1s linear infinite'
          }}
        />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Dispatching AI API Request...
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Connecting to model gateway & awaiting first token
          </div>
        </div>
      </div>
    );
  }

  // If no response yet
  if (!response) {
    return (
      <div
        className="glass-panel"
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          color: 'var(--text-muted)',
          textAlign: 'center',
          gap: '8px'
        }}
      >
        <ActivityIcon size={32} style={{ color: 'var(--text-faint)' }} />
        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
          Response Viewer Awaiting Execution
        </div>
        <div style={{ fontSize: '12px', maxWidth: '320px', lineHeight: '1.4' }}>
          Configure your model endpoint, enter prompt or payload, and press <strong>Send Request</strong>.
        </div>
      </div>
    );
  }

  const isSuccess = response.status >= 200 && response.status < 300;
  const isClientError = response.status >= 400 && response.status < 500;
  const statusColor = isSuccess
    ? 'var(--accent-emerald)'
    : isClientError
    ? 'var(--accent-amber)'
    : 'var(--accent-rose)';

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Response Header Status Bar */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          background: 'rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Status code & Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 8px',
              borderRadius: '6px',
              background: isSuccess ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              border: `1px solid ${statusColor}`
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: statusColor
              }}
            />
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: statusColor, fontFamily: 'var(--font-mono)' }}>
              {response.status} {response.statusText}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>Time: <strong style={{ color: 'var(--text-primary)' }}>{(response.durationMs / 1000).toFixed(2)}s</strong></span>
            <span>Size: <strong style={{ color: 'var(--text-primary)' }}>{(response.sizeBytes / 1024).toFixed(1)} KB</strong></span>
            {response.isStream && (
              <span className="forge-badge" style={{ background: 'rgba(6, 182, 212, 0.2)', color: 'var(--accent-cyan)' }}>
                Streaming
              </span>
            )}
          </div>
        </div>

        {/* Actions (Copy, Download) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={handleCopy}
            className="forge-btn forge-btn-ghost"
            style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid var(--border-subtle)' }}
            title="Copy response body"
          >
            {copied ? <CheckIcon size={13} style={{ color: 'var(--accent-emerald)' }} /> : <CopyIcon size={13} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="forge-btn forge-btn-ghost"
            style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid var(--border-subtle)' }}
            title="Download JSON file"
          >
            Download
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '6px 12px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)',
          overflowX: 'auto'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('pretty')}
          className={`forge-btn ${activeTab === 'pretty' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ padding: '4px 10px', fontSize: '12px' }}
        >
          <FileTextIcon size={13} />
          <span>Pretty / Text</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('raw')}
          className={`forge-btn ${activeTab === 'raw' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ padding: '4px 10px', fontSize: '12px' }}
        >
          <BracesIcon size={13} />
          <span>Raw</span>
        </button>

        {typeof response.data === 'object' && response.data !== null && (
          <button
            type="button"
            onClick={() => setActiveTab('tree')}
            className={`forge-btn ${activeTab === 'tree' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
            style={{ padding: '4px 10px', fontSize: '12px' }}
          >
            JSON Tree
          </button>
        )}

        {response.isStream && (
          <button
            type="button"
            onClick={() => setActiveTab('stream')}
            className={`forge-btn ${activeTab === 'stream' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
            style={{ padding: '4px 10px', fontSize: '12px' }}
          >
            Stream Live
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('headers')}
          className={`forge-btn ${activeTab === 'headers' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ padding: '4px 10px', fontSize: '12px' }}
        >
          <LayersIcon size={13} />
          <span>Headers ({Object.keys(response.headers || {}).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('diagnostics')}
          className={`forge-btn ${activeTab === 'diagnostics' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ padding: '4px 10px', fontSize: '12px' }}
        >
          <InfoIcon size={13} />
          <span>Diagnostics</span>
        </button>
      </div>

      {/* Main View Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
        {/* Error Alert if failed */}
        {response.error && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              marginBottom: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-rose)' }}>
              {response.error}
            </div>
            {response.errorDetails && (
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {response.errorDetails}
              </div>
            )}
          </div>
        )}

        {/* Tab 1: Pretty / Parsed */}
        {activeTab === 'pretty' && (
          <div>
            {typeof response.data === 'object' && response.data !== null ? (
              <pre
                style={{
                  background: 'var(--bg-input)',
                  padding: '14px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12.5px',
                  lineHeight: '1.5',
                  color: 'var(--text-primary)',
                  overflowX: 'auto'
                }}
              >
                {JSON.stringify(response.data, null, 2)}
              </pre>
            ) : (
              <div
                style={{
                  background: 'var(--bg-input)',
                  padding: '14px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13.5px',
                  lineHeight: '1.6',
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {response.rawText || String(response.data)}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Raw Response */}
        {activeTab === 'raw' && (
          <pre
            style={{
              background: 'var(--bg-input)',
              padding: '14px',
              borderRadius: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-primary)',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}
          >
            {response.rawText}
          </pre>
        )}

        {/* Tab 3: JSON Tree */}
        {activeTab === 'tree' && <JsonTreeView data={response.data} />}

        {/* Tab 4: Stream View */}
        {activeTab === 'stream' && (
          <StreamViewer
            streamEvents={response.streamEvents || []}
            accumulatedText={typeof response.data === 'string' ? response.data : response.rawText}
            isStreamingActive={isStreamingActive}
            onStopStreaming={onStopStreaming}
            ttfbMs={response.ttfbMs}
            durationMs={response.durationMs}
            sizeBytes={response.sizeBytes}
          />
        )}

        {/* Tab 5: Response Headers */}
        {activeTab === 'headers' && (
          <div className="glass-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '8px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <span>Header Key</span>
              <span>Value</span>
            </div>
            {Object.entries(response.headers || {}).map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '220px 1fr',
                  gap: '8px',
                  padding: '6px 0',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>{k}</span>
                <span style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 6: Diagnostics */}
        {activeTab === 'diagnostics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="glass-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Request & Response Performance Telemetry
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '6px' }}>
                <div style={{ background: 'var(--bg-input)', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Latency</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {response.durationMs} ms
                  </div>
                </div>
                {response.ttfbMs !== undefined && (
                  <div style={{ background: 'var(--bg-input)', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Time To First Byte (TTFB)</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                      {response.ttfbMs} ms
                    </div>
                  </div>
                )}
                <div style={{ background: 'var(--bg-input)', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Payload Size</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {(response.sizeBytes / 1024).toFixed(2)} KB
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
