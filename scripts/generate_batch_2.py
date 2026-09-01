import os

BASE_DIR = "/data/data/com.termux/files/home/api-forge-ai"

files = {}

# 9. components/HeaderEditor.tsx
files["components/HeaderEditor.tsx"] = '''\'use client\';

import React from \'react\';
import { HeaderEntry } from \'../lib/api/types\';
import { PlusIcon, TrashIcon, LayersIcon } from \'./Icons\';

interface HeaderEditorProps {
  headers: HeaderEntry[];
  onChangeHeaders: (headers: HeaderEntry[]) => void;
}

export function HeaderEditor({ headers, onChangeHeaders }: HeaderEditorProps) {
  const handleToggle = (id: string) => {
    onChangeHeaders(
      headers.map((h) => (h.id === id ? { ...h, enabled: !h.enabled } : h))
    );
  };

  const handleUpdate = (id: string, field: \'key\' | \'value\', val: string) => {
    onChangeHeaders(
      headers.map((h) => (h.id === id ? { ...h, [field]: val } : h))
    );
  };

  const handleDelete = (id: string) => {
    onChangeHeaders(headers.filter((h) => h.id !== id));
  };

  const handleAdd = () => {
    onChangeHeaders([
      ...headers,
      { id: 'h_' + Math.random().toString(36).substring(2, 7), key: '', value: '', enabled: true }
    ]);
  };

  const handleAddPreset = (key: string, value: string) => {
    if (headers.some((h) => h.key.toLowerCase() === key.toLowerCase())) return;
    onChangeHeaders([
      ...headers,
      { id: 'h_' + Math.random().toString(36).substring(2, 7), key, value, enabled: true }
    ]);
  };

  return (
    <div className="glass-card" style={{ padding: \'14px\', display: \'flex\', flexDirection: \'column\', gap: \'12px\' }}>
      <div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'space-between\' }}>
        <div style={{ display: \'flex\', alignItems: \'center\', gap: \'6px\', fontSize: \'13px\', fontWeight: 600, color: \'var(--text-primary)\' }}>
          <LayersIcon size={15} style={{ color: \'var(--accent-primary)\' }} />
          <span>HTTP Headers ({headers.filter((h) => h.enabled).length} active)</span>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="forge-btn forge-btn-primary"
          style={{ padding: \'5px 10px\', fontSize: \'12px\' }}
        >
          <PlusIcon size={13} />
          <span>Add Header</span>
        </button>
      </div>

      {/* Quick Add Presets Bar */}
      <div style={{ display: \'flex\', alignItems: \'center\', gap: \'6px\', flexWrap: \'wrap\' }}>
        <span style={{ fontSize: \'11px\', color: \'var(--text-muted)\' }}>Quick Add:</span>
        <button
          type="button"
          onClick={() => handleAddPreset(\'Content-Type\', \'application/json\')}
          className="forge-btn forge-btn-ghost"
          style={{ padding: \'2px 6px\', fontSize: \'11px\' }}
        >
          + Content-Type: json
        </button>
        <button
          type="button"
          onClick={() => handleAddPreset(\'Accept\', \'application/json\')}
          className="forge-btn forge-btn-ghost"
          style={{ padding: \'2px 6px\', fontSize: \'11px\' }}
        >
          + Accept: json
        </button>
        <button
          type="button"
          onClick={() => handleAddPreset(\'anthropic-version\', \'2023-06-01\')}
          className="forge-btn forge-btn-ghost"
          style={{ padding: \'2px 6px\', fontSize: \'11px\' }}
        >
          + anthropic-version
        </button>
        <button
          type="button"
          onClick={() => handleAddPreset(\'HTTP-Referer\', \'https://apiforge.ai\')}
          className="forge-btn forge-btn-ghost"
          style={{ padding: \'2px 6px\', fontSize: \'11px\' }}
        >
          + OpenRouter Referer
        </button>
      </div>

      {/* Dynamic Headers Table */}
      <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'6px\' }}>
        {headers.length === 0 ? (
          <div style={{ padding: \'16px\', textAlign: \'center\', color: \'var(--text-muted)\', fontSize: \'12px\' }}>
            No custom headers configured. Click "Add Header" above.
          </div>
        ) : (
          headers.map((h) => (
            <div
              key={h.id}
              style={{
                display: \'grid\',
                gridTemplateColumns: \'32px 1fr 1.5fr 36px\',
                gap: \'8px\',
                alignItems: \'center\',
                background: h.enabled ? \'var(--bg-input)\' : \'rgba(255,255,255,0.02)\',
                padding: \'6px 8px\',
                borderRadius: \'6px\',
                border: \'1px solid var(--border-subtle)\',
                opacity: h.enabled ? 1 : 0.6
              }}
            >
              {/* Enable checkbox */}
              <input
                type="checkbox"
                checked={h.enabled}
                onChange={() => handleToggle(h.id)}
                style={{ cursor: \'pointer\', accentColor: \'var(--accent-primary)\', width: \'16px\', height: \'16px\' }}
                title={h.enabled ? \'Disable header\' : \'Enable header\'}
              />

              {/* Key Input */}
              <input
                type="text"
                value={h.key}
                onChange={(e) => handleUpdate(h.id, \'key\', e.target.value)}
                placeholder="Header name (e.g. Content-Type)"
                className="forge-input-mono"
                style={{
                  background: \'transparent\',
                  border: \'none\',
                  outline: \'none\',
                  color: \'var(--text-primary)\',
                  fontSize: \'12.5px\'
                }}
              />

              {/* Value Input */}
              <input
                type="text"
                value={h.value}
                onChange={(e) => handleUpdate(h.id, \'value\', e.target.value)}
                placeholder="Value (supports {{VARIABLE}})"
                className="forge-input-mono"
                style={{
                  background: \'transparent\',
                  border: \'none\',
                  outline: \'none\',
                  color: \'var(--text-secondary)\',
                  fontSize: \'12.5px\'
                }}
              />

              {/* Delete */}
              <button
                type="button"
                onClick={() => handleDelete(h.id)}
                className="forge-btn forge-btn-ghost"
                style={{ padding: \'6px\', color: \'var(--accent-rose)\' }}
                title="Delete Header"
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
'''

