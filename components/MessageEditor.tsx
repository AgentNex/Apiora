'use client';

import React from 'react';
import { Message, MessageRole } from '../lib/api/types';
import { PlusIcon, TrashIcon, GripVerticalIcon, SparklesIcon } from './Icons';
import { estimateTokens } from '../lib/api/stream-parser';

interface MessageEditorProps {
  messages: Message[];
  onChangeMessages: (messages: Message[]) => void;
}

const ROLES: MessageRole[] = ['system', 'developer', 'user', 'assistant', 'custom'];

export function MessageEditor({ messages, onChangeMessages }: MessageEditorProps) {
  const handleAddMessage = (role: MessageRole = 'user') => {
    onChangeMessages([
      ...messages,
      {
        id: 'msg_' + Math.random().toString(36).substring(2, 7),
        role,
        content: ''
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

  const handleMoveMessage = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= messages.length) return;
    const clone = [...messages];
    const item = clone.splice(index, 1)[0];
    clone.splice(newIdx, 0, item);
    onChangeMessages(clone);
  };

  const totalTokens = messages.reduce((acc, m) => acc + estimateTokens(m.content), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Header controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Structured Prompt Messages ({messages.length})
          </span>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '2px 8px', borderRadius: '4px' }}>
            ~{totalTokens} est. tokens
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => handleAddMessage('user')}
            className="forge-btn forge-btn-primary"
            style={{ padding: '5px 10px', fontSize: '12px' }}
          >
            <PlusIcon size={13} />
            <span>+ User</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddMessage('assistant')}
            className="forge-btn forge-btn-ghost"
            style={{ padding: '5px 10px', fontSize: '12px', border: '1px solid var(--border-subtle)' }}
          >
            <PlusIcon size={13} />
            <span>+ Assistant</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddMessage('system')}
            className="forge-btn forge-btn-ghost"
            style={{ padding: '5px 10px', fontSize: '12px', border: '1px solid var(--border-subtle)' }}
          >
            <PlusIcon size={13} />
            <span>+ System</span>
          </button>
        </div>
      </div>

      {/* Message List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.length === 0 ? (
          <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No messages yet. Add a System or User message above.
          </div>
        ) : (
          messages.map((msg, idx) => {
            const roleColor =
              msg.role === 'system'
                ? 'var(--accent-purple)'
                : msg.role === 'assistant'
                ? 'var(--accent-emerald)'
                : msg.role === 'developer'
                ? 'var(--accent-cyan)'
                : 'var(--accent-primary)';

            return (
              <div
                key={msg.id}
                className="glass-card"
                style={{
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  borderLeft: `3px solid ${roleColor}`
                }}
              >
                {/* Message Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select
                      value={msg.role}
                      onChange={(e) => handleUpdateMessage(msg.id, 'role', e.target.value)}
                      className="forge-select"
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
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

                    {msg.role === 'custom' && (
                      <input
                        type="text"
                        value={msg.customRole || ''}
                        onChange={(e) => handleUpdateMessage(msg.id, 'customRole', e.target.value)}
                        placeholder="Custom Role Name"
                        className="forge-input forge-input-mono"
                        style={{ padding: '4px 8px', fontSize: '12px', width: '140px' }}
                      />
                    )}
                  </div>

                  {/* Actions (Move, Tokens, Delete) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                      ~{estimateTokens(msg.content)} tokens
                    </span>

                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveMessage(idx, 'up')}
                      className="forge-btn forge-btn-ghost"
                      style={{ padding: '4px 6px', fontSize: '11px' }}
                      title="Move Up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={idx === messages.length - 1}
                      onClick={() => handleMoveMessage(idx, 'down')}
                      className="forge-btn forge-btn-ghost"
                      style={{ padding: '4px 6px', fontSize: '11px' }}
                      title="Move Down"
                    >
                      ▼
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="forge-btn forge-btn-ghost"
                      style={{ padding: '4px 6px', color: 'var(--accent-rose)' }}
                      title="Delete Message"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>

                {/* Message Content Area */}
                <textarea
                  value={msg.content}
                  onChange={(e) => handleUpdateMessage(msg.id, 'content', e.target.value)}
                  placeholder={`Enter ${msg.role} prompt instructions or text...`}
                  rows={Math.min(10, Math.max(3, msg.content.split('\n').length))}
                  className="forge-input forge-input-mono"
                  style={{
                    resize: 'vertical',
                    lineHeight: '1.5',
                    fontSize: '13px'
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
