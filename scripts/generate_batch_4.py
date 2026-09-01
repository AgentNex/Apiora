import os

BASE_DIR = "/data/data/com.termux/files/home/api-forge-ai"

files = {}

# 18. components/RequestHistory.tsx
files["components/RequestHistory.tsx"] = '''\'use client\';

import React, { useState } from \'react\';
import { RequestHistoryItem } from \'../lib/api/types\';
import { TrashIcon, HistoryIcon, PlayIcon, CopyIcon, CheckIcon } from \'./Icons\';

interface RequestHistoryProps {
  historyItems: RequestHistoryItem[];
  onSelectHistoryItem: (item: RequestHistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
}

export function RequestHistory({
  historyItems,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  onClearHistory
}: RequestHistoryProps) {
  const [searchTerm, setSearchTerm] = useState(\'\');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = historyItems.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.endpoint.toLowerCase().includes(term) ||
      item.method.toLowerCase().includes(term) ||
      item.modelId.toLowerCase().includes(term) ||
      String(item.status).includes(term)
    );
  });

  const handleCopyEndpoint = (e: React.MouseEvent, id: string, endpoint: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(endpoint);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1200);
  };

  const handleExportHistory = () => {
    const blob = new Blob([JSON.stringify(historyItems, null, 2)], { type: \'application/json\' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement(\'a\');
    a.href = url;
    a.download = `api_forge_history_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: \'20px\',
        display: \'flex\',
        flexDirection: \'column\',
        gap: \'16px\',
        height: \'100%\',
        overflowY: \'auto\'
      }}
    >
      {/* Header */}
      <div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'space-between\', flexWrap: \'wrap\', gap: \'10px\' }}>
        <div style={{ display: \'flex\', alignItems: \'center\', gap: \'8px\' }}>
          <HistoryIcon size={20} style={{ color: \'var(--accent-primary)\' }} />
          <div>
            <h2 style={{ fontSize: \'16px\', fontWeight: 700, color: \'var(--text-primary)\' }}>
              Execution History
            </h2>
            <div style={{ fontSize: \'12px\', color: \'var(--text-muted)\' }}>
              {historyItems.length} total requests stored locally in IndexedDB (API keys stripped for security).
            </div>
          </div>
        </div>

        <div style={{ display: \'flex\', gap: \'8px\' }}>
          <button
            type="button"
            onClick={handleExportHistory}
            disabled={historyItems.length === 0}
            className="forge-btn forge-btn-ghost"
            style={{ padding: \'6px 12px\', fontSize: \'12px\', border: \'1px solid var(--border-subtle)\' }}
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(\'Are you sure you want to clear all history records?\')) {
                onClearHistory();
              }
            }}
            disabled={historyItems.length === 0}
            className="forge-btn forge-btn-danger"
            style={{ padding: \'6px 12px\', fontSize: \'12px\' }}
          >
            <TrashIcon size={14} />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Search filter */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Filter by URL, method, model, or status code..."
        className="forge-input forge-input-mono"
        style={{ padding: \'9px 12px\' }}
      />

      {/* History Items List */}
      <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'8px\' }}>
        {filteredItems.length === 0 ? (
          <div className="glass-card" style={{ padding: \'32px\', textAlign: \'center\', color: \'var(--text-muted)\' }}>
            {historyItems.length === 0
              ? \'No request history recorded yet. Send your first API request to see it here.\'
              : \'No history matches your search filter.\'}
          </div>
        ) : (
          filteredItems.map((item) => {
            const isSuccess = item.status >= 200 && item.status < 300;
            const isClientError = item.status >= 400 && item.status < 500;
            const statusColor = isSuccess
              ? \'var(--accent-emerald)\'
              : isClientError
              ? \'var(--accent-amber)\'
              : \'var(--accent-rose)\';

            return (
              <div
                key={item.id}
                onClick={() => onSelectHistoryItem(item)}
                className="glass-card"
                style={{
                  padding: \'12px 14px\',
                  display: \'flex\',
                  alignItems: \'center\',
                  justifyContent: \'space-between\',
                  gap: \'12px\',
                  cursor: \'pointer\',
                  transition: \'all 0.15s ease\'
                }}
              >
                <div style={{ display: \'flex\', alignItems: \'center\', gap: \'10px\', flex: 1, minWidth: 0 }}>
                  <span className={`forge-badge method-badge-${item.method.toLowerCase()}`}>
                    {item.method}
                  </span>

                  <span
                    style={{
                      fontSize: \'12px\',
                      fontWeight: 700,
                      color: statusColor,
                      fontFamily: \'var(--font-mono)\',
                      minWidth: \'32px\'
                    }}
                  >
                    {item.status || \'ERR\'}
                  </span>

                  <div style={{ display: \'flex\', flexDirection: \'column\', minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        fontSize: \'13px\',
                        color: \'var(--text-primary)\',
                        fontFamily: \'var(--font-mono)\',
                        overflow: \'hidden\',
                        textOverflow: \'ellipsis\',
                        whiteSpace: \'nowrap\'
                      }}
                    >
                      {item.endpoint}
                    </span>
                    <div style={{ display: \'flex\', gap: \'12px\', fontSize: \'11px\', color: \'var(--text-muted)\', marginTop: \'2px\' }}>
                      <span>Model: <strong style={{ color: \'var(--accent-cyan)\' }}>{item.modelId || \'generic\'}</strong></span>
                      <span>Latency: {item.durationMs}ms</span>
                      <span>Size: {(item.sizeBytes / 1024).toFixed(1)} KB</span>
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: \'flex\', alignItems: \'center\', gap: \'6px\' }}>
                  <button
                    type="button"
                    onClick={(e) => handleCopyEndpoint(e, item.id, item.endpoint)}
                    className="forge-btn forge-btn-ghost"
                    style={{ padding: \'6px\' }}
                    title="Copy Endpoint URL"
                  >
                    {copiedId === item.id ? <CheckIcon size={14} style={{ color: \'var(--accent-emerald)\' }} /> : <CopyIcon size={14} />}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHistoryItem(item.id);
                    }}
                    className="forge-btn forge-btn-ghost"
                    style={{ padding: \'6px\', color: \'var(--accent-rose)\' }}
                    title="Delete Record"
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
'''

