'use client';

import React, { useState } from 'react';
import { StreamEvent } from '../lib/api/types';
import { ActivityIcon, LayersIcon, InfoIcon } from './Icons';

interface StreamingTimelineProps {
  streamEvents: StreamEvent[];
  ttfbMs?: number;
  totalDurationMs?: number;
}

export function StreamingTimeline({ streamEvents, ttfbMs, totalDurationMs }: StreamingTimelineProps) {
  const [selectedChunkIndex, setSelectedChunkIndex] = useState<number | null>(null);

  if (!streamEvents || streamEvents.length === 0) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
        No streaming events recorded for this execution.
      </div>
    );
  }

  const selectedEvent = selectedChunkIndex !== null ? streamEvents[selectedChunkIndex] : streamEvents[streamEvents.length - 1];

  // Calculate token speed
  const durationSec = ((totalDurationMs || 1) / 1000);
  const totalTokens = streamEvents.length;
  const tokensPerSec = (totalTokens / Math.max(durationSec, 0.1)).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Stream Summary Bar */}
      <div className="glass-card" style={{ padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Chunks</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
            {streamEvents.length}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TTFB (First Token)</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
            {ttfbMs ? `${ttfbMs} ms` : '—'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Throughput</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
            ~{tokensPerSec} chunks/s
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Stream Duration</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {totalDurationMs ? `${(totalDurationMs / 1000).toFixed(2)}s` : '—'}
          </div>
        </div>
      </div>

      {/* Interactive Chunk Arrival Waterfall */}
      <div className="glass-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Chunk Arrival Waterfall (Click chunk to inspect)
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Showing {streamEvents.length} events
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '3px',
            height: '64px',
            padding: '6px 4px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '6px',
            overflowX: 'auto'
          }}
        >
          {streamEvents.map((ev, idx) => {
            const isSelected = selectedChunkIndex === idx;
            const deltaLen = ev.parsedDelta?.length || 1;
            const heightPercent = Math.min(100, Math.max(20, deltaLen * 6));

            return (
              <div
                key={idx}
                onClick={() => setSelectedChunkIndex(idx)}
                style={{
                  width: '12px',
                  minWidth: '8px',
                  height: `${heightPercent}%`,
                  background: isSelected
                    ? 'var(--accent-cyan)'
                    : ev.parsedDelta
                    ? 'var(--accent-primary)'
                    : 'var(--accent-amber)',
                  borderRadius: '2px 2px 0 0',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                title={`Chunk #${idx + 1} (${deltaLen} chars) at ${ev.timestamp}ms`}
              />
            );
          })}
        </div>
      </div>

      {/* Selected Chunk Inspector */}
      {selectedEvent && (
        <div className="glass-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-cyan)' }}>
              Chunk Inspector: #{selectedEvent.index}
            </span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              Offset: +{selectedEvent.timestamp}ms
            </span>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Extracted Token / Delta:</div>
            <div
              className="forge-input-mono"
              style={{
                padding: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '4px',
                color: 'var(--accent-emerald)',
                fontSize: '12px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}
            >
              {selectedEvent.parsedDelta || '— (non-text event)'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Raw Wire Frame:</div>
            <div
              className="forge-input-mono"
              style={{
                padding: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '4px',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                maxHeight: '120px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}
            >
              {selectedEvent.raw}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