# 10. components/ParameterEditor.tsx
files["components/ParameterEditor.tsx"] = '''\'use client\';

import React from \'react\';
import { ApiRequestConfig, CustomParameter, QueryParam } from \'../lib/api/types\';
import { SlidersIcon, PlusIcon, TrashIcon, SlidersIcon as ParamIcon } from \'./Icons\';

interface ParameterEditorProps {
  queryParams: QueryParam[];
  onChangeQueryParams: (params: QueryParam[]) => void;
  parameters: ApiRequestConfig[\'parameters\'];
  onChangeParameters: (params: ApiRequestConfig[\'parameters\']) => void;
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

  const handleUpdateQueryParam = (id: string, field: \'key\' | \'value\', val: string) => {
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
    <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'14px\' }}>
      {/* 1. Model Hyperparameters */}
      <div className="glass-card" style={{ padding: \'14px\', display: \'flex\', flexDirection: \'column\', gap: \'12px\' }}>
        <div style={{ display: \'flex\', alignItems: \'center\', gap: \'6px\', fontSize: \'13px\', fontWeight: 600, color: \'var(--text-primary)\' }}>
          <SlidersIcon size={15} style={{ color: \'var(--accent-primary)\' }} />
          <span>Model Inference Parameters</span>
        </div>

        <div style={{ display: \'grid\', gridTemplateColumns: \'repeat(auto-fit, minmax(220px, 1fr))\', gap: \'12px\' }}>
          {/* Temperature */}
          <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'4px\' }}>
            <div style={{ display: \'flex\', justifyContent: \'space-between\', fontSize: \'12px\' }}>
              <span style={{ color: \'var(--text-secondary)\' }}>Temperature:</span>
              <span style={{ fontWeight: 600, color: \'var(--accent-cyan)\', fontFamily: \'var(--font-mono)\' }}>
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
              style={{ accentColor: \'var(--accent-primary)\', cursor: \'pointer\' }}
            />
          </div>

          {/* Top P */}
          <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'4px\' }}>
            <div style={{ display: \'flex\', justifyContent: \'space-between\', fontSize: \'12px\' }}>
              <span style={{ color: \'var(--text-secondary)\' }}>Top P:</span>
              <span style={{ fontWeight: 600, color: \'var(--accent-cyan)\', fontFamily: \'var(--font-mono)\' }}>
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
              style={{ accentColor: \'var(--accent-primary)\', cursor: \'pointer\' }}
            />
          </div>

          {/* Max Tokens */}
          <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'4px\' }}>
            <label style={{ fontSize: \'12px\', color: \'var(--text-secondary)\' }}>Max Tokens:</label>
            <input
              type="number"
              value={parameters.max_tokens ?? 2048}
              onChange={(e) => onChangeParameters({ ...parameters, max_tokens: parseInt(e.target.value) || undefined })}
              className="forge-input forge-input-mono"
              placeholder="e.g. 2048"
            />
          </div>

          {/* Stream Switch */}
          <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'4px\', justifyContent: \'center\' }}>
            <label style={{ fontSize: \'12px\', color: \'var(--text-secondary)\' }}>Streaming Mode:</label>
            <label style={{ display: \'flex\', alignItems: \'center\', gap: \'8px\', cursor: \'pointer\', fontSize: \'13px\' }}>
              <input
                type="checkbox"
                checked={isStreaming}
                onChange={(e) => onChangeStreaming(e.target.checked)}
                style={{ accentColor: \'var(--accent-primary)\', width: \'16px\', height: \'16px\' }}
              />
              <span style={{ fontWeight: 600, color: isStreaming ? \'var(--accent-emerald)\' : \'var(--text-muted)\' }}>
                {isStreaming ? \'Streaming Enabled (SSE/WebStreams)\' : \'Non-Streaming (Full Response)\'}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* 2. URL Query Parameters */}
      <div className="glass-card" style={{ padding: \'14px\', display: \'flex\', flexDirection: \'column\', gap: \'10px\' }}>
        <div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'space-between\' }}>
          <div style={{ fontSize: \'13px\', fontWeight: 600, color: \'var(--text-primary)\' }}>
            URL Query Parameters (?key=value)
          </div>
          <button
            type="button"
            onClick={handleAddQueryParam}
            className="forge-btn forge-btn-ghost"
            style={{ padding: \'4px 8px\', fontSize: \'12px\' }}
          >
            <PlusIcon size={13} />
            <span>Add Param</span>
          </button>
        </div>

        {queryParams.length === 0 ? (
          <div style={{ fontSize: \'12px\', color: \'var(--text-muted)\' }}>
            No query parameters. (e.g. key=AIza... or alt=sse)
          </div>
        ) : (
          queryParams.map((q) => (
            <div
              key={q.id}
              style={{
                display: \'grid\',
                gridTemplateColumns: \'28px 1fr 1.5fr 36px\',
                gap: \'8px\',
                alignItems: \'center\'
              }}
            >
              <input
                type="checkbox"
                checked={q.enabled}
                onChange={() => handleToggleQueryParam(q.id)}
                style={{ accentColor: \'var(--accent-primary)\', cursor: \'pointer\' }}
              />
              <input
                type="text"
                value={q.key}
                onChange={(e) => handleUpdateQueryParam(q.id, \'key\', e.target.value)}
                placeholder="Param Name"
                className="forge-input forge-input-mono"
              />
              <input
                type="text"
                value={q.value}
                onChange={(e) => handleUpdateQueryParam(q.id, \'value\', e.target.value)}
                placeholder="Param Value"
                className="forge-input forge-input-mono"
              />
              <button
                type="button"
                onClick={() => handleDeleteQueryParam(q.id)}
                className="forge-btn forge-btn-ghost"
                style={{ color: \'var(--accent-rose)\' }}
              >
                <TrashIcon size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* 3. Custom Arbitrary JSON Parameters */}
      <div className="glass-card" style={{ padding: \'14px\', display: \'flex\', flexDirection: \'column\', gap: \'10px\' }}>
        <div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'space-between\' }}>
          <div style={{ fontSize: \'13px\', fontWeight: 600, color: \'var(--text-primary)\' }}>
            Custom JSON Parameters (Arbitrary Keys)
          </div>
          <button
            type="button"
            onClick={handleAddCustomParam}
            className="forge-btn forge-btn-ghost"
            style={{ padding: \'4px 8px\', fontSize: \'12px\' }}
          >
            <PlusIcon size={13} />
            <span>Add Custom Field</span>
          </button>
        </div>

        {customParameters.length === 0 ? (
          <div style={{ fontSize: \'12px\', color: \'var(--text-muted)\' }}>
            Add any provider-specific parameters like `seed`, `top_k`, `tools`, `response_format`, etc.
          </div>
        ) : (
          customParameters.map((cp) => (
            <div
              key={cp.id}
              style={{
                display: \'grid\',
                gridTemplateColumns: \'28px 1.2fr 90px 1.5fr 36px\',
                gap: \'8px\',
                alignItems: \'center\'
              }}
            >
              <input
                type="checkbox"
                checked={cp.enabled}
                onChange={(e) => handleUpdateCustomParam(cp.id, \'enabled\', e.target.checked)}
                style={{ accentColor: \'var(--accent-primary)\', cursor: \'pointer\' }}
              />
              <input
                type="text"
                value={cp.key}
                onChange={(e) => handleUpdateCustomParam(cp.id, \'key\', e.target.value)}
                placeholder="Field Key"
                className="forge-input forge-input-mono"
              />
              <select
                value={cp.type}
                onChange={(e) => handleUpdateCustomParam(cp.id, \'type\', e.target.value)}
                className="forge-select"
                style={{ padding: \'6px 8px\', fontSize: \'12px\' }}
              >
                <option value="string">string</option>
                <option value="number">number</option>
                <option value="boolean">bool</option>
                <option value="json">json</option>
              </select>
              <input
                type="text"
                value={cp.value}
                onChange={(e) => handleUpdateCustomParam(cp.id, \'value\', e.target.value)}
                placeholder={cp.type === \'json\' ? \'{"type": "json_object"}\' : \'Value\'}
                className="forge-input forge-input-mono"
              />
              <button
                type="button"
                onClick={() => handleDeleteCustomParam(cp.id)}
                className="forge-btn forge-btn-ghost"
                style={{ color: \'var(--accent-rose)\' }}
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
'''