# 19. components/SavedRequests.tsx
files["components/SavedRequests.tsx"] = '''\'use client\';

import React, { useState } from \'react\';
import { ApiRequestConfig, SavedRequest } from \'../lib/api/types\';
import { BookmarkIcon, PlusIcon, TrashIcon, PlayIcon, LayersIcon } from \'./Icons\';

interface SavedRequestsProps {
  savedRequests: SavedRequest[];
  onSelectSavedRequest: (saved: SavedRequest) => void;
  onSaveCurrentRequest: (name: string, collection: string) => void;
  onDeleteSavedRequest: (id: string) => void;
  currentConfig: ApiRequestConfig;
}

export function SavedRequests({
  savedRequests,
  onSelectSavedRequest,
  onSaveCurrentRequest,
  onDeleteSavedRequest,
  currentConfig
}: SavedRequestsProps) {
  const [isSavingModalOpen, setIsSavingModalOpen] = useState(false);
  const [requestName, setRequestName] = useState(\'\');
  const [collectionName, setCollectionName] = useState(\'General\');
  const [selectedCollection, setSelectedCollection] = useState<string>(\'all\');

  const collections = Array.from(new Set(savedRequests.map((s) => s.collection || \'General\')));

  const filteredRequests =
    selectedCollection === \'all\'
      ? savedRequests
      : savedRequests.filter((s) => (s.collection || \'General\') === selectedCollection);

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestName.trim()) return;
    onSaveCurrentRequest(requestName.trim(), collectionName.trim() || \'General\');
    setRequestName(\'\');
    setIsSavingModalOpen(false);
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: \'20px\',
        display: \'flex\',
        flexDirection: \'column\',
        gap: \'16px\',
        height: \'100%\',
        overflowY: \'auto\'
      }}
    >
      {/* Header */}
      <div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'space-between\', flexWrap: \'wrap\', gap: \'10px\' }}>
        <div style={{ display: \'flex\', alignItems: \'center\', gap: \'8px\' }}>
          <BookmarkIcon size={20} style={{ color: \'var(--accent-primary)\' }} />
          <div>
            <h2 style={{ fontSize: \'16px\', fontWeight: 700, color: \'var(--text-primary)\' }}>
              Saved Request Collections
            </h2>
            <div style={{ fontSize: \'12px\', color: \'var(--text-muted)\' }}>
              Organize, template, and reuse custom AI prompts and configurations.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setRequestName(currentConfig.modelId ? `${currentConfig.modelId} Test` : \'New Request Template\');
            setIsSavingModalOpen(true);
          }}
          className="forge-btn forge-btn-primary"
          style={{ padding: \'7px 14px\', fontSize: \'12.5px\' }}
        >
          <PlusIcon size={14} />
          <span>Save Current Request</span>
        </button>
      </div>

      {/* Collection Filter Tabs */}
      {collections.length > 0 && (
        <div style={{ display: \'flex\', gap: \'6px\', flexWrap: \'wrap\' }}>
          <button
            type="button"
            onClick={() => setSelectedCollection(\'all\')}
            className={`forge-btn ${selectedCollection === \'all\' ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
            style={{ padding: \'4px 10px\', fontSize: \'12px\' }}
          >
            All ({savedRequests.length})
          </button>
          {collections.map((col) => (
            <button
              key={col}
              type="button"
              onClick={() => setSelectedCollection(col)}
              className={`forge-btn ${selectedCollection === col ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
              style={{ padding: \'4px 10px\', fontSize: \'12px\' }}
            >
              {col}
            </button>
          ))}
        </div>
      )}

      {/* Requests Grid */}
      <div style={{ display: \'grid\', gridTemplateColumns: \'repeat(auto-fill, minmax(280px, 1fr))\', gap: \'12px\' }}>
        {filteredRequests.length === 0 ? (
          <div className="glass-card" style={{ padding: \'32px\', textAlign: \'center\', color: \'var(--text-muted)\', gridColumn: \'1 / -1\' }}>
            No saved requests yet in this collection.
          </div>
        ) : (
          filteredRequests.map((saved) => (
            <div
              key={saved.id}
              className="glass-card"
              style={{
                padding: \'14px\',
                display: \'flex\',
                flexDirection: \'column\',
                justifyContent: \'space-between\',
                gap: \'10px\',
                cursor: \'pointer\'
              }}
              onClick={() => onSelectSavedRequest(saved)}
            >
              <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'6px\' }}>
                <div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'space-between\' }}>
                  <span style={{ fontSize: \'14px\', fontWeight: 600, color: \'var(--text-primary)\' }}>
                    {saved.name}
                  </span>
                  <span className="forge-badge" style={{ background: \'rgba(99, 102, 241, 0.15)\', color: \'var(--accent-primary)\' }}>
                    {saved.collection}
                  </span>
                </div>

                <div style={{ display: \'flex\', alignItems: \'center\', gap: \'6px\' }}>
                  <span className={`forge-badge method-badge-${saved.config.method.toLowerCase()}`}>
                    {saved.config.method}
                  </span>
                  <span style={{ fontSize: \'11.5px\', color: \'var(--accent-cyan)\', fontFamily: \'var(--font-mono)\' }}>
                    {saved.config.modelId || \'generic\'}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: \'12px\',
                    color: \'var(--text-muted)\',
                    fontFamily: \'var(--font-mono)\',
                    overflow: \'hidden\',
                    textOverflow: \'ellipsis\',
                    whiteSpace: \'nowrap\'
                  }}
                >
                  {saved.config.endpoint}
                </div>
              </div>

              <div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'space-between\', borderTop: \'1px solid var(--border-subtle)\', paddingTop: \'8px\' }}>
                <span style={{ fontSize: \'11px\', color: \'var(--text-muted)\' }}>
                  {new Date(saved.updatedAt).toLocaleDateString()}
                </span>

                <div style={{ display: \'flex\', gap: \'6px\' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete saved request "${saved.name}"?`)) {
                        onDeleteSavedRequest(saved.id);
                      }
                    }}
                    className="forge-btn forge-btn-ghost"
                    style={{ padding: \'4px 6px\', color: \'var(--accent-rose)\' }}
                    title="Delete Saved Request"
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Save Modal */}
      {isSavingModalOpen && (
        <div
          style={{
            position: \'fixed\',
            inset: 0,
            background: \'rgba(0, 0, 0, 0.7)\',
            backdropFilter: \'blur(4px)\',
            display: \'flex\',
            alignItems: \'center\',
            justifyContent: \'center\',
            zIndex: 100,
            padding: \'16px\'
          }}
        >
          <form
            onSubmit={handleSaveSubmit}
            className="glass-panel"
            style={{
              width: \'100%\',
              maxWidth: \'420px\',
              padding: \'20px\',
              display: \'flex\',
              flexDirection: \'column\',
              gap: \'14px\',
              boxShadow: \'0 20px 50px rgba(0,0,0,0.5)\'
            }}
          >
            <h3 style={{ fontSize: \'16px\', fontWeight: 700, color: \'var(--text-primary)\' }}>
              Save Request to Collection
            </h3>

            <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'6px\' }}>
              <label style={{ fontSize: \'12px\', color: \'var(--text-secondary)\' }}>Request Name</label>
              <input
                type="text"
                required
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
                placeholder="e.g. Gemini 1.5 Pro Coding Benchmark"
                className="forge-input"
                autoFocus
              />
            </div>

            <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'6px\' }}>
              <label style={{ fontSize: \'12px\', color: \'var(--text-secondary)\' }}>Collection / Folder</label>
              <input
                type="text"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder="e.g. Chatbots, Embeddings, Production"
                className="forge-input"
              />
            </div>

            <div style={{ fontSize: \'11.5px\', color: \'var(--text-muted)\', lineHeight: \'1.4\' }}>
              Note: API keys are not saved by default to protect credentials.
            </div>

            <div style={{ display: \'flex\', justifyContent: \'flex-end\', gap: \'8px\', marginTop: \'6px\' }}>
              <button
                type="button"
                onClick={() => setIsSavingModalOpen(false)}
                className="forge-btn forge-btn-ghost"
              >
                Cancel
              </button>
              <button type="submit" className="forge-btn forge-btn-primary">
                Save Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
'''

