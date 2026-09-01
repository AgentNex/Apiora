'use client';

import React, { useState } from 'react';
import { ApiRequestConfig, Environment, ProviderPreset } from '../lib/api/types';
import { PROVIDER_PRESETS } from '../lib/api/presets';
import { calculateEstimatedCost } from '../lib/api/pricing';
import { estimateTokens } from '../lib/api/stream-parser';
import { EndpointInput } from './EndpointInput';
import { ProviderPresetSelector } from './ProviderPresetSelector';
import { ModelInput } from './ModelInput';
import { ApiKeyInput } from './ApiKeyInput';
import { HeaderEditor } from './HeaderEditor';
import { ParameterEditor } from './ParameterEditor';
import { MessageEditor } from './MessageEditor';
import { RawJsonEditor } from './RawJsonEditor';
import { RequestPreview } from './RequestPreview';
import { PromptVersioning } from './PromptVersioning';
import {
  PlayIcon,
  StopIcon,
  LayersIcon,
  SlidersIcon,
  KeyIcon,
  CodeIcon,
  TerminalIcon,
  SparklesIcon,
  BracesIcon,
  CheckIcon,
  ChevronDownIcon,
  PlusIcon
} from './Icons';

interface RequestPanelProps {
  config: ApiRequestConfig;
  onChangeConfig: (updater: (prev: ApiRequestConfig) => ApiRequestConfig) => void;
  environment?: Environment | null;
  onApplyPreset: (preset: ProviderPreset) => void;
  onSendRequest: () => void;
  onStopStreaming: () => void;
  isLoading: boolean;
  isStreamingActive: boolean;
}

type TabType = 'messages' | 'raw' | 'params' | 'headers' | 'auth' | 'preview';

