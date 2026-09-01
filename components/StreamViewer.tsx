'use client';

import React, { useState } from 'react';
import { StreamEvent } from '../lib/api/types';
import { CopyIcon, CheckIcon, StopIcon, ActivityIcon, BracesIcon, FileTextIcon, LayersIcon } from './Icons';
import { estimateTokens } from '../lib/api/stream-parser';
import { StreamingTimeline } from './StreamingTimeline';

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
  const [activeTab, setActiveTab] = useState<'parsed' | 'raw' | 'timeline'>('parsed');
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
            <span>{copied ? 'Copied' : 'Copy Output'}</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs: Parsed Text vs Raw Chunks vs Timeline Waterfall */}
      <div className="touch-pill-row">
        <button
          type="button"
          onClick={() => setActiveTab('parsed')}
          className={`forge-btn ${activeTab === 'parsed' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ padding: '4px 10px', fontSize: '11.5px' }}
        >
          <FileTextIcon size={12} />
          <span>Accumulated Text</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('raw')}
          className={`forge-btn ${activeTab === 'raw' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ padding: '4px 10px', fontSize: '11.5px' }}
        >
          <BracesIcon size={12} />
          <span>Raw Chunks ({streamEvents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`forge-btn ${activeTab === 'timeline' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ padding: '4px 10px', fontSize: '11.5px' }}
        >
          <ActivityIcon size={12} />
          <span>Timeline Waterfall</span>
        </button>
      </div>

      {/* Tab 1: Clean Rendered Output */}
      {activeTab === 'parsed' && (
        <div
          className="glass-card"
          style={{
            padding: '14px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12.5px',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: '480px',
            overflowY: 'auto'
          }}
        >
          {accumulatedText || (
            <span style={{ color: 'var(--text-muted)' }}>Waiting for first stream chunk...</span>
          )}
        </div>
      )}

      {/* Tab 2: Raw SSE Chunks */}
      {activeTab === 'raw' && (
        <div
          className="glass-card"
          style={{
            padding: '12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11.5px',
            lineHeight: '1.5',
            maxHeight: '480px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          {streamEvents.map((ev, i) => (
            <div
              key={i}
              style={{
                padding: '6px 10px',
                borderRadius: '4px',
                background: 'rgba(0, 0, 0, 0.25)',
                borderLeft: '2px solid var(--accent-primary)',
                wordBreak: 'break-all'
              }}
            >
              <div style={{ color: 'var(--text-muted)', fontSize: '10.5px', marginBottom: '2px' }}>
                Chunk #{ev.index} &bull; +{ev.timestamp}ms
              </div>
              <div style={{ color: 'var(--text-primary)' }}>{ev.raw}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Timeline Waterfall */}
      {activeTab === 'timeline' && (
        <StreamingTimeline
          streamEvents={streamEvents}
          ttfbMs={ttfbMs}
          totalDurationMs={durationMs}
        />
      )}
    </div>
  );
}
