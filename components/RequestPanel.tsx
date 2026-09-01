'use client';

import React, { useState } from 'react';
import { ApiRequestConfig, Environment, ProviderPreset } from '../lib/api/types';
import { EndpointInput } from './EndpointInput';
import { ProviderPresetSelector } from './ProviderPresetSelector';
import { ModelInput } from './ModelInput';
import { ApiKeyInput } from './ApiKeyInput';
import { HeaderEditor } from './HeaderEditor';
import { ParameterEditor } from './ParameterEditor';
import { MessageEditor } from './MessageEditor';
import { RawJsonEditor } from './RawJsonEditor';
import { RequestPreview } from './RequestPreview';
import { PlayIcon, StopIcon, LayersIcon, SlidersIcon, KeyIcon, CodeIcon, TerminalIcon } from './Icons';

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
  const [activeTab, setActiveTab] = useState<RequestTab>('messages');

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
      {/* Top Bar: Preset + Method + Endpoint + Send Button */}
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          background: 'rgba(0, 0, 0, 0.15)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <ProviderPresetSelector
            activePresetId={config.presetId}
            onApplyPreset={onApplyPreset}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Shortcut: <strong>Ctrl + Enter</strong>
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

        {/* Method & Endpoint Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <EndpointInput
            method={config.method}
            onChangeMethod={(method) => onChangeConfig((prev) => ({ ...prev, method }))}
            endpoint={config.endpoint}
            onChangeEndpoint={(endpoint) => onChangeConfig((prev) => ({ ...prev, endpoint }))}
          />
        </div>

        {/* Model ID & Auth Quick Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          <ModelInput
            modelId={config.modelId}
            onChangeModelId={(modelId) => onChangeConfig((prev) => ({ ...prev, modelId }))}
          />
        </div>
      </div>

      {/* Request Sub-Tabs */}
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
          onClick={() => setActiveTab('messages')}
          className={`forge-btn ${activeTab === 'messages' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ padding: '4px 10px', fontSize: '12px' }}
        >
          <CodeIcon size={13} />
          <span>Messages ({config.messages.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('raw')}
          className={`forge-btn ${activeTab === 'raw' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
          style={{ padding: '4px 10px', fontSize: '12px' }}
        >
          <span>Raw Body</span>
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
          <span>Preview cURL</span>
        </button>
      </div>

      {/* Main Request Form Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
        {activeTab === 'messages' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>Mode: Structured AI Prompt Builder</span>
              <button
                type="button"
                onClick={() => {
                  onChangeConfig((prev) => ({ ...prev, bodyMode: 'raw' }));
                  setActiveTab('raw');
                }}
                className="forge-btn forge-btn-ghost"
                style={{ padding: '3px 8px', fontSize: '11.5px', color: 'var(--accent-primary)' }}
              >
                Switch to Raw JSON →
              </button>
            </div>
            <MessageEditor
              messages={config.messages}
              onChangeMessages={(messages) => onChangeConfig((prev) => ({ ...prev, messages }))}
            />
          </div>
        )}

        {activeTab === 'raw' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>Mode: Direct Raw JSON Payload</span>
              <button
                type="button"
                onClick={() => {
                  onChangeConfig((prev) => ({ ...prev, bodyMode: 'builder' }));
                  setActiveTab('messages');
                }}
                className="forge-btn forge-btn-ghost"
                style={{ padding: '3px 8px', fontSize: '11.5px', color: 'var(--accent-primary)' }}
              >
                Switch to Messages Builder →
              </button>
            </div>
            <RawJsonEditor
              value={config.rawBody}
              onChange={(rawBody) => onChangeConfig((prev) => ({ ...prev, rawBody, bodyMode: 'raw' }))}
            />
          </div>
        )}

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

        {activeTab === 'headers' && (
          <HeaderEditor
            headers={config.headers}
            onChangeHeaders={(headers) => onChangeConfig((prev) => ({ ...prev, headers }))}
          />
        )}

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

        {activeTab === 'preview' && (
          <RequestPreview config={config} environment={environment} />
        )}
      </div>
    </div>
  );
}
