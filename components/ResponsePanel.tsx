'use client';

import React, { useState } from 'react';
import { ApiResponseData } from '../lib/api/types';
import { JsonTreeView } from './JsonTreeView';
import { StreamViewer } from './StreamViewer';
import { AssertionsRunner } from './AssertionsRunner';
import {
  CopyIcon,
  CheckIcon,
  LayersIcon,
  ActivityIcon,
  BracesIcon,
  FileTextIcon,
  InfoIcon,
  CodeIcon,
  SparklesIcon
} from './Icons';

interface ResponsePanelProps {
  response: ApiResponseData | null;
  isLoading: boolean;
  isStreamingActive: boolean;
  onStopStreaming: () => void;
}

type ResponseTab = 'pretty' | 'raw' | 'tree' | 'headers' | 'stream' | 'assertions' | 'diagnostics';

export function ResponsePanel({
  response,
  isLoading,
  isStreamingActive,
  onStopStreaming
}: ResponsePanelProps) {
  const [activeTab, setActiveTab] = useState<ResponseTab>('pretty');
  const [softWrap, setSoftWrap] = useState(true);
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
        className="response-panel-container glass-panel"
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
        className="response-panel-container glass-panel"
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
      className="response-panel-container glass-panel"
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
          padding: '10px 14px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
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

          <div style={{ display: 'flex', gap: '8px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
            <span>Time: <strong style={{ color: 'var(--text-primary)' }}>{(response.durationMs / 1000).toFixed(2)}s</strong></span>
            <span>Size: <strong style={{ color: 'var(--text-primary)' }}>{(response.sizeBytes / 1024).toFixed(1)} KB</strong></span>
            {response.isStream && (
              <span className="forge-badge" style={{ background: 'rgba(6, 182, 212, 0.2)', color: 'var(--accent-cyan)' }}>
                Streaming
              </span>
            )}
          </div>
        </div>

        {/* Actions (Soft Wrap, Copy, Download) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <button
            type="button"
            onClick={() => setSoftWrap(!softWrap)}
            className={`forge-btn ${softWrap ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
            style={{ padding: '3px 7px', fontSize: '11px' }}
            title="Toggle Soft Text Wrapping (prevents horizontal scroll)"
          >
            Wrap
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="forge-btn forge-btn-ghost"
            style={{ padding: '3px 8px', fontSize: '11px', border: '1px solid var(--border-subtle)' }}
            title="Copy response body"
          >
            {copied ? <CheckIcon size={12} style={{ color: 'var(--accent-emerald)' }} /> : <CopyIcon size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="forge-btn forge-btn-ghost"
            style={{ padding: '3px 8px', fontSize: '11px', border: '1px solid var(--border-subtle)' }}
            title="Download JSON file"
          >
            JSON
          </button>
        </div>
      </div>

      {/* Tab bar (Horizontally scrollable touch pills) */}
      <div
        className="touch-pill-row"
        style={{
          padding: '5px 10px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('pretty')}
          className={`forge-btn ${activeTab === 'pretty' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ padding: '3px 9px', fontSize: '11.5px' }}
        >
          <FileTextIcon size={12} />
          <span>Pretty / Text</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('raw')}
          className={`forge-btn ${activeTab === 'raw' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ padding: '3px 9px', fontSize: '11.5px' }}
        >
          <BracesIcon size={12} />
          <span>Raw Body</span>
        </button>

        {typeof response.data === 'object' && response.data !== null && (
          <button
            type="button"
            onClick={() => setActiveTab('tree')}
            className={`forge-btn ${activeTab === 'tree' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
            style={{ padding: '3px 9px', fontSize: '11.5px' }}
          >
            <CodeIcon size={12} />
            <span>JSON Tree</span>
          </button>
        )}

        {response.isStream && (
          <button
            type="button"
            onClick={() => setActiveTab('stream')}
            className={`forge-btn ${activeTab === 'stream' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
            style={{ padding: '3px 9px', fontSize: '11.5px' }}
          >
            <ActivityIcon size={12} />
            <span>Live Stream ({response.chunkCount || 0})</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('assertions')}
          className={`forge-btn ${activeTab === 'assertions' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ padding: '3px 9px', fontSize: '11.5px' }}
        >
          <SparklesIcon size={12} style={{ color: 'var(--accent-emerald)' }} />
          <span>Assertions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('headers')}
          className={`forge-btn ${activeTab === 'headers' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ padding: '3px 9px', fontSize: '11.5px' }}
        >
          <LayersIcon size={12} />
          <span>Headers ({Object.keys(response.headers).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('diagnostics')}
          className={`forge-btn ${activeTab === 'diagnostics' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ padding: '3px 9px', fontSize: '11.5px' }}
        >
          <InfoIcon size={12} />
          <span>Diagnostics</span>
        </button>
      </div>

      {/* Main Tab Views */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {/* Tab 1: Pretty View */}
        {activeTab === 'pretty' && (
          <div
            className="glass-card"
            style={{
              padding: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12.5px',
              lineHeight: '1.6',
              whiteSpace: softWrap ? 'pre-wrap' : 'pre',
              wordBreak: softWrap ? 'break-word' : 'normal',
              overflowX: 'auto',
              minHeight: '180px'
            }}
          >
            {typeof response.data === 'object'
              ? JSON.stringify(response.data, null, 2)
              : response.rawText || response.error || 'Empty Response Body'}
          </div>
        )}

        {/* Tab 2: Raw View */}
        {activeTab === 'raw' && (
          <div
            className="glass-card"
            style={{
              padding: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              lineHeight: '1.5',
              whiteSpace: softWrap ? 'pre-wrap' : 'pre',
              wordBreak: softWrap ? 'break-word' : 'normal',
              overflowX: 'auto',
              minHeight: '180px',
              color: 'var(--text-secondary)'
            }}
          >
            {response.rawText || 'No raw text available'}
          </div>
        )}

        {/* Tab 3: Collapsible JSON Tree View */}
        {activeTab === 'tree' && typeof response.data === 'object' && response.data !== null && (
          <JsonTreeView data={response.data} />
        )}

        {/* Tab 4: Live Stream Telemetry & Chunks */}
        {activeTab === 'stream' && (
          <StreamViewer
            streamEvents={response.streamEvents || []}
            accumulatedText={response.rawText}
            isStreamingActive={isStreamingActive}
            onStopStreaming={onStopStreaming}
            ttfbMs={response.ttfbMs}
            durationMs={response.durationMs}
            sizeBytes={response.sizeBytes}
          />
        )}

        {/* Tab 5: Assertions Suite */}
        {activeTab === 'assertions' && (
          <AssertionsRunner response={response} />
        )}

        {/* Tab 6: Headers */}
        {activeTab === 'headers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Total Response Headers: {Object.keys(response.headers).length}
            </div>
            <div className="glass-card" style={{ padding: '8px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '6px 10px', width: '40%' }}>Header Key</th>
                    <th style={{ padding: '6px 10px' }}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(response.headers).map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '6px 10px', color: 'var(--accent-primary)', fontWeight: 600 }}>{k}</td>
                      <td style={{ padding: '6px 10px', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 7: Diagnostics */}
        {activeTab === 'diagnostics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="glass-card" style={{ padding: '14px' }}>
              <div style={{ fontWeight: 600, fontSize: '13px', color: statusColor, marginBottom: '6px' }}>
                Status: {response.status} {response.statusText}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {response.status === 200 && 'Request completed successfully with valid HTTP 200 OK.'}
                {response.status === 400 && 'Bad Request: The target API server rejected the request body, parameters, or schema.'}
                {response.status === 401 && 'Unauthorized: The provided API key is missing, expired, or invalid for this model.'}
                {response.status === 403 && 'Forbidden / SSRF Block: Access to this endpoint was blocked or permission is denied.'}
                {response.status === 429 && 'Rate Limit Exceeded: You have hit the provider rate limit or quota allowance.'}
                {response.status >= 500 && 'Server Error: The upstream AI provider encountered an internal execution error.'}
                {response.status === 0 && (response.error || 'Network error or connection refused.')}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              <div><strong style={{ color: 'var(--text-muted)' }}>Request ID:</strong> <span style={{ fontFamily: 'var(--font-mono)' }}>{response.requestId}</span></div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Duration:</strong> {response.durationMs} ms</div>
              {response.ttfbMs && <div><strong style={{ color: 'var(--text-muted)' }}>Time to First Byte (TTFB):</strong> {response.ttfbMs} ms</div>}
              <div><strong style={{ color: 'var(--text-muted)' }}>Payload Size:</strong> {response.sizeBytes} bytes ({(response.sizeBytes / 1024).toFixed(2)} KB)</div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Stream Active:</strong> {response.isStream ? 'Yes (SSE/NDJSON)' : 'No (Single Response)'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
