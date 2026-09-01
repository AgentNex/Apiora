'use client';

import React, { useState } from 'react';
import { Environment, ProviderPreset } from '../lib/api/types';
import { PROVIDER_PRESETS } from '../lib/api/presets';
import { executeApiRequest } from '../lib/api/proxy-client';
import { SendIcon, SparklesIcon, CheckIcon, ActivityIcon, RefreshCwIcon } from './Icons';

export interface PipelineStep {
  id: string;
  name: string;
  preset: ProviderPreset;
  apiKey: string;
  promptTemplate: string;
  output: string;
  status: 'idle' | 'running' | 'success' | 'error';
  durationMs?: number;
}

interface PipelineRunnerProps {
  environment?: Environment | null;
}

export function PipelineRunner({ environment }: PipelineRunnerProps) {
  const [pipelineName, setPipelineName] = useState('Summarize & Entity Extraction Pipeline');
  const [initialInput, setInitialInput] = useState(
    'Tesla Inc. founded by Elon Musk and Martin Eberhard reported Q4 revenues of $25.17B from Austin, Texas.'
  );

  const [steps, setSteps] = useState<PipelineStep[]>([
    {
      id: 'step_1',
      name: 'Step 1: Summarizer',
      preset: PROVIDER_PRESETS.find((p) => p.id === 'openai-chat') || PROVIDER_PRESETS[0],
      apiKey: '',
      promptTemplate: 'Summarize this core statement in 1 sentence:\n{{input}}',
      output: '',
      status: 'idle'
    },
    {
      id: 'step_2',
      name: 'Step 2: Entity Extractor',
      preset: PROVIDER_PRESETS.find((p) => p.id === 'anthropic-messages') || PROVIDER_PRESETS[1],
      apiKey: '',
      promptTemplate: 'Extract organizations, persons, and dollar amounts from this text as JSON:\n{{step_1.output}}',
      output: '',
      status: 'idle'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);

  const handleUpdateStep = (stepId: string, updates: Partial<PipelineStep>) => {
    setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, ...updates } : s)));
  };

  const handleAddStep = () => {
    if (steps.length >= 4) return;
    const nextIdx = steps.length + 1;
    const nextPreset = PROVIDER_PRESETS[(steps.length) % PROVIDER_PRESETS.length];
    setSteps((prev) => [
      ...prev,
      {
        id: `step_${nextIdx}`,
        name: `Step ${nextIdx}: Transformation`,
        preset: nextPreset,
        apiKey: '',
        promptTemplate: `Process previous step output:\n{{step_${nextIdx - 1}.output}}`,
        output: '',
        status: 'idle'
      }
    ]);
  };

  const handleExecutePipeline = async () => {
    if (isRunning) return;
    setIsRunning(true);

    const stepOutputs: Record<string, string> = {
      input: initialInput
    };

    // Reset status
    setSteps((prev) => prev.map((s) => ({ ...s, status: 'idle', output: '', durationMs: undefined })));

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      // Update status to running
      setSteps((prev) => prev.map((s) => (s.id === step.id ? { ...s, status: 'running' } : s)));

      // Interpolate templates
      let resolvedPrompt = step.promptTemplate.replace(/\{\{\s*input\s*\}\}/g, stepOutputs['input'] || '');
      for (const [sKey, sVal] of Object.entries(stepOutputs)) {
        const regex = new RegExp(`\\{\\{\\s*${sKey}\\.output\\s*\\}\\}`, 'g');
        resolvedPrompt = resolvedPrompt.replace(regex, sVal);
      }

      const config = {
        id: `pipe_${step.id}`,
        method: step.preset.defaultMethod,
        endpoint: step.preset.endpointTemplate,
        modelId: step.preset.defaultModel,
        authType: step.preset.authType,
        apiKey: step.apiKey,
        headers: step.preset.defaultHeaders.map((h, idx) => ({ id: `h_${idx}`, ...h })),
        queryParams: [],
        bodyMode: 'builder' as const,
        messages: [{ id: 'msg1', role: 'user' as const, content: resolvedPrompt }],
        parameters: { temperature: 0.5, max_tokens: 1024 },
        customParameters: [],
        rawBody: '{}',
        isStreaming: false,
        timeoutSeconds: 60,
        presetId: step.preset.id
      };

      const start = Date.now();
      try {
        const res = await executeApiRequest({ config, environment });
        const textOut = typeof res.data === 'object' ? JSON.stringify(res.data, null, 2) : res.rawText || res.data;
        const dur = Date.now() - start;

        stepOutputs[step.id] = textOut;

        setSteps((prev) =>
          prev.map((s) => (s.id === step.id ? { ...s, status: 'success', output: textOut, durationMs: dur } : s))
        );
      } catch (err: any) {
        setSteps((prev) =>
          prev.map((s) => (s.id === step.id ? { ...s, status: 'error', output: `Error: ${err.message}` } : s))
        );
        break; // Stop pipeline on failure
      }
    }

    setIsRunning(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', padding: '16px', gap: '16px' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SparklesIcon size={18} style={{ color: 'var(--accent-cyan)' }} />
            <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Request Chaining & Multi-Step Pipelines
            </h2>
            <span className="forge-badge" style={{ background: 'rgba(6, 182, 212, 0.2)', color: 'var(--accent-cyan)' }}>
              Sequential DAG
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Chain outputs from one model into subsequent prompts using <code className="forge-code">{`{{step_1.output}}`}</code> variables.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {steps.length < 4 && (
            <button
              type="button"
              onClick={handleAddStep}
              disabled={isRunning}
              className="forge-btn forge-btn-ghost"
              style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid var(--border-subtle)' }}
            >
              + Add Pipeline Step
            </button>
          )}

          <button
            type="button"
            onClick={handleExecutePipeline}
            disabled={isRunning || !initialInput.trim()}
            className="forge-btn forge-btn-primary"
            style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 600 }}
          >
            {isRunning ? <ActivityIcon size={14} className="animate-spin" /> : <SendIcon size={14} />}
            <span>{isRunning ? 'Running Pipeline...' : 'Run Entire Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* Pipeline Initial Input */}
      <div className="glass-panel" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Root Pipeline Input (Available as <code className="forge-code">{`{{input}}`}</code>)
        </span>
        <textarea
          value={initialInput}
          onChange={(e) => setInitialInput(e.target.value)}
          className="forge-input forge-input-mono"
          style={{ minHeight: '60px', fontSize: '12px' }}
        />
      </div>

      {/* Pipeline Steps Sequence */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {steps.map((step, idx) => {
          return (
            <div
              key={step.id}
              className="glass-panel"
              style={{
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                borderLeft:
                  step.status === 'running'
                    ? '4px solid var(--accent-cyan)'
                    : step.status === 'success'
                    ? '4px solid var(--accent-emerald)'
                    : step.status === 'error'
                    ? '4px solid var(--accent-rose)'
                    : '4px solid var(--border-subtle)'
              }}
            >
              {/* Step Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--accent-primary)'
                    }}
                  >
                    {idx + 1}
                  </span>

                  <input
                    type="text"
                    value={step.name}
                    onChange={(e) => handleUpdateStep(step.id, { name: e.target.value })}
                    className="forge-input"
                    style={{ fontWeight: 600, fontSize: '13px', width: '200px' }}
                  />

                  <select
                    value={step.preset.id}
                    onChange={(e) => {
                      const found = PROVIDER_PRESETS.find((p) => p.id === e.target.value);
                      if (found) handleUpdateStep(step.id, { preset: found });
                    }}
                    className="forge-select"
                    style={{ fontSize: '12px' }}
                  >
                    {PROVIDER_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {step.status === 'running' && (
                    <span className="forge-badge" style={{ background: 'rgba(6, 182, 212, 0.2)', color: 'var(--accent-cyan)' }}>
                      Executing...
                    </span>
                  )}
                  {step.status === 'success' && (
                    <span className="forge-badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald)' }}>
                      ✓ Finished in {step.durationMs}ms
                    </span>
                  )}
                  {step.status === 'error' && (
                    <span className="forge-badge" style={{ background: 'rgba(244, 63, 94, 0.2)', color: 'var(--accent-rose)' }}>
                      Failed
                    </span>
                  )}
                </div>
              </div>

              {/* Step Prompt Template */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Prompt Template:
                  </label>
                  <textarea
                    value={step.promptTemplate}
                    onChange={(e) => handleUpdateStep(step.id, { promptTemplate: e.target.value })}
                    className="forge-input forge-input-mono"
                    style={{ minHeight: '80px', fontSize: '11.5px' }}
                  />
                  <input
                    type="password"
                    value={step.apiKey}
                    onChange={(e) => handleUpdateStep(step.id, { apiKey: e.target.value })}
                    placeholder={`Enter ${step.preset.provider || step.preset.name} API Key...`}
                    className="forge-input forge-input-mono"
                    style={{ fontSize: '11.5px', marginTop: '4px' }}
                  />
                </div>

                {/* Step Output Box */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Step Output (Available to next step):
                  </label>
                  <div
                    className="forge-input-mono"
                    style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      padding: '8px',
                      borderRadius: '4px',
                      minHeight: '110px',
                      maxHeight: '130px',
                      overflowY: 'auto',
                      fontSize: '11.5px',
                      lineHeight: '1.5',
                      color: step.output ? 'var(--text-primary)' : 'var(--text-muted)',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    {step.output || 'Step output will appear here once executed.'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