# 11. components/MessageEditor.tsx
files["components/MessageEditor.tsx"] = '''\'use client\';

import React from \'react\';
import { Message, MessageRole } from \'../lib/api/types\';
import { PlusIcon, TrashIcon, GripVerticalIcon, SparklesIcon } from \'./Icons\';
import { estimateTokens } from \'../lib/api/stream-parser\';

interface MessageEditorProps {
  messages: Message[];
  onChangeMessages: (messages: Message[]) => void;
}

const ROLES: MessageRole[] = [\'system\', \'developer\', \'user\', \'assistant\', \'custom\'];

export function MessageEditor({ messages, onChangeMessages }: MessageEditorProps) {
  const handleAddMessage = (role: MessageRole = \'user\') => {
    onChangeMessages([
      ...messages,
      {
        id: 'msg_' + Math.random().toString(36).substring(2, 7),
        role,
        content: \'\'
      }
    ]);
  };

  const handleUpdateMessage = (id: string, field: keyof Message, value: string) => {
    onChangeMessages(
      messages.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleDeleteMessage = (id: string) => {
    onChangeMessages(messages.filter((m) => m.id !== id));
  };

  const handleMoveMessage = (index: number, direction: \'up\' | \'down\') => {
    const newIdx = direction === \'up\' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= messages.length) return;
    const clone = [...messages];
    const item = clone.splice(index, 1)[0];
    clone.splice(newIdx, 0, item);
    onChangeMessages(clone);
  };

  const totalTokens = messages.reduce((acc, m) => acc + estimateTokens(m.content), 0);

  return (
    <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'10px\' }}>
      {/* Header controls */}
      <div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'space-between\', flexWrap: \'wrap\', gap: \'8px\' }}>
        <div style={{ display: \'flex\', alignItems: \'center\', gap: \'8px\' }}>
          <span style={{ fontSize: \'13px\', fontWeight: 600, color: \'var(--text-primary)\' }}>
            Structured Prompt Messages ({messages.length})
          </span>
          <span style={{ fontSize: \'11.5px\', color: \'var(--text-muted)\', background: \'var(--bg-input)\', padding: \'2px 8px\', borderRadius: \'4px\' }}>
            ~{totalTokens} est. tokens
          </span>
        </div>

        <div style={{ display: \'flex\', alignItems: \'center\', gap: \'6px\' }}>
          <button
            type="button"
            onClick={() => handleAddMessage(\'user\')}
            className="forge-btn forge-btn-primary"
            style={{ padding: \'5px 10px\', fontSize: \'12px\' }}
          >
            <PlusIcon size={13} />
            <span>+ User</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddMessage(\'assistant\')}
            className="forge-btn forge-btn-ghost"
            style={{ padding: \'5px 10px\', fontSize: \'12px\', border: \'1px solid var(--border-subtle)\' }}
          >
            <PlusIcon size={13} />
            <span>+ Assistant</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddMessage(\'system\')}
            className="forge-btn forge-btn-ghost"
            style={{ padding: \'5px 10px\', fontSize: \'12px\', border: \'1px solid var(--border-subtle)\' }}
          >
            <PlusIcon size={13} />
            <span>+ System</span>
          </button>
        </div>
      </div>

      {/* Message List */}
      <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'10px\' }}>
        {messages.length === 0 ? (
          <div className="glass-card" style={{ padding: \'24px\', textAlign: \'center\', color: \'var(--text-muted)\' }}>
            No messages yet. Add a System or User message above.
          </div>
        ) : (
          messages.map((msg, idx) => {
            const roleColor =
              msg.role === \'system\'
                ? \'var(--accent-purple)\'
                : msg.role === \'assistant\'
                ? \'var(--accent-emerald)\'
                : msg.role === \'developer\'
                ? \'var(--accent-cyan)\'
                : \'var(--accent-primary)\';

            return (
              <div
                key={msg.id}
                className="glass-card"
                style={{
                  padding: \'12px\',
                  display: \'flex\',
                  flexDirection: \'column\',
                  gap: \'8px\',
                  borderLeft: `3px solid ${roleColor}`
                }}
              >
                {/* Message Header */}
                <div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'space-between\' }}>
                  <div style={{ display: \'flex\', alignItems: \'center\', gap: \'8px\' }}>
                    <select
                      value={msg.role}
                      onChange={(e) => handleUpdateMessage(msg.id, \'role\', e.target.value)}
                      className="forge-select"
                      style={{
                        padding: \'4px 8px\',
                        fontSize: \'12px\',
                        fontWeight: 600,
                        color: roleColor
                      }}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r.toUpperCase()}
                        </option>
                      ))}
                    </select>

                    {msg.role === \'custom\' && (
                      <input
                        type="text"
                        value={msg.customRole || \'\'}
                        onChange={(e) => handleUpdateMessage(msg.id, \'customRole\', e.target.value)}
                        placeholder="Custom Role Name"
                        className="forge-input forge-input-mono"
                        style={{ padding: \'4px 8px\', fontSize: \'12px\', width: \'140px\' }}
                      />
                    )}
                  </div>

                  {/* Actions (Move, Tokens, Delete) */}
                  <div style={{ display: \'flex\', alignItems: \'center\', gap: \'6px\' }}>
                    <span style={{ fontSize: \'10.5px\', color: \'var(--text-muted)\' }}>
                      ~{estimateTokens(msg.content)} tokens
                    </span>

                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveMessage(idx, \'up\')}
                      className="forge-btn forge-btn-ghost"
                      style={{ padding: \'4px 6px\', fontSize: \'11px\' }}
                      title="Move Up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={idx === messages.length - 1}
                      onClick={() => handleMoveMessage(idx, \'down\')}
                      className="forge-btn forge-btn-ghost"
                      style={{ padding: \'4px 6px\', fontSize: \'11px\' }}
                      title="Move Down"
                    >
                      ▼
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="forge-btn forge-btn-ghost"
                      style={{ padding: \'4px 6px\', color: \'var(--accent-rose)\' }}
                      title="Delete Message"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>

                {/* Message Content Area */}
                <textarea
                  value={msg.content}
                  onChange={(e) => handleUpdateMessage(msg.id, \'content\', e.target.value)}
                  placeholder={`Enter ${msg.role} prompt instructions or text...`}
                  rows={Math.min(10, Math.max(3, msg.content.split(\'\\n\').length))}
                  className="forge-input forge-input-mono"
                  style={{
                    resize: \'vertical\',
                    lineHeight: \'1.5\',
                    fontSize: \'13px\'
                  }}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
'''