export function RequestPanel({
  config,
  onChangeConfig,
  environment,
  onApplyPreset,
  onSendRequest,
  onStopStreaming,
  isLoading,
  isStreamingActive
}: RequestPanelProps) {
  // Sync workspace mode with bodyMode
  const [workspaceMode, setWorkspaceMode] = useState<'matrix' | 'raw'>(
    config.bodyMode === 'raw' ? 'raw' : 'matrix'
  );
  const [activeTab, setActiveTab] = useState<TabType>(config.bodyMode === 'raw' ? 'raw' : 'messages');
  const [isQuickPresetOpen, setIsQuickPresetOpen] = useState(false);
  const [showPromptVersioning, setShowPromptVersioning] = useState(false);

  // Live Token & Cost Estimation
  const fullPromptText =
    workspaceMode === 'matrix'
      ? config.messages.map((m) => m.content).join('\n')
      : config.rawBody;
  const inputTokenEstimate = estimateTokens(fullPromptText);
  const costEstimate = calculateEstimatedCost(inputTokenEstimate, 0, config.modelId);

  // Switch between Prompt Matrix and Raw JSON / REST Mode
  const handleSwitchWorkspaceMode = (mode: 'matrix' | 'raw') => {
    setWorkspaceMode(mode);
    if (mode === 'raw') {
      setActiveTab('raw');
      onChangeConfig((prev) => ({
        ...prev,
        bodyMode: 'raw'
      }));
    } else {
      setActiveTab('messages');
      onChangeConfig((prev) => ({
        ...prev,
        bodyMode: 'builder'
      }));
    }
  };

  // Quick Preset Selection in Raw REST Mode
  const handleSelectRawPreset = (preset: ProviderPreset) => {
    onApplyPreset(preset);
    setIsQuickPresetOpen(false);
  };

  // Quick Add Header Helper
  const handleQuickAddHeader = (key: string, value: string) => {
    onChangeConfig((prev) => {
      const existing = prev.headers.find((h) => h.key.toLowerCase() === key.toLowerCase());
      if (existing) {
        return {
          ...prev,
          headers: prev.headers.map((h) => (h.id === existing.id ? { ...h, value, enabled: true } : h))
        };
      }
      return {
        ...prev,
        headers: [...prev.headers, { id: `h_${Date.now()}`, key, value, enabled: true }]
      };
    });
  };

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
      {/* Header Bar */}
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          background: 'rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Top Header Row: Mode Switcher + Send Button + Live Cost */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          {/* Workspace Mode Segmented Control */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-card)',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              gap: '2px'
            }}
          >
            <button
              type="button"
              onClick={() => handleSwitchWorkspaceMode('matrix')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: workspaceMode === 'matrix' ? 'var(--accent-primary)' : 'transparent',
                color: workspaceMode === 'matrix' ? '#ffffff' : 'var(--text-secondary)'
              }}
              title="Structured multi-turn prompt & dialog matrix builder"
            >
              <CodeIcon size={14} />
              <span>Prompt Matrix</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchWorkspaceMode('raw')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: workspaceMode === 'raw' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'transparent',
                color: workspaceMode === 'raw' ? '#ffffff' : 'var(--text-secondary)'
              }}
              title="Direct Raw JSON REST editor with auto-formatting and presets"
            >
              <BracesIcon size={14} />
              <span>Raw JSON / REST</span>
            </button>
          </div>

          {/* Action Area: Send / Stop Stream + Token Cost Calculator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 8px',
                borderRadius: '5px',
                background: 'rgba(255,255,255,0.05)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)'
              }}
              title="Live token count and estimated cost before execution"
            >
              <span style={{ color: 'var(--accent-cyan)' }}>~{inputTokenEstimate} tok</span>
              <span style={{ color: 'var(--text-muted)' }}>({costEstimate.formattedTotal})</span>
            </div>

            {isLoading || isStreamingActive ? (
              <button
                type="button"
                onClick={onStopStreaming}
                className="forge-btn forge-btn-danger"
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                <StopIcon size={15} />
                <span>{isStreamingActive ? 'Stop Stream' : 'Cancel'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onSendRequest}
                className="forge-btn forge-btn-primary"
                style={{ padding: '8px 20px', fontSize: '13px' }}
              >
                <PlayIcon size={15} />
                <span>Send Request</span>
              </button>
            )}
          </div>
        </div>

        {/* Second Row: Endpoint & Quick Presets Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <EndpointInput
            method={config.method}
            onChangeMethod={(method) => onChangeConfig((prev) => ({ ...prev, method }))}
            endpoint={config.endpoint}
            onChangeEndpoint={(endpoint) => onChangeConfig((prev) => ({ ...prev, endpoint }))}
          />
        </div>

        {/* Third Row: Model ID & Preset Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <ModelInput
              modelId={config.modelId}
              onChangeModelId={(modelId) => onChangeConfig((prev) => ({ ...prev, modelId }))}
            />
          </div>

          {/* Preset Selector */}
          {workspaceMode === 'matrix' ? (
            <ProviderPresetSelector
              activePresetId={config.presetId}
              onApplyPreset={onApplyPreset}
            />
          ) : (
            /* Dedicated Quick Presets Dropdown for Raw REST Mode */
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsQuickPresetOpen(!isQuickPresetOpen)}
                className="forge-btn"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-medium)',
                  padding: '6px 12px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <SparklesIcon size={13} style={{ color: 'var(--accent-cyan)' }} />
                <span>Insert Provider Preset Payload</span>
                <ChevronDownIcon size={12} />
              </button>

              {isQuickPresetOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    right: 0,
                    width: '320px',
                    maxHeight: '380px',
                    overflowY: 'auto',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
                    zIndex: 50,
                    padding: '6px'
                  }}
                >
                  <div style={{ padding: '6px 10px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Select Schema Template
                  </div>
                  {PROVIDER_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectRawPreset(preset)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {preset.name}
                        </span>
                        <span className={`forge-badge method-badge-${preset.defaultMethod.toLowerCase()}`} style={{ fontSize: '9px', padding: '1px 4px' }}>
                          {preset.defaultMethod}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {preset.provider || preset.name} &bull; {preset.defaultModel}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar (Horizontally scrollable touch pills) */}
      <div
        className="touch-pill-row"
        style={{
          padding: '6px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)'
        }}
      >
        {workspaceMode === 'matrix' ? (
          <button
            type="button"
            onClick={() => setActiveTab('messages')}
            className={`forge-btn ${activeTab === 'messages' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
            style={{ padding: '5px 12px', fontSize: '12px' }}
          >
            <CodeIcon size={13} />
            <span>Messages ({config.messages.length})</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setActiveTab('raw')}
            className={`forge-btn ${activeTab === 'raw' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
            style={{ padding: '5px 12px', fontSize: '12px' }}
          >
            <BracesIcon size={13} />
            <span>Raw JSON Body</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('params')}
          className={`forge-btn ${activeTab === 'params' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ padding: '5px 12px', fontSize: '12px' }}
        >
          <SlidersIcon size={13} />
          <span>Parameters</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('headers')}
          className={`forge-btn ${activeTab === 'headers' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ padding: '5px 12px', fontSize: '12px' }}
        >
          <LayersIcon size={13} />
          <span>Headers ({config.headers.filter((h) => h.enabled).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('auth')}
          className={`forge-btn ${activeTab === 'auth' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ padding: '5px 12px', fontSize: '12px' }}
        >
          <KeyIcon size={13} />
          <span>Auth & Proxy</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`forge-btn ${activeTab === 'preview' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ padding: '5px 12px', fontSize: '12px' }}
        >
          <TerminalIcon size={13} />
          <span>Code & SDK</span>
        </button>
      </div>

      {/* Main Request Form Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
        {/* Prompt Matrix (Multi-turn messages) */}
        {activeTab === 'messages' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>Structured Multi-Turn AI Prompt Matrix</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowPromptVersioning(!showPromptVersioning)}
                  className="forge-btn forge-btn-ghost"
                  style={{ padding: '3px 8px', fontSize: '11.5px', border: '1px solid var(--border-subtle)' }}
                >
                  <SparklesIcon size={12} style={{ color: 'var(--accent-primary)' }} />
                  <span>{showPromptVersioning ? 'Hide Version Diff' : 'Prompt Versions & Diff'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchWorkspaceMode('raw')}
                  className="forge-btn forge-btn-ghost"
                  style={{ padding: '3px 8px', fontSize: '11.5px', color: 'var(--accent-cyan)' }}
                >
                  Switch to Raw JSON →
                </button>
              </div>
            </div>

            {/* Collapsible Prompt Versioning Box */}
            {showPromptVersioning && (
              <PromptVersioning
                currentContent={fullPromptText}
                onRestoreVersion={(content) => {
                  onChangeConfig((prev) => ({
                    ...prev,
                    messages: [{ id: `msg_${Date.now()}`, role: 'user', content }]
                  }));
                }}
              />
            )}

            <MessageEditor
              messages={config.messages}
              onChangeMessages={(messages) => onChangeConfig((prev) => ({ ...prev, messages }))}
            />
          </div>
        )}

        {/* Raw JSON / REST Payload Editor */}
        {activeTab === 'raw' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <RawJsonEditor
              value={config.rawBody}
              onChange={(rawBody) => onChangeConfig((prev) => ({ ...prev, rawBody }))}
            />
          </div>
        )}

        {/* Inference & Hyperparameters */}
        {activeTab === 'params' && (
          <ParameterEditor
            queryParams={config.queryParams}
            onChangeQueryParams={(queryParams) => onChangeConfig((prev) => ({ ...prev, queryParams }))}
            parameters={config.parameters}
            onChangeParameters={(parameters) => onChangeConfig((prev) => ({ ...prev, parameters }))}
            customParameters={config.customParameters}
            onChangeCustomParameters={(customParameters) => onChangeConfig((prev) => ({ ...prev, customParameters }))}
            isStreaming={config.isStreaming}
            onChangeStreaming={(isStreaming) => onChangeConfig((prev) => ({ ...prev, isStreaming }))}
          />
        )}

        {/* Headers Editor */}
        {activeTab === 'headers' && (
          <HeaderEditor
            headers={config.headers}
            onChangeHeaders={(headers) => onChangeConfig((prev) => ({ ...prev, headers }))}
          />
        )}

        {/* Authentication */}
        {activeTab === 'auth' && (
          <ApiKeyInput
            authType={config.authType}
            onChangeAuthType={(authType) => onChangeConfig((prev) => ({ ...prev, authType }))}
            apiKey={config.apiKey}
            onChangeApiKey={(apiKey) => onChangeConfig((prev) => ({ ...prev, apiKey }))}
            customAuthHeaderKey={config.customAuthHeaderKey}
            onChangeCustomAuthHeaderKey={(key) => onChangeConfig((prev) => ({ ...prev, customAuthHeaderKey: key }))}
            customAuthQueryKey={config.customAuthQueryKey}
            onChangeCustomAuthQueryKey={(key) => onChangeConfig((prev) => ({ ...prev, customAuthQueryKey: key }))}
            executionMode={config.executionMode || 'proxy'}
            onChangeExecutionMode={(mode) => onChangeConfig((prev) => ({ ...prev, executionMode: mode }))}
            retryOnFailure={config.retryOnFailure || false}
            onChangeRetryOnFailure={(retry) => onChangeConfig((prev) => ({ ...prev, retryOnFailure: retry }))}
          />
        )}

        {/* cURL and Multi-Language Code Preview */}
        {activeTab === 'preview' && (
          <RequestPreview config={config} environment={environment} />
        )}
      </div>
    </div>
  );
}
