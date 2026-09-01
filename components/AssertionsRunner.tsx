'use client';

import React, { useState } from 'react';
import { ApiResponseData } from '../lib/api/types';
import { CheckIcon, XIcon, PlusIcon, TrashIcon, SparklesIcon } from './Icons';

export interface AssertionRule {
  id: string;
  type: 'status_code' | 'max_duration' | 'body_contains' | 'is_json';
  value: string;
  enabled: boolean;
}

interface AssertionsRunnerProps {
  response: ApiResponseData | null;
}

export function AssertionsRunner({ response }: AssertionsRunnerProps) {
  const [assertions, setAssertions] = useState<AssertionRule[]>([
    { id: 'a1', type: 'status_code', value: '200', enabled: true },
    { id: 'a2', type: 'max_duration', value: '3000', enabled: true },
    { id: 'a3', type: 'is_json', value: 'true', enabled: true }
  ]);

  const [newType, setNewType] = useState<AssertionRule['type']>('body_contains');
  const [newValue, setNewValue] = useState('');

  const handleAddAssertion = () => {
    if (!newValue.trim() && newType === 'body_contains') return;
    const newRule: AssertionRule = {
      id: `rule_${Date.now()}`,
      type: newType,
      value: newValue || 'true',
      enabled: true
    };
    setAssertions((prev) => [...prev, newRule]);
    setNewValue('');
  };

  const handleRemoveAssertion = (id: string) => {
    setAssertions((prev) => prev.filter((a) => a.id !== id));
  };

  const evaluateRule = (rule: AssertionRule): { passed: boolean; message: string } => {
    if (!response) {
      return { passed: false, message: 'Awaiting response execution' };
    }

    switch (rule.type) {
      case 'status_code': {
        const expected = parseInt(rule.value, 10);
        const passed = response.status === expected;
        return {
          passed,
          message: passed ? `Status is ${response.status}` : `Expected ${expected}, received ${response.status}`
        };
      }

      case 'max_duration': {
        const maxMs = parseInt(rule.value, 10);
        const passed = response.durationMs <= maxMs;
        return {
          passed,
          message: passed
            ? `Duration ${response.durationMs}ms <= ${maxMs}ms`
            : `Duration ${response.durationMs}ms exceeded ${maxMs}ms`
        };
      }

      case 'body_contains': {
        const target = rule.value.toLowerCase();
        const bodyStr = (typeof response.data === 'object' ? JSON.stringify(response.data) : response.rawText || '').toLowerCase();
        const passed = bodyStr.includes(target);
        return {
          passed,
          message: passed ? `Body contains "${rule.value}"` : `Substring "${rule.value}" not found in response`
        };
      }

      case 'is_json': {
        const passed = typeof response.data === 'object' && response.data !== null;
        return {
          passed,
          message: passed ? 'Response is valid structured JSON' : 'Response is not structured JSON'
        };
      }

      default:
        return { passed: true, message: 'OK' };
    }
  };

  return (
    <div className="glass-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
          <SparklesIcon size={14} style={{ color: 'var(--accent-emerald)' }} />
          <span>Response Test Assertions</span>
        </div>

        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
          {assertions.filter((a) => a.enabled).length} Rules Configured
        </div>
      </div>

      {/* Add New Assertion Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value as any)}
          className="forge-select"
          style={{ fontSize: '12px', padding: '4px 8px' }}
        >
          <option value="status_code">Status Code Equals</option>
          <option value="max_duration">Latency Under (ms)</option>
          <option value="body_contains">Body Contains String</option>
          <option value="is_json">Valid JSON Schema</option>
        </select>

        {newType !== 'is_json' && (
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={newType === 'status_code' ? '200' : newType === 'max_duration' ? '2000' : 'keyword'}
            className="forge-input"
            style={{ fontSize: '12px', padding: '4px 8px', width: '130px' }}
          />
        )}

        <button
          type="button"
          onClick={handleAddAssertion}
          className="forge-btn forge-btn-primary"
          style={{ padding: '4px 10px', fontSize: '12px' }}
        >
          <PlusIcon size={12} />
          <span>Add Rule</span>
        </button>
      </div>

      {/* Assertions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {assertions.map((rule) => {
          const evalResult = evaluateRule(rule);
          return (
            <div
              key={rule.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: '6px',
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border-subtle)',
                fontSize: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: !response
                      ? 'rgba(255,255,255,0.08)'
                      : evalResult.passed
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'rgba(244, 63, 94, 0.2)',
                    color: !response
                      ? 'var(--text-muted)'
                      : evalResult.passed
                      ? 'var(--accent-emerald)'
                      : 'var(--accent-rose)'
                  }}
                >
                  {!response ? '•' : evalResult.passed ? <CheckIcon size={12} /> : <XIcon size={12} />}
                </span>

                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {rule.type === 'status_code' && `Status Code = ${rule.value}`}
                  {rule.type === 'max_duration' && `Duration < ${rule.value}ms`}
                  {rule.type === 'body_contains' && `Contains "${rule.value}"`}
                  {rule.type === 'is_json' && 'Valid JSON Body'}
                </span>

                <span style={{ color: 'var(--text-muted)', fontSize: '11px', marginLeft: '6px' }}>
                  ({evalResult.message})
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveAssertion(rule.id)}
                className="forge-btn forge-btn-ghost"
                style={{ padding: '2px 6px', color: 'var(--accent-rose)' }}
                title="Remove assertion rule"
              >
                <TrashIcon size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