# 20. components/EnvironmentManager.tsx
files["components/EnvironmentManager.tsx"] = '''\'use client\';

import React, { useState } from \'react\';
import { Environment, EnvironmentVariable } from \'../lib/api/types\';
import { ShieldIcon, PlusIcon, TrashIcon, KeyIcon } from \'./Icons\';

interface EnvironmentManagerProps {
  environments: Environment[];
  activeEnvironmentId: string;
  onSelectEnvironment: (id: string) => void;
  onSaveEnvironments: (environments: Environment[]) => void;
}

export function EnvironmentManager({
  environments,
  activeEnvironmentId,
  onSelectEnvironment,
  onSaveEnvironments
}: EnvironmentManagerProps) {
  const [selectedEnvId, setSelectedEnvId] = useState<string>(activeEnvironmentId);
  const currentEnv = environments.find((e) => e.id === selectedEnvId) || environments[0];

  const handleAddEnv = () => {
    const name = prompt(\'Enter new environment name (e.g. Staging, Production, Local):\');
    if (!name || !name.trim()) return;

    const newEnv: Environment = {
      id: 'env_' + Math.random().toString(36).substring(2, 7),
      name: name.trim(),
      variables: [
        { id: 'v1', key: 'BASE_URL', value: 'https://api.openai.com/v1', isSecret: false, enabled: true },
        { id: 'v2', key: 'API_KEY', value: '', isSecret: true, enabled: true },
        { id: 'v3', key: 'MODEL_ID', value: 'gpt-4o', isSecret: false, enabled: true }
      ]
    };

    const updated = [...environments, newEnv];
    onSaveEnvironments(updated);
    setSelectedEnvId(newEnv.id);
  };

  const handleDeleteEnv = (id: string) => {
    if (environments.length <= 1) {
      alert(\'You must maintain at least one environment.\');
      return;
    }
    if (!confirm(\'Are you sure you want to delete this environment?\')) return;

    const updated = environments.filter((e) => e.id !== id);
    onSaveEnvironments(updated);
    if (selectedEnvId === id) {
      setSelectedEnvId(updated[0].id);
    }
  };

  const handleAddVariable = () => {
    if (!currentEnv) return;
    const newVar: EnvironmentVariable = {
      id: 'v_' + Math.random().toString(36).substring(2, 7),
      key: '',
      value: '',
      isSecret: false,
      enabled: true
    };

    const updatedEnvs = environments.map((e) =>
      e.id === currentEnv.id ? { ...e, variables: [...e.variables, newVar] } : e
    );
    onSaveEnvironments(updatedEnvs);
  };

  const handleUpdateVariable = (varId: string, field: keyof EnvironmentVariable, val: any) => {
    if (!currentEnv) return;
    const updatedEnvs = environments.map((e) => {
      if (e.id !== currentEnv.id) return e;
      return {
        ...e,
        variables: e.variables.map((v) => (v.id === varId ? { ...v, [field]: val } : v))
      };
    });
    onSaveEnvironments(updatedEnvs);
  };

  const handleDeleteVariable = (varId: string) => {
    if (!currentEnv) return;
    const updatedEnvs = environments.map((e) => {
      if (e.id !== currentEnv.id) return e;
      return {
        ...e,
        variables: e.variables.filter((v) => v.id !== varId)
      };
    });
    onSaveEnvironments(updatedEnvs);
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: \'20px\',
        display: \'flex\',
        flexDirection: \'column\',
        gap: \'16px\',
        height: \'100%\',
        overflowY: \'auto\'
      }}
    >
      {/* Header */}
      <div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'space-between\', flexWrap: \'wrap\', gap: \'10px\' }}>
        <div style={{ display: \'flex\', alignItems: \'center\', gap: \'8px\' }}>
          <ShieldIcon size={20} style={{ color: \'var(--accent-cyan)\' }} />
          <div>
            <h2 style={{ fontSize: \'16px\', fontWeight: 700, color: \'var(--text-primary)\' }}>
              Environment Variables
            </h2>
            <div style={{ fontSize: \'12px\', color: \'var(--text-muted)\' }}>
              Reference variables dynamically anywhere via <code style={{ color: \'var(--accent-primary)\' }}>&#123;&#123;VARIABLE_NAME&#125;&#125;</code> syntax.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddEnv}
          className="forge-btn forge-btn-ghost"
          style={{ padding: \'6px 12px\', fontSize: \'12px\', border: \'1px solid var(--border-subtle)\' }}
        >
          <PlusIcon size={14} />
          <span>New Environment</span>
        </button>
      </div>

      {/* Environment Selector Pills */}
      <div style={{ display: \'flex\', gap: \'6px\', flexWrap: \'wrap\' }}>
        {environments.map((env) => {
          const isSelected = env.id === selectedEnvId;
          const isActive = env.id === activeEnvironmentId;

          return (
            <div
              key={env.id}
              onClick={() => setSelectedEnvId(env.id)}
              style={{
                padding: \'6px 12px\',
                borderRadius: \'6px\',
                background: isSelected ? \'var(--bg-card-hover)\' : \'var(--bg-input)\',
                border: isSelected ? \'1px solid var(--accent-primary)\' : \'1px solid var(--border-subtle)\',
                cursor: \'pointer\',
                display: \'flex\',
                alignItems: \'center\',
                gap: \'8px\'
              }}
            >
              <span style={{ fontSize: \'13px\', fontWeight: 600, color: isSelected ? \'var(--text-primary)\' : \'var(--text-secondary)\' }}>
                {env.name}
              </span>
              {isActive && (
                <span
                  style={{
                    fontSize: \'10px\',
                    background: \'var(--accent-emerald)\',
                    color: \'#ffffff\',
                    padding: \'1px 5px\',
                    borderRadius: \'3px\',
                    fontWeight: 700
                  }}
                >
                  ACTIVE
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Current Environment Editor */}
      {currentEnv && (
        <div className="glass-card" style={{ padding: \'16px\', display: \'flex\', flexDirection: \'column\', gap: \'14px\' }}>
          <div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'space-between\' }}>
            <div style={{ display: \'flex\', alignItems: \'center\', gap: \'8px\' }}>
              <span style={{ fontSize: \'14px\', fontWeight: 700, color: \'var(--text-primary)\' }}>
                {currentEnv.name} Variables
              </span>
              {currentEnv.id !== activeEnvironmentId && (
                <button
                  type="button"
                  onClick={() => onSelectEnvironment(currentEnv.id)}
                  className="forge-btn forge-btn-primary"
                  style={{ padding: \'3px 8px\', fontSize: \'11.5px\' }}
                >
                  Set as Active
                </button>
              )}
            </div>

            <div style={{ display: \'flex\', gap: \'6px\' }}>
              <button
                type="button"
                onClick={handleAddVariable}
                className="forge-btn forge-btn-ghost"
                style={{ padding: \'5px 10px\', fontSize: \'12px\', border: \'1px solid var(--border-subtle)\' }}
              >
                <PlusIcon size={13} />
                <span>Add Variable</span>
              </button>

              <button
                type="button"
                onClick={() => handleDeleteEnv(currentEnv.id)}
                className="forge-btn forge-btn-ghost"
                style={{ padding: \'5px 8px\', color: \'var(--accent-rose)\' }}
                title="Delete Environment"
              >
                <TrashIcon size={14} />
              </button>
            </div>
          </div>

          {/* Variables Table */}
          <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'8px\' }}>
            <div style={{ display: \'grid\', gridTemplateColumns: \'28px 1fr 1.5fr 80px 36px\', gap: \'8px\', fontSize: \'11px\', fontWeight: 700, color: \'var(--text-muted)\', textTransform: \'uppercase\' }}>
              <span>On</span>
              <span>Variable Key</span>
              <span>Value</span>
              <span>Secret</span>
              <span>Del</span>
            </div>

            {currentEnv.variables.map((v) => (
              <div
                key={v.id}
                style={{
                  display: \'grid\',
                  gridTemplateColumns: \'28px 1fr 1.5fr 80px 36px\',
                  gap: \'8px\',
                  alignItems: \'center\'
                }}
              >
                <input
                  type="checkbox"
                  checked={v.enabled}
                  onChange={(e) => handleUpdateVariable(v.id, \'enabled\', e.target.checked)}
                  style={{ accentColor: \'var(--accent-primary)\', cursor: \'pointer\' }}
                />

                <input
                  type="text"
                  value={v.key}
                  onChange={(e) => handleUpdateVariable(v.id, \'key\', e.target.value)}
                  placeholder="KEY_NAME"
                  className="forge-input forge-input-mono"
                  style={{ padding: \'6px 8px\', fontSize: \'12px\' }}
                />

                <input
                  type={v.isSecret ? \'password\' : \'text\'}
                  value={v.value}
                  onChange={(e) => handleUpdateVariable(v.id, \'value\', e.target.value)}
                  placeholder="Value"
                  className="forge-input forge-input-mono"
                  style={{ padding: \'6px 8px\', fontSize: \'12px\' }}
                />

                <label style={{ display: \'flex\', alignItems: \'center\', gap: \'4px\', fontSize: \'11px\', color: \'var(--text-secondary)\', cursor: \'pointer\' }}>
                  <input
                    type="checkbox"
                    checked={v.isSecret}
                    onChange={(e) => handleUpdateVariable(v.id, \'isSecret\', e.target.checked)}
                    style={{ accentColor: \'var(--accent-primary)\' }}
                  />
                  <span>Mask</span>
                </label>

                <button
                  type="button"
                  onClick={() => handleDeleteVariable(v.id)}
                  className="forge-btn forge-btn-ghost"
                  style={{ color: \'var(--accent-rose)\', padding: \'6px\' }}
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
'''

