'use client';

import React, { useState } from 'react';
import { Environment, EnvironmentVariable } from '../lib/api/types';
import { ShieldIcon, PlusIcon, TrashIcon, KeyIcon } from './Icons';

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
    const name = prompt('Enter new environment name (e.g. Staging, Production, Local):');
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
      alert('You must maintain at least one environment.');
      return;
    }
    if (!confirm('Are you sure you want to delete this environment?')) return;

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
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '100%',
        overflowY: 'auto'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldIcon size={20} style={{ color: 'var(--accent-cyan)' }} />
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Environment Variables
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Reference variables dynamically anywhere via <code style={{ color: 'var(--accent-primary)' }}>&#123;&#123;VARIABLE_NAME&#125;&#125;</code> syntax.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddEnv}
          className="forge-btn forge-btn-ghost"
          style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid var(--border-subtle)' }}
        >
          <PlusIcon size={14} />
          <span>New Environment</span>
        </button>
      </div>

      {/* Environment Selector Pills */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {environments.map((env) => {
          const isSelected = env.id === selectedEnvId;
          const isActive = env.id === activeEnvironmentId;

          return (
            <div
              key={env.id}
              onClick={() => setSelectedEnvId(env.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-input)',
                border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {env.name}
              </span>
              {isActive && (
                <span
                  style={{
                    fontSize: '10px',
                    background: 'var(--accent-emerald)',
                    color: '#ffffff',
                    padding: '1px 5px',
                    borderRadius: '3px',
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
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {currentEnv.name} Variables
              </span>
              {currentEnv.id !== activeEnvironmentId && (
                <button
                  type="button"
                  onClick={() => onSelectEnvironment(currentEnv.id)}
                  className="forge-btn forge-btn-primary"
                  style={{ padding: '3px 8px', fontSize: '11.5px' }}
                >
                  Set as Active
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={handleAddVariable}
                className="forge-btn forge-btn-ghost"
                style={{ padding: '5px 10px', fontSize: '12px', border: '1px solid var(--border-subtle)' }}
              >
                <PlusIcon size={13} />
                <span>Add Variable</span>
              </button>

              <button
                type="button"
                onClick={() => handleDeleteEnv(currentEnv.id)}
                className="forge-btn forge-btn-ghost"
                style={{ padding: '5px 8px', color: 'var(--accent-rose)' }}
                title="Delete Environment"
              >
                <TrashIcon size={14} />
              </button>
            </div>
          </div>

          {/* Variables Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1.5fr 80px 36px', gap: '8px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
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
                  display: 'grid',
                  gridTemplateColumns: '28px 1fr 1.5fr 80px 36px',
                  gap: '8px',
                  alignItems: 'center'
                }}
              >
                <input
                  type="checkbox"
                  checked={v.enabled}
                  onChange={(e) => handleUpdateVariable(v.id, 'enabled', e.target.checked)}
                  style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />

                <input
                  type="text"
                  value={v.key}
                  onChange={(e) => handleUpdateVariable(v.id, 'key', e.target.value)}
                  placeholder="KEY_NAME"
                  className="forge-input forge-input-mono"
                  style={{ padding: '6px 8px', fontSize: '12px' }}
                />

                <input
                  type={v.isSecret ? 'password' : 'text'}
                  value={v.value}
                  onChange={(e) => handleUpdateVariable(v.id, 'value', e.target.value)}
                  placeholder="Value"
                  className="forge-input forge-input-mono"
                  style={{ padding: '6px 8px', fontSize: '12px' }}
                />

                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={v.isSecret}
                    onChange={(e) => handleUpdateVariable(v.id, 'isSecret', e.target.checked)}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <span>Mask</span>
                </label>

                <button
                  type="button"
                  onClick={() => handleDeleteVariable(v.id)}
                  className="forge-btn forge-btn-ghost"
                  style={{ color: 'var(--accent-rose)', padding: '6px' }}
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
