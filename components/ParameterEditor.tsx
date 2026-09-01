'use client';

import React from 'react';
import { ApiRequestConfig, CustomParameter, QueryParam } from '../lib/api/types';
import { SlidersIcon, PlusIcon, TrashIcon, SlidersIcon as ParamIcon } from './Icons';

interface ParameterEditorProps {
  queryParams: QueryParam[];
  onChangeQueryParams: (params: QueryParam[]) => void;
  parameters: ApiRequestConfig['parameters'];
  onChangeParameters: (params: ApiRequestConfig['parameters']) => void;
  customParameters: CustomParameter[];
  onChangeCustomParameters: (params: CustomParameter[]) => void;
  isStreaming: boolean;
  onChangeStreaming: (stream: boolean) => void;
}

export function ParameterEditor({
  queryParams,
  onChangeQueryParams,
  parameters,
  onChangeParameters,
  customParameters,
  onChangeCustomParameters,
  isStreaming,
  onChangeStreaming
}: ParameterEditorProps) {
  // Query params helpers
  const handleAddQueryParam = () => {
    onChangeQueryParams([
      ...queryParams,
      { id: 'qp_' + Math.random().toString(36).substring(2, 7), key: '', value: '', enabled: true }
    ]);
  };

  const handleUpdateQueryParam = (id: string, field: 'key' | 'value', val: string) => {
    onChangeQueryParams(
      queryParams.map((q) => (q.id === id ? { ...q, [field]: val } : q))
    );
  };

  const handleToggleQueryParam = (id: string) => {
    onChangeQueryParams(
      queryParams.map((q) => (q.id === id ? { ...q, enabled: !q.enabled } : q))
    );
  };

  const handleDeleteQueryParam = (id: string) => {
    onChangeQueryParams(queryParams.filter((q) => q.id !== id));
  };

  // Custom params helpers
  const handleAddCustomParam = () => {
    onChangeCustomParameters([
      ...customParameters,
      {
        id: 'cp_' + Math.random().toString(36).substring(2, 7),
        key: '',
        value: '',
        type: 'string',
        enabled: true
      }
    ]);
  };

  const handleUpdateCustomParam = (id: string, field: keyof CustomParameter, val: any) => {
    onChangeCustomParameters(
      customParameters.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
  };

  const handleDeleteCustomParam = (id: string) => {
    onChangeCustomParameters(customParameters.filter((c) => c.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* 1. Model Hyperparameters */}
      <div className="glass-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
          <SlidersIcon size={15} style={{ color: 'var(--accent-primary)' }} />
          <span>Model Inference Parameters</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {/* Temperature */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Temperature:</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                {parameters.temperature ?? 0.7}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={parameters.temperature ?? 0.7}
              onChange={(e) => onChangeParameters({ ...parameters, temperature: parseFloat(e.target.value) })}
              style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
          </div>

          {/* Top P */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Top P:</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                {parameters.top_p ?? 1.0}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={parameters.top_p ?? 1.0}
              onChange={(e) => onChangeParameters({ ...parameters, top_p: parseFloat(e.target.value) })}
              style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
          </div>

          {/* Max Tokens */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Max Tokens:</label>
            <input
              type="number"
              value={parameters.max_tokens ?? 2048}
              onChange={(e) => onChangeParameters({ ...parameters, max_tokens: parseInt(e.target.value) || undefined })}
              className="forge-input forge-input-mono"
              placeholder="e.g. 2048"
            />
          </div>

          {/* Stream Switch */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'center' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Streaming Mode:</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
              <input
                type="checkbox"
                checked={isStreaming}
                onChange={(e) => onChangeStreaming(e.target.checked)}
                style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
              />
              <span style={{ fontWeight: 600, color: isStreaming ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                {isStreaming ? 'Streaming Enabled (SSE/WebStreams)' : 'Non-Streaming (Full Response)'}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* 2. URL Query Parameters */}
      <div className="glass-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            URL Query Parameters (?key=value)
          </div>
          <button
            type="button"
            onClick={handleAddQueryParam}
            className="forge-btn forge-btn-ghost"
            style={{ padding: '4px 8px', fontSize: '12px' }}
          >
            <PlusIcon size={13} />
            <span>Add Param</span>
          </button>
        </div>

        {queryParams.length === 0 ? (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            No query parameters. (e.g. key=AIza... or alt=sse)
          </div>
        ) : (
          queryParams.map((q) => (
            <div
              key={q.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '28px 1fr 1.5fr 36px',
                gap: '8px',
                alignItems: 'center'
              }}
            >
              <input
                type="checkbox"
                checked={q.enabled}
                onChange={() => handleToggleQueryParam(q.id)}
                style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
              <input
                type="text"
                value={q.key}
                onChange={(e) => handleUpdateQueryParam(q.id, 'key', e.target.value)}
                placeholder="Param Name"
                className="forge-input forge-input-mono"
              />
              <input
                type="text"
                value={q.value}
                onChange={(e) => handleUpdateQueryParam(q.id, 'value', e.target.value)}
                placeholder="Param Value"
                className="forge-input forge-input-mono"
              />
              <button
                type="button"
                onClick={() => handleDeleteQueryParam(q.id)}
                className="forge-btn forge-btn-ghost"
                style={{ color: 'var(--accent-rose)' }}
              >
                <TrashIcon size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* 3. Custom Arbitrary JSON Parameters */}
      <div className="glass-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Custom JSON Parameters (Arbitrary Keys)
          </div>
          <button
            type="button"
            onClick={handleAddCustomParam}
            className="forge-btn forge-btn-ghost"
            style={{ padding: '4px 8px', fontSize: '12px' }}
          >
            <PlusIcon size={13} />
            <span>Add Custom Field</span>
          </button>
        </div>

        {customParameters.length === 0 ? (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Add any provider-specific parameters like `seed`, `top_k`, `tools`, `response_format`, etc.
          </div>
        ) : (
          customParameters.map((cp) => (
            <div
              key={cp.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '28px 1.2fr 90px 1.5fr 36px',
                gap: '8px',
                alignItems: 'center'
              }}
            >
              <input
                type="checkbox"
                checked={cp.enabled}
                onChange={(e) => handleUpdateCustomParam(cp.id, 'enabled', e.target.checked)}
                style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
              <input
                type="text"
                value={cp.key}
                onChange={(e) => handleUpdateCustomParam(cp.id, 'key', e.target.value)}
                placeholder="Field Key"
                className="forge-input forge-input-mono"
              />
              <select
                value={cp.type}
                onChange={(e) => handleUpdateCustomParam(cp.id, 'type', e.target.value)}
                className="forge-select"
                style={{ padding: '6px 8px', fontSize: '12px' }}
              >
                <option value="string">string</option>
                <option value="number">number</option>
                <option value="boolean">bool</option>
                <option value="json">json</option>
              </select>
              <input
                type="text"
                value={cp.value}
                onChange={(e) => handleUpdateCustomParam(cp.id, 'value', e.target.value)}
                placeholder={cp.type === 'json' ? '{"type": "json_object"}' : 'Value'}
                className="forge-input forge-input-mono"
              />
              <button
                type="button"
                onClick={() => handleDeleteCustomParam(cp.id)}
                className="forge-btn forge-btn-ghost"
                style={{ color: 'var(--accent-rose)' }}
              >
                <TrashIcon size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