# 21. components/SettingsModal.tsx
files["components/SettingsModal.tsx"] = '''\'use client\';

import React from \'react\';
import { SettingsIcon, XIcon, ShieldIcon, ActivityIcon, SunIcon, MoonIcon } from \'./Icons\';
import { AnimationLevel } from \'../lib/api/types\';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: \'dark\' | \'light\';
  onChangeTheme: (theme: \'dark\' | \'light\') => void;
  timeoutSeconds: number;
  onChangeTimeoutSeconds: (timeout: number) => void;
  rememberApiKeys: boolean;
  onChangeRememberApiKeys: (remember: boolean) => void;
  animationMode: \'auto\' | \'full\' | \'reduced\' | \'disabled\';
  onChangeAnimationMode: (mode: \'auto\' | \'full\' | \'reduced\' | \'disabled\') => void;
  onClearAllData: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  theme,
  onChangeTheme,
  timeoutSeconds,
  onChangeTimeoutSeconds,
  rememberApiKeys,
  onChangeRememberApiKeys,
  animationMode,
  onChangeAnimationMode,
  onClearAllData
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: \'fixed\',
        inset: 0,
        background: \'rgba(0, 0, 0, 0.75)\',
        backdropFilter: \'blur(6px)\',
        display: \'flex\',
        alignItems: \'center\',
        justifyContent: \'center\',
        zIndex: 100,
        padding: \'16px\'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: \'100%\',
          maxWidth: \'480px\',
          padding: \'24px\',
          display: \'flex\',
          flexDirection: \'column\',
          gap: \'18px\',
          boxShadow: \'0 24px 64px rgba(0, 0, 0, 0.5)\',
          maxHeight: \'90vh\',
          overflowY: \'auto\'
        }}
      >
        {/* Header */}
        <div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'space-between\' }}>
          <div style={{ display: \'flex\', alignItems: \'center\', gap: \'8px\' }}>
            <SettingsIcon size={18} style={{ color: \'var(--accent-primary)\' }} />
            <h3 style={{ fontSize: \'16px\', fontWeight: 700, color: \'var(--text-primary)\' }}>
              Application Settings
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="forge-btn forge-btn-ghost"
            style={{ padding: \'4px\' }}
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* 1. Theme Setting */}
        <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'8px\' }}>
          <label style={{ fontSize: \'13px\', fontWeight: 600, color: \'var(--text-primary)\' }}>
            Interface Theme
          </label>
          <div style={{ display: \'grid\', gridTemplateColumns: \'1fr 1fr\', gap: \'8px\' }}>
            <button
              type="button"
              onClick={() => onChangeTheme(\'dark\')}
              className={`forge-btn ${theme === \'dark\' ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
              style={{ padding: \'8px\', border: \'1px solid var(--border-subtle)\' }}
            >
              <MoonIcon size={14} />
              <span>Obsidian Dark</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeTheme(\'light\')}
              className={`forge-btn ${theme === \'light\' ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
              style={{ padding: \'8px\', border: \'1px solid var(--border-subtle)\' }}
            >
              <SunIcon size={14} />
              <span>Clean Light</span>
            </button>
          </div>
        </div>

        {/* 2. Timeout Setting */}
        <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'6px\' }}>
          <div style={{ display: \'flex\', justifyContent: \'space-between\', fontSize: \'13px\' }}>
            <span style={{ fontWeight: 600, color: \'var(--text-primary)\' }}>Request Timeout</span>
            <span style={{ fontFamily: \'var(--font-mono)\', color: \'var(--accent-cyan)\' }}>{timeoutSeconds}s</span>
          </div>
          <input
            type="range"
            min="10"
            max="300"
            step="5"
            value={timeoutSeconds}
            onChange={(e) => onChangeTimeoutSeconds(parseInt(e.target.value))}
            style={{ accentColor: \'var(--accent-primary)\', cursor: \'pointer\' }}
          />
          <span style={{ fontSize: \'11.5px\', color: \'var(--text-muted)\' }}>
            Applies to outbound proxy calls before triggering 504 Gateway Timeout.
          </span>
        </div>

        {/* 3. Ambient Animation & Device Performance */}
        <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'8px\' }}>
          <label style={{ fontSize: \'13px\', fontWeight: 600, color: \'var(--text-primary)\' }}>
            Ambient Background & Motion
          </label>
          <select
            value={animationMode}
            onChange={(e) => onChangeAnimationMode(e.target.value as any)}
            className="forge-select"
          >
            <option value="auto">Auto (Detect device RAM & hardware)</option>
            <option value="full">Full Motion (60 FPS CSS)</option>
            <option value="reduced">Reduced / Low Power Mode</option>
            <option value="disabled">Disabled (Static canvas)</option>
          </select>
        </div>

        {/* 4. Local API Key Persistence Disclaimer */}
        <div className="glass-card" style={{ padding: \'12px\', display: \'flex\', flexDirection: \'column\', gap: \'8px\' }}>
          <div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'space-between\' }}>
            <div style={{ display: \'flex\', alignItems: \'center\', gap: \'6px\', fontSize: \'13px\', fontWeight: 600, color: \'var(--text-primary)\' }}>
              <ShieldIcon size={14} style={{ color: \'var(--accent-amber)\' }} />
              <span>Remember API Keys Locally</span>
            </div>
            <input
              type="checkbox"
              checked={rememberApiKeys}
              onChange={(e) => onChangeRememberApiKeys(e.target.checked)}
              style={{ accentColor: \'var(--accent-primary)\', width: \'16px\', height: \'16px\', cursor: \'pointer\' }}
            />
          </div>
          <div style={{ fontSize: \'11.5px\', color: \'var(--text-muted)\', lineHeight: \'1.4\' }}>
            When disabled (default), API keys exist strictly in active memory. If enabled, keys are stored in encrypted browser storage on this device.
          </div>
        </div>

        {/* 5. Clear Storage */}
        <div style={{ borderTop: \'1px solid var(--border-subtle)\', paddingTop: \'12px\', display: \'flex\', justifyContent: \'space-between\', alignItems: \'center\' }}>
          <div style={{ fontSize: \'12px\', color: \'var(--text-muted)\' }}>
            Reset all database caches
          </div>
          <button
            type="button"
            onClick={() => {
              if (confirm(\'Reset all local IndexedDB history and environments?\')) {
                onClearAllData();
              }
            }}
            className="forge-btn forge-btn-danger"
            style={{ padding: \'5px 10px\', fontSize: \'12px\' }}
          >
            Reset Database
          </button>
        </div>
      </div>
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

print("Batch 4 completed successfully!")
