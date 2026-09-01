'use client';

import React, { useState } from 'react';
import { Environment, ProviderPreset, ApiResponseData } from '../lib/api/types';
import { PROVIDER_PRESETS } from '../lib/api/presets';
import { calculateEstimatedCost } from '../lib/api/pricing';
import { executeApiRequest } from '../lib/api/proxy-client';
import { estimateTokens } from '../lib/api/stream-parser';
import { SendIcon, StopIcon, SparklesIcon, ActivityIcon, CheckIcon } from './Icons';

interface ArenaSlot {
  id: string;
  preset: ProviderPreset;
  apiKey: string;
  response: ApiResponseData | null;
  isLoading: boolean;
  isStreaming: boolean;
  streamText: string;
  ttfbMs?: number;
  durationMs?: number;
}

interface ModelArenaProps {
  environment?: Environment | null;
}

export function ModelArena({ environment }: ModelArenaProps) {
  const [prompt, setPrompt] = useState('Explain quantum entanglement in simple terms for a 10-year-old child.');
  const [systemPrompt, setSystemPrompt] = useState('You are an expert science communicator. Be concise, engaging, and clear.');

  const [slots, setSlots] = useState<ArenaSlot[]>([
    {
      id: 'slot_1',
      preset: PROVIDER_PRESETS.find((p) => p.id === 'openai-chat') || PROVIDER_PRESETS[0],
      apiKey: '',
      response: null,
      isLoading: false,
      isStreaming: false,
      streamText: ''
    },
    {
      id: 'slot_2',
      preset: PROVIDER_PRESETS.find((p) => p.id === 'anthropic-messages') || PROVIDER_PRESETS[1],
      apiKey: '',
      response: null,
      isLoading: false,
      isStreaming: false,
      streamText: ''
    },
    {
      id: 'slot_3',
      preset: PROVIDER_PRESETS.find((p) => p.id === 'deepseek-api') || PROVIDER_PRESETS[3] || PROVIDER_PRESETS[0],
      apiKey: '',
      response: null,
      isLoading: false,
      isStreaming: false,
      streamText: ''
    }
  ]);

  const [isExecutingAll, setIsExecutingAll] = useState(false);

  const handleUpdateSlotPreset = (slotId: string, presetId: string) => {
    const found = PROVIDER_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    setSlots((prev) =>
      prev.map((slot) => (slot.id === slotId ? { ...slot, preset: found, response: null, streamText: '' } : slot))
    );
  };

  const handleUpdateSlotKey = (slotId: string, apiKey: string) => {
    setSlots((prev) => prev.map((slot) => (slot.id === slotId ? { ...slot, apiKey } : slot)));
  };

  const handleAddSlot = () => {
    if (slots.length >= 4) return;
    const nextPreset = PROVIDER_PRESETS[slots.length % PROVIDER_PRESETS.length];
    setSlots((prev) => [
      ...prev,
      {
        id: `slot_${Date.now()}`,
        preset: nextPreset,
        apiKey: '',
        response: null,
        isLoading: false,
        isStreaming: false,
        streamText: ''
      }
    ]);
  };

  const handleRemoveSlot = (slotId: string) => {
    if (slots.length <= 2) return;
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
  };

  const handleRunArena = async () => {
    if (isExecutingAll) return;
    setIsExecutingAll(true);

    // Reset slot outputs
    setSlots((prev) =>
      prev.map((s) => ({
        ...s,
        isLoading: true,
        isStreaming: true,
        streamText: '',
        response: null,
        ttfbMs: undefined,
        durationMs: undefined
      }))
    );

    const promises = slots.map(async (slot) => {
      const messages = [
        ...(systemPrompt ? [{ id: 'sys', role: 'system' as const, content: systemPrompt }] : []),
        { id: 'usr', role: 'user' as const, content: prompt }
      ];

      const config = {
        id: `arena_${slot.id}`,
        method: slot.preset.defaultMethod,
        endpoint: slot.preset.endpointTemplate,
        modelId: slot.preset.defaultModel,
        authType: slot.preset.authType,
        apiKey: slot.apiKey,
        customAuthHeaderKey: slot.preset.customAuthHeaderKey,
        customAuthHeaderValue: slot.preset.customAuthHeaderValue,
        headers: slot.preset.defaultHeaders.map((h, i) => ({ id: `h_${i}`, ...h })),
        queryParams: [],
        bodyMode: 'builder' as const,
        messages,
        parameters: { temperature: 0.7, max_tokens: 1024 },
        customParameters: [],
        rawBody: '{}',
        isStreaming: true,
        timeoutSeconds: 60,
        presetId: slot.preset.id
      };

      const startTime = Date.now();

      try {
        const result = await executeApiRequest({
          config,
          environment,
          onStreamEvent: (event, fullText, chunkCount, elapsedMs) => {
            setSlots((prev) =>
              prev.map((s) =>
                s.id === slot.id
                  ? {
                      ...s,
                      streamText: fullText,
                      ttfbMs: s.ttfbMs || elapsedMs
                    }
                  : s
              )
            );
          }
        });

        setSlots((prev) =>
          prev.map((s) =>
            s.id === slot.id
              ? {
                  ...s,
                  isLoading: false,
                  isStreaming: false,
                  response: result,
                  streamText: result.data || result.rawText,
                  durationMs: result.durationMs,
                  ttfbMs: result.ttfbMs
                }
              : s
          )
        );
      } catch (err: any) {
        setSlots((prev) =>
          prev.map((s) =>
            s.id === slot.id
              ? {
                  ...s,
                  isLoading: false,
                  isStreaming: false,
                  streamText: `Error: ${err.message}`
                }
              : s
          )
        );
      }
    });

    await Promise.allSettled(promises);
    setIsExecutingAll(false);
  };

  const inputTokenEstimate = estimateTokens(prompt) + estimateTokens(systemPrompt);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', padding: '16px', gap: '16px' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SparklesIcon size={18} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Multi-Model Comparison Arena
            </h2>
            <span className="forge-badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)' }}>
              Concurrent Benchmark
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Broadcast the same prompt across 2–4 models simultaneously to compare TTFB, latency, output tokens, and cost.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {slots.length < 4 && (
            <button
              type="button"
              onClick={handleAddSlot}
              disabled={isExecutingAll}
              className="forge-btn forge-btn-ghost"
              style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid var(--border-subtle)' }}
            >
              + Add Model Slot ({slots.length}/4)
            </button>
          )}

          <button
            type="button"
            onClick={handleRunArena}
            disabled={isExecutingAll || !prompt.trim()}
            className="forge-btn forge-btn-primary"
            style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 600 }}
          >
            {isExecutingAll ? <ActivityIcon size={14} className="animate-spin" /> : <SendIcon size={14} />}
            <span>{isExecutingAll ? 'Benchmarking Arena...' : 'Run Arena Benchmark'}</span>
          </button>
        </div>
      </div>

      {/* Shared Prompt Inputs */}
      <div className="glass-panel" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Shared Test Prompt (Estimated Input: ~{inputTokenEstimate} tokens)
          </span>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter the benchmark prompt to dispatch to all models..."
          className="forge-input forge-input-mono"
          style={{ minHeight: '70px', resize: 'vertical' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '11.5px', color: 'var(--text-muted)', width: '90px' }}>System Prompt:</label>
          <input
            type="text"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Optional system context / instructions..."
            className="forge-input"
            style={{ fontSize: '12px' }}
          />
        </div>
      </div>

      {/* Arena Model Columns Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(280px, 1fr))`, gap: '12px' }}>
        {slots.map((slot, index) => {
          const outputTokens = estimateTokens(slot.streamText);
          const costInfo = calculateEstimatedCost(inputTokenEstimate, outputTokens, slot.preset.defaultModel);
          const durationSec = ((slot.durationMs || 1) / 1000);
          const throughput = (outputTokens / Math.max(durationSec, 0.1)).toFixed(1);

          return (
            <div
              key={slot.id}
              className="glass-panel"
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden',
                background: 'rgba(0, 0, 0, 0.2)'
              }}
            >
              {/* Slot Header */}
              <div
                style={{
                  padding: '10px 12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)' }}>#{index + 1}</span>
                  <select
                    value={slot.preset.id}
                    onChange={(e) => handleUpdateSlotPreset(slot.id, e.target.value)}
                    className="forge-select"
                    style={{ fontSize: '12px', padding: '4px 8px', flex: 1 }}
                  >
                    {PROVIDER_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.defaultModel})
                      </option>
                    ))}
                  </select>
                </div>

                {slots.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(slot.id)}
                    className="forge-btn forge-btn-ghost"
                    style={{ padding: '2px 6px', fontSize: '11px', color: 'var(--accent-rose)' }}
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* API Key Input for this Slot */}
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.1)' }}>
                <input
                  type="password"
                  value={slot.apiKey}
                  onChange={(e) => handleUpdateSlotKey(slot.id, e.target.value)}
                  placeholder={`Enter ${slot.preset.provider || slot.preset.name} API Key...`}
                  className="forge-input forge-input-mono"
                  style={{ fontSize: '11.5px', padding: '4px 8px' }}
                />
              </div>

              {/* Metrics Bar */}
              <div
                style={{
                  padding: '8px 12px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '6px',
                  fontSize: '11px',
                  background: 'rgba(0,0,0,0.15)',
                  borderBottom: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>TTFB: </span>
                  <strong style={{ color: 'var(--accent-cyan)' }}>{slot.ttfbMs ? `${slot.ttfbMs}ms` : '—'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Speed: </span>
                  <strong style={{ color: 'var(--accent-emerald)' }}>{slot.durationMs ? `${throughput} t/s` : '—'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Cost: </span>
                  <strong style={{ color: 'var(--accent-amber)' }}>{costInfo.formattedTotal}</strong>
                </div>
              </div>

              {/* Output Content */}
              <div
                style={{
                  flex: 1,
                  padding: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  minHeight: '220px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  color: 'var(--text-primary)'
                }}
              >
                {slot.isLoading && !slot.streamText ? (
                  <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ActivityIcon size={13} className="animate-spin" />
                    <span>Awaiting response...</span>
                  </div>
                ) : slot.streamText ? (
                  slot.streamText
                ) : (
                  <span style={{ color: 'var(--text-faint)' }}>Output will stream here once benchmark starts.</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
