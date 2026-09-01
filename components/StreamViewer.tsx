'use client';

import React, { useState } from 'react';
import { StreamEvent } from '../lib/api/types';
import { CopyIcon, CheckIcon, StopIcon, ActivityIcon, BracesIcon, FileTextIcon } from './Icons';
import { estimateTokens } from '../lib/api/stream-parser';

interface StreamViewerProps {
  streamEvents: StreamEvent[];
  accumulatedText: string;
  isStreamingActive: boolean;
  onStopStreaming: () => void;
  ttfbMs?: number;
  durationMs?: number;
  sizeBytes?: number;
}

export function StreamViewer({
  streamEvents,
  accumulatedText,
  isStreamingActive,
  onStopStreaming,
  ttfbMs,
  durationMs,
  sizeBytes
}: StreamViewerProps) {
  const [activeTab, setActiveTab] = useState<'parsed' | 'raw'>('parsed');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(accumulatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const estimatedTokens = estimateTokens(accumulatedText);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Live Stream Telemetry Bar */}
      <div
        className="glass-card"
        style={{
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          borderLeft: isStreamingActive ? '3px solid var(--accent-cyan)' : '3px solid var(--accent-emerald)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {isStreamingActive ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '12.5px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--accent-cyan)',
                  boxShadow: '0 0 10px var(--accent-cyan)',
                  animation: 'streamGlowPulse 1.5s infinite'
                }}
              />
              <span>Live Streaming Active</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)', fontWeight: 600, fontSize: '12.5px' }}>
              <CheckIcon size={14} />
              <span>Stream Completed</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>Chunks: <strong style={{ color: 'var(--text-primary)' }}>{streamEvents.length}</strong></span>
            {ttfbMs !== undefined && <span>TTFB: <strong style={{ color: 'var(--text-primary)' }}>{ttfbMs}ms</strong></span>}
            {durationMs !== undefined && <span>Time: <strong style={{ color: 'var(--text-primary)' }}>{(durationMs / 1000).toFixed(2)}s</strong></span>}
            <span>Est. Tokens: <strong style={{ color: 'var(--accent-cyan)' }}>{estimatedTokens}</strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isStreamingActive && (
            <button
              type="button"
              onClick={onStopStreaming}
              className="forge-btn forge-btn-danger"
              style={{ padding: '5px 12px', fontSize: '12px' }}
            >
              <StopIcon size={13} />
              <span>Stop Stream</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="forge-btn forge-btn-ghost"
            style={{ padding: '5px 10px', fontSize: '12px', border: '1px solid var(--border-subtle)' }}
          >
            {copied ? <CheckIcon size={13} style={{ color: 'var(--accent-emerald)' }} /> : <CopyIcon size={13} />}
            <span>Copy Output</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Switcher (Parsed View vs Raw Event Stream) */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('parsed')}
          className={`forge-btn ${activeTab === 'parsed' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ padding: '4px 10px', fontSize: '12px' }}
        >
          <FileTextIcon size={13} />
          <span>Parsed Output</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('raw')}
          className={`forge-btn ${activeTab === 'raw' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ padding: '4px 10px', fontSize: '12px' }}
        >
          <BracesIcon size={13} />
          <span>Raw Event Stream ({streamEvents.length})</span>
        </button>
      </div>

      {/* Content Rendering */}
      {activeTab === 'parsed' ? (
        <div
          className="glass-card"
          style={{
            padding: '16px',
            minHeight: '240px',
            maxHeight: '550px',
            overflowY: 'auto',
            fontFamily: 'var(--font-sans)',
            fontSize: '13.5px',
            lineHeight: '1.65',
            color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {accumulatedText || (
            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              {isStreamingActive ? 'Awaiting first stream chunk...' : 'No stream output recorded.'}
            </span>
          )}
          {isStreamingActive && (
            <span
              style={{
                display: 'inline-block',
                width: '6px',
                height: '14px',
                background: 'var(--accent-primary)',
                marginLeft: '4px',
                verticalAlign: 'middle',
                animation: 'streamGlowPulse 0.8s infinite'
              }}
            />
          )}
        </div>
      ) : (
        /* Raw Stream Events Inspector */
        <div
          className="glass-card"
          style={{
            padding: '10px',
            maxHeight: '550px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          {streamEvents.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              No stream events recorded yet.
            </div>
          ) : (
            streamEvents.map((ev) => (
              <div
                key={ev.index}
                style={{
                  padding: '8px 10px',
                  background: 'var(--bg-input)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11.5px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '10.5px' }}>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Chunk #{ev.index}</span>
                  <span>{ev.eventType}</span>
                  <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                </div>
                <div style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {ev.raw}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
