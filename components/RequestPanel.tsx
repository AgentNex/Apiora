'use client';

import React, { useState } from 'react';
import { ApiRequestConfig, Environment, ProviderPreset } from '../lib/api/types';
import { PROVIDER_PRESETS } from '../lib/api/presets';
import { EndpointInput } from './EndpointInput';
import { ProviderPresetSelector } from './ProviderPresetSelector';
import { ModelInput } from './ModelInput';
import { ApiKeyInput } from './ApiKeyInput';
import { HeaderEditor } from './HeaderEditor';
import { ParameterEditor } from './ParameterEditor';
import { MessageEditor } from './MessageEditor';
import { RawJsonEditor } from './RawJsonEditor';
import { RequestPreview } from './RequestPreview';
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

type WorkspaceMode = 'matrix' | 'raw';
type RequestTab = 'messages' | 'raw' | 'headers' | 'params' | 'auth' | 'preview';

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
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>(
    config.bodyMode === 'raw' ? 'raw' : 'matrix'
  );
  const [activeTab, setActiveTab] = useState<RequestTab>(
    config.bodyMode === 'raw' ? 'raw' : 'messages'
  );
  const [isQuickPresetOpen, setIsQuickPresetOpen] = useState(false);
  const [quickPresetSuccess, setQuickPresetSuccess] = useState<string | null>(null);

  // Quick preset application for Raw REST mode
  const handleSelectRawPreset = (preset: ProviderPreset) => {
    onApplyPreset(preset);
    if (preset.defaultRawBody) {
      onChangeConfig((prev) => ({
        ...prev,
        rawBody: preset.defaultRawBody || prev.rawBody,
        bodyMode: 'raw'
      }));
    } else {
      // Generate sample JSON from messages if defaultRawBody is empty
      const sample = JSON.stringify(
        {
          model: preset.defaultModel,
          messages: preset.defaultMessages.map((m) => ({ role: m.role, content: m.content })),
          ...(preset.defaultParameters || {})
        },
        null,
        2
      );
      onChangeConfig((prev) => ({
        ...prev,
        rawBody: sample,
        bodyMode: 'raw'
      }));
    }
    setIsQuickPresetOpen(false);
    setQuickPresetSuccess(preset.name);
    setTimeout(() => setQuickPresetSuccess(null), 2500);
  };

  // Toggle between Prompt Matrix and Raw REST mode
  const handleSwitchWorkspaceMode = (mode: WorkspaceMode) => {
    setWorkspaceMode(mode);
    if (mode === 'matrix') {
      onChangeConfig((prev) => ({ ...prev, bodyMode: 'builder' }));
      setActiveTab('messages');
    } else {
      onChangeConfig((prev) => ({ ...prev, bodyMode: 'raw' }));
      setActiveTab('raw');
    }
  };

  // Quick add header helper in Raw REST mode
  const handleQuickAddHeader = (key: string, value: string) => {
    onChangeConfig((prev) => {
      const exists = prev.headers.some((h) => h.key.toLowerCase() === key.toLowerCase());
      if (exists) {
        return {
          ...prev,
          headers: prev.headers.map((h) =>
            h.key.toLowerCase() === key.toLowerCase() ? { ...h, value, enabled: true } : h
          )
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
        {/* Top Header Row: Mode Switcher + Send Button */}
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

          {/* Action Area: Send / Stop Stream */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="hidden sm:inline">
              <strong>Ctrl + Enter</strong>
            </span>

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
                  border: '1px solid var(--border-accent)',
                  padding: '7px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                title="Populate Speechmatics, Deepgram, Groq Whisper, and other REST endpoints"
              >
                <SparklesIcon size={14} style={{ color: 'var(--accent-cyan)' }} />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '12.5px' }}>
                  Quick Presets
                </span>
                <ChevronDownIcon size={13} style={{ color: 'var(--text-muted)' }} />
              </button>

              {isQuickPresetOpen && (
                <>
                  <div
                    onClick={() => setIsQuickPresetOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                  />
                  <div
                    className="glass-panel"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      right: 0,
                      width: '360px',
                      maxHeight: '420px',
                      overflowY: 'auto',
                      padding: '8px',
                      zIndex: 50,
                      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.55)'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--accent-cyan)',
                        padding: '4px 8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      ⚡ Quick REST & Speech Presets
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                      {PROVIDER_PRESETS.map((preset) => {
                        const isSelected = preset.id === config.presetId;
                        const isAudio = preset.category === 'Speech & Audio';

                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectRawPreset(preset)}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              border: isSelected ? '1px solid var(--border-accent)' : '1px solid transparent',
                              background: isSelected
                                ? 'rgba(6, 182, 212, 0.15)'
                                : isAudio
                                ? 'rgba(99, 102, 241, 0.08)'
                                : 'transparent',
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'background 0.12s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected)
                                e.currentTarget.style.background = isAudio
                                  ? 'rgba(99, 102, 241, 0.08)'
                                  : 'transparent';
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '13px', fontWeight: 600, color: isAudio ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                                {preset.name}
                              </span>
                              {isAudio && (
                                <span
                                  style={{
                                    fontSize: '9.5px',
                                    padding: '1px 5px',
                                    borderRadius: '4px',
                                    background: 'rgba(6, 182, 212, 0.2)',
                                    color: 'var(--accent-cyan)',
                                    fontWeight: 700
                                  }}
                                >
                                  AUDIO/STT
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                              {preset.description}
                            </span>
                            <span style={{ fontSize: '10.5px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                              {preset.defaultMethod} {preset.endpointTemplate.split('?')[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Quick preset loaded alert */}
        {quickPresetSuccess && (
          <div
            style={{
              fontSize: '11.5px',
              padding: '6px 10px',
              borderRadius: '6px',
              background: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <CheckIcon size={13} />
            <span>Loaded preset <strong>{quickPresetSuccess}</strong> (endpoint, headers, and JSON body populated).</span>
          </div>
        )}
      </div>

      {/* Sub-Navigation Tabs */}
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
        {workspaceMode === 'matrix' ? (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('messages')}
              className={`forge-btn ${activeTab === 'messages' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
              style={{ padding: '4px 10px', fontSize: '12px' }}
            >
              <CodeIcon size={13} />
              <span>Prompt Matrix ({config.messages.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('params')}
              className={`forge-btn ${activeTab === 'params' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
              style={{ padding: '4px 10px', fontSize: '12px' }}
            >
              <SlidersIcon size={13} />
              <span>Parameters</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('raw')}
              className={`forge-btn ${activeTab === 'raw' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
              style={{ padding: '4px 10px', fontSize: '12px' }}
            >
              <BracesIcon size={13} />
              <span>JSON Payload</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('params')}
              className={`forge-btn ${activeTab === 'params' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
              style={{ padding: '4px 10px', fontSize: '12px' }}
            >
              <SlidersIcon size={13} />
              <span>Query Params</span>
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('headers')}
          className={`forge-btn ${activeTab === 'headers' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ padding: '4px 10px', fontSize: '12px' }}
        >
          <LayersIcon size={13} />
          <span>Headers ({config.headers.filter((h) => h.enabled).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('auth')}
          className={`forge-btn ${activeTab === 'auth' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ padding: '4px 10px', fontSize: '12px' }}
        >
          <KeyIcon size={13} />
          <span>Auth</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`forge-btn ${activeTab === 'preview' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ padding: '4px 10px', fontSize: '12px' }}
        >
          <TerminalIcon size={13} />
          <span>cURL Preview</span>
        </button>
      </div>

      {/* Main Request Form Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
        {/* Prompt Matrix (Multi-turn messages) */}
        {activeTab === 'messages' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>Mode: Structured AI Prompt Matrix</span>
              <button
                type="button"
                onClick={() => handleSwitchWorkspaceMode('raw')}
                className="forge-btn forge-btn-ghost"
                style={{ padding: '3px 8px', fontSize: '11.5px', color: 'var(--accent-cyan)' }}
              >
                Switch to Raw JSON / REST →
              </button>
            </div>
            <MessageEditor
              messages={config.messages}
              onChangeMessages={(messages) => onChangeConfig((prev) => ({ ...prev, messages }))}
            />
          </div>
        )}

        {/* Raw JSON / REST Payload Editor with Auto-Formatting and Direct Headers */}
        {activeTab === 'raw' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Direct Headers Bar in Raw REST Mode */}
            <div
              className="glass-card"
              style={{
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <LayersIcon size={13} style={{ color: 'var(--accent-primary)' }} />
                <span>Direct Headers:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                  {config.headers.filter((h) => h.enabled).slice(0, 3).map((h) => (
                    <span
                      key={h.id}
                      style={{
                        fontSize: '11px',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      {h.key}
                    </span>
                  ))}
                  {config.headers.filter((h) => h.enabled).length > 3 && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      +{config.headers.filter((h) => h.enabled).length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Direct Header Quick Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleQuickAddHeader('Content-Type', 'application/json')}
                  className="forge-btn forge-btn-ghost"
                  style={{ padding: '3px 7px', fontSize: '11px', border: '1px solid var(--border-subtle)' }}
                >
                  + Content-Type: json
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddHeader('Accept', 'application/json')}
                  className="forge-btn forge-btn-ghost"
                  style={{ padding: '3px 7px', fontSize: '11px', border: '1px solid var(--border-subtle)' }}
                >
                  + Accept: json
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('headers')}
                  className="forge-btn forge-btn-ghost"
                  style={{ padding: '3px 7px', fontSize: '11px', color: 'var(--accent-primary)' }}
                >
                  Manage All Headers →
                </button>
              </div>
            </div>

            {/* Streamlined JSON Editor */}
            <RawJsonEditor
              value={config.rawBody}
              onChange={(rawBody) => onChangeConfig((prev) => ({ ...prev, rawBody, bodyMode: 'raw' }))}
            />
          </div>
        )}

        {/* Parameters & Query Params */}
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
          />
        )}

        {/* cURL and Fetch Preview */}
        {activeTab === 'preview' && (
          <RequestPreview config={config} environment={environment} />
        )}
      </div>
    </div>
  );
}