# 12. components/RawJsonEditor.tsx
files["components/RawJsonEditor.tsx"] = '''\'use client\';

import React, { useState, useEffect } from \'react\';
import { CopyIcon, CheckIcon, TrashIcon, SparklesIcon, CodeIcon } from \'./Icons\';

interface RawJsonEditorProps {
  value: string;
  onChange: (val: string) => void;
}

export function RawJsonEditor({ value, onChange }: RawJsonEditorProps) {
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!value.trim()) {
      setJsonError(null);
      return;
    }
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message || \'Invalid JSON syntax\');
    }
  }, [value]);

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed, null, 2));
    } catch (err: any) {
      setJsonError(`Cannot format: ${err.message}`);
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed));
    } catch (err: any) {
      setJsonError(`Cannot minify: ${err.message}`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const lineCount = value.split(\'\\n\').length;

  return (
    <div className="glass-card" style={{ padding: \'12px\', display: \'flex\', flexDirection: \'column\', gap: \'10px\' }}>
      {/* Editor Action Toolbar */}
      <div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'space-between\', flexWrap: \'wrap\', gap: \'8px\' }}>
        <div style={{ display: \'flex\', alignItems: \'center\', gap: \'6px\', fontSize: \'13px\', fontWeight: 600, color: \'var(--text-primary)\' }}>
          <CodeIcon size={15} style={{ color: \'var(--accent-cyan)\' }} />
          <span>Raw JSON Request Body</span>
        </div>

        <div style={{ display: \'flex\', alignItems: \'center\', gap: \'6px\' }}>
          <button
            type="button"
            onClick={handleFormat}
            className="forge-btn forge-btn-ghost"
            style={{ padding: \'4px 8px\', fontSize: \'12px\', border: \'1px solid var(--border-subtle)\' }}
            title="Pretty Print JSON"
          >
            Format
          </button>
          <button
            type="button"
            onClick={handleMinify}
            className="forge-btn forge-btn-ghost"
            style={{ padding: \'4px 8px\', fontSize: \'12px\', border: \'1px solid var(--border-subtle)\' }}
            title="Minify JSON"
          >
            Minify
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="forge-btn forge-btn-ghost"
            style={{ padding: \'4px 8px\', fontSize: \'12px\', border: \'1px solid var(--border-subtle)\' }}
            title="Copy JSON"
          >
            {copied ? <CheckIcon size={13} style={{ color: \'var(--accent-emerald)\' }} /> : <CopyIcon size={13} />}
          </button>
          <button
            type="button"
            onClick={() => onChange(\'{\\n  \\n}\')}
            className="forge-btn forge-btn-ghost"
            style={{ padding: \'4px 8px\', fontSize: \'12px\', color: \'var(--accent-rose)\' }}
            title="Clear JSON"
          >
            <TrashIcon size={13} />
          </button>
        </div>
      </div>

      {/* Editor area with line numbering */}
      <div
        style={{
          display: \'flex\',
          background: \'var(--bg-input)\',
          border: jsonError ? \'1px solid var(--accent-rose)\' : \'1px solid var(--border-subtle)\',
          borderRadius: \'6px\',
          overflow: \'hidden\',
          minHeight: \'240px\'
        }}
      >
        {/* Line Numbers */}
        <div
          style={{
            padding: \'10px 8px\',
            background: \'rgba(0,0,0,0.3)\',
            borderRight: \'1px solid var(--border-subtle)\',
            color: \'var(--text-faint)\',
            fontFamily: \'var(--font-mono)\',
            fontSize: \'12px\',
            lineHeight: \'1.5\',
            textAlign: \'right\',
            userSelect: \'none\',
            minWidth: \'32px\'
          }}
        >
          {Array.from({ length: Math.max(lineCount, 1) }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="{\n  \"model\": \"gpt-4o\",\n  \"messages\": [\n    {\"role\": \"user\", \"content\": \"Hello\"}\n  ]\n}"
          className="forge-input-mono"
          style={{
            flex: 1,
            background: \'transparent\',
            border: \'none\',
            outline: \'none\',
            color: \'var(--text-primary)\',
            fontSize: \'12.5px\',
            lineHeight: \'1.5\',
            padding: \'10px\',
            resize: \'vertical\',
            fontFamily: \'var(--font-mono)\',
            whiteSpace: \'pre\',
            tabSize: 2
          }}
          spellCheck={false}
        />
      </div>

      {/* JSON Syntax feedback */}
      {jsonError ? (
        <div style={{ fontSize: \'11.5px\', color: \'var(--accent-rose)\', display: \'flex\', alignItems: \'center\', gap: \'4px\' }}>
          <span>⚠️ {jsonError}</span>
        </div>
      ) : (
        <div style={{ fontSize: \'11.5px\', color: \'var(--accent-emerald)\', display: \'flex\', alignItems: \'center\', gap: \'4px\' }}>
          <CheckIcon size={12} />
          <span>Valid JSON Syntax</span>
        </div>
      )}
    </div>
  );
}
'''

