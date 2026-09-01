'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CopyIcon, CheckIcon, TrashIcon, CodeIcon, SparklesIcon } from './Icons';

interface RawJsonEditorProps {
  value: string;
  onChange: (val: string) => void;
}

export function RawJsonEditor({ value, onChange }: RawJsonEditorProps) {
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!value.trim()) {
      setJsonError(null);
      return;
    }
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON syntax');
    }
  }, [value]);

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (err: any) {
      setJsonError(`Cannot format: ${err.message}`);
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed));
      setJsonError(null);
    } catch (err: any) {
      setJsonError(`Cannot minify: ${err.message}`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Handle Tab key for 2-space indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const val = target.value;
      const nextVal = val.substring(0, start) + '  ' + val.substring(end);
      onChange(nextVal);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      handleFormat();
    }
  };

  const lineCount = value.split('\n').length;
  const byteCount = new Blob([value]).size;

  return (
    <div className="glass-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Editor Action Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
          <CodeIcon size={15} style={{ color: 'var(--accent-cyan)' }} />
          <span>Raw JSON Request Body</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>
            ({lineCount} lines, {byteCount} bytes)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={handleFormat}
            className="forge-btn forge-btn-ghost"
            style={{ padding: '4px 9px', fontSize: '12px', border: '1px solid var(--border-accent)', color: 'var(--accent-cyan)' }}
            title="Auto-Format JSON (Pretty Print) - Shortcut: Ctrl+Shift+F"
          >
            <SparklesIcon size={13} />
            <span>Format JSON</span>
          </button>
          <button
            type="button"
            onClick={handleMinify}
            className="forge-btn forge-btn-ghost"
            style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid var(--border-subtle)' }}
            title="Minify JSON (Remove Whitespace)"
          >
            Minify
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="forge-btn forge-btn-ghost"
            style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid var(--border-subtle)' }}
            title="Copy JSON Payload"
          >
            {copied ? <CheckIcon size={13} style={{ color: 'var(--accent-emerald)' }} /> : <CopyIcon size={13} />}
          </button>
          <button
            type="button"
            onClick={() => onChange('{\n  \n}')}
            className="forge-btn forge-btn-ghost"
            style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--accent-rose)' }}
            title="Clear JSON"
          >
            <TrashIcon size={13} />
          </button>
        </div>
      </div>

      {/* Editor area with line numbering */}
      <div
        style={{
          display: 'flex',
          background: 'var(--bg-input)',
          border: jsonError ? '1px solid var(--accent-rose)' : '1px solid var(--border-subtle)',
          borderRadius: '6px',
          overflow: 'hidden',
          minHeight: '280px'
        }}
      >
        {/* Line Numbers */}
        <div
          style={{
            padding: '10px 8px',
            background: 'rgba(0, 0, 0, 0.35)',
            borderRight: '1px solid var(--border-subtle)',
            color: 'var(--text-faint)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            lineHeight: '1.5',
            textAlign: 'right',
            userSelect: 'none',
            minWidth: '36px'
          }}
        >
          {Array.from({ length: Math.max(lineCount, 1) }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={'{\n  "model": "gpt-4o",\n  "messages": [\n    {"role": "user", "content": "Hello"}\n  ]\n}'}
          className="forge-input-mono"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '12.5px',
            lineHeight: '1.5',
            padding: '10px',
            resize: 'vertical',
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'pre',
            tabSize: 2
          }}
          spellCheck={false}
        />
      </div>

      {/* JSON Syntax feedback */}
      {jsonError ? (
        <div style={{ fontSize: '11.5px', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>⚠️ {jsonError}</span>
        </div>
      ) : (
        <div style={{ fontSize: '11.5px', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckIcon size={12} />
          <span>Valid JSON Syntax</span>
        </div>
      )}
    </div>
  );
}