# 13. components/RequestPreview.tsx
files["components/RequestPreview.tsx"] = '''\'use client\';

import React, { useState } from \'react\';
import { ApiRequestConfig, Environment } from \'../lib/api/types\';
import { prepareRequest, generateCurlCommand } from \'../lib/api/request-builder\';
import { CopyIcon, CheckIcon, TerminalIcon, ShieldIcon } from \'./Icons\';

interface RequestPreviewProps {
  config: ApiRequestConfig;
  environment?: Environment | null;
}

export function RequestPreview({ config, environment }: RequestPreviewProps) {
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedFetch, setCopiedFetch] = useState(false);
  const [maskSecrets, setMaskSecrets] = useState(true);

  const prepared = prepareRequest(config, environment);
  const curlCmd = generateCurlCommand(prepared, maskSecrets);

  const fetchCode = `fetch("${prepared.url}", {
  method: "${prepared.method}",
  headers: ${JSON.stringify(maskSecrets ? prepared.maskedHeaders : prepared.headers, null, 4)},
  body: ${prepared.body ? JSON.stringify(prepared.body) : 'undefined'}
});`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCmd);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 1500);
  };

  const handleCopyFetch = () => {
    navigator.clipboard.writeText(fetchCode);
    setCopiedFetch(true);
    setTimeout(() => setCopiedFetch(false), 1500);
  };

  return (
    <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'12px\' }}>
      {/* Top Toggle */}
      <div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'space-between\' }}>
        <div style={{ display: \'flex\', alignItems: \'center\', gap: \'6px\', fontSize: \'13px\', fontWeight: 600, color: \'var(--text-primary)\' }}>
          <TerminalIcon size={15} style={{ color: \'var(--accent-primary)\' }} />
          <span>Compiled Request Preview</span>
        </div>

        <label style={{ display: \'flex\', alignItems: \'center\', gap: \'6px\', cursor: \'pointer\', fontSize: \'12px\', color: \'var(--text-secondary)\' }}>
          <ShieldIcon size={13} style={{ color: maskSecrets ? \'var(--accent-emerald)\' : \'var(--accent-amber)\' }} />
          <input
            type="checkbox"
            checked={maskSecrets}
            onChange={(e) => setMaskSecrets(e.target.checked)}
            style={{ accentColor: \'var(--accent-primary)\' }}
          />
          <span>Mask Sensitive Credentials</span>
        </label>
      </div>

      {/* Target URL & Method */}
      <div className="glass-card" style={{ padding: \'10px 14px\', display: \'flex\', alignItems: \'center\', gap: \'10px\' }}>
        <span className={`forge-badge method-badge-${prepared.method.toLowerCase()}`}>
          {prepared.method}
        </span>
        <span style={{ fontFamily: \'var(--font-mono)\', fontSize: \'12.5px\', color: \'var(--text-primary)\', wordBreak: \'break-all\' }}>
          {prepared.url}
        </span>
      </div>

      {/* cURL Command Box */}
      <div className="glass-card" style={{ padding: \'12px\', display: \'flex\', flexDirection: \'column\', gap: \'8px\' }}>
        <div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'space-between\' }}>
          <span style={{ fontSize: \'12px\', fontWeight: 600, color: \'var(--text-secondary)\' }}>
            cURL Terminal Command
          </span>
          <button
            type="button"
            onClick={handleCopyCurl}
            className="forge-btn forge-btn-ghost"
            style={{ padding: \'3px 8px\', fontSize: \'11.5px\' }}
          >
            {copiedCurl ? <CheckIcon size={13} style={{ color: \'var(--accent-emerald)\' }} /> : <CopyIcon size={13} />}
            <span>{copiedCurl ? \'Copied!\' : \'Copy cURL\'}</span>
          </button>
        </div>

        <pre
          style={{
            background: \'var(--bg-input)\',
            padding: \'10px\',
            borderRadius: \'6px\',
            fontFamily: \'var(--font-mono)\',
            fontSize: \'12px\',
            overflowX: \'auto\',
            color: \'#38bdf8\',
            whiteSpace: \'pre-wrap\',
            wordBreak: \'break-all\'
          }}
        >
          {curlCmd}
        </pre>
      </div>

      {/* Headers Breakdown */}
      <div className="glass-card" style={{ padding: \'12px\', display: \'flex\', flexDirection: \'column\', gap: \'8px\' }}>
        <span style={{ fontSize: \'12px\', fontWeight: 600, color: \'var(--text-secondary)\' }}>
          Compiled Outbound Headers ({Object.keys(prepared.headers).length})
        </span>
        <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'4px\' }}>
          {Object.entries(maskSecrets ? prepared.maskedHeaders : prepared.headers).map(([k, v]) => (
            <div key={k} style={{ display: \'flex\', gap: \'8px\', fontSize: \'12px\', fontFamily: \'var(--font-mono)\' }}>
              <span style={{ color: \'var(--accent-purple)\', fontWeight: 600 }}>{k}:</span>
              <span style={{ color: \'var(--text-primary)\', wordBreak: \'break-all\' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Body Payload */}
      {prepared.body && (
        <div className="glass-card" style={{ padding: \'12px\', display: \'flex\', flexDirection: \'column\', gap: \'8px\' }}>
          <div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'space-between\' }}>
            <span style={{ fontSize: \'12px\', fontWeight: 600, color: \'var(--text-secondary)\' }}>
              Final Request Body Payload
            </span>
            <button
              type="button"
              onClick={handleCopyFetch}
              className="forge-btn forge-btn-ghost"
              style={{ padding: \'3px 8px\', fontSize: \'11.5px\' }}
            >
              {copiedFetch ? <CheckIcon size={13} style={{ color: \'var(--accent-emerald)\' }} /> : <CopyIcon size={13} />}
              <span>Copy JS fetch</span>
            </button>
          </div>

          <pre
            style={{
              background: \'var(--bg-input)\',
              padding: \'10px\',
              borderRadius: \'6px\',
              fontFamily: \'var(--font-mono)\',
              fontSize: \'12px\',
              overflowX: \'auto\',
              color: \'#f8fafc\',
              maxHeight: \'240px\'
            }}
          >
            {prepared.body}
          </pre>
        </div>
      )}
    </div>
  );
}
'''

for path, code in files.items():
    full_path = os.path.join(BASE_DIR, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(code)
    print(f"Generated {path}")

print("Batch 2 completed successfully!")
