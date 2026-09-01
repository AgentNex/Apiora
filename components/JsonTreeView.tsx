'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronRightIcon, CopyIcon, CheckIcon } from './Icons';

interface JsonTreeViewProps {
  data: any;
}

export function JsonTreeView({ data }: JsonTreeViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandAll, setExpandAll] = useState(true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter JSON keys & values..."
          className="forge-input forge-input-mono"
          style={{ maxWidth: '280px', padding: '5px 10px', fontSize: '12px' }}
        />

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setExpandAll(true)}
            className="forge-btn forge-btn-ghost"
            style={{ padding: '4px 8px', fontSize: '11.5px', border: '1px solid var(--border-subtle)' }}
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={() => setExpandAll(false)}
            className="forge-btn forge-btn-ghost"
            style={{ padding: '4px 8px', fontSize: '11.5px', border: '1px solid var(--border-subtle)' }}
          >
            Collapse All
          </button>
        </div>
      </div>

      <div
        className="glass-card"
        style={{
          padding: '12px',
          overflowX: 'auto',
          maxHeight: '520px',
          overflowY: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          lineHeight: '1.6',
          wordBreak: 'break-word'
        }}
      >
        <TreeNode
          label="root"
          value={data}
          isLast={true}
          searchTerm={searchTerm.toLowerCase()}
          defaultExpanded={expandAll}
          level={0}
        />
      </div>
    </div>
  );
}

interface TreeNodeProps {
  label: string;
  value: any;
  isLast: boolean;
  searchTerm: string;
  defaultExpanded: boolean;
  level: number;
}

const ITEMS_PER_PAGE = 50;

function TreeNode({ label, value, isLast, searchTerm, defaultExpanded, level }: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsOpen(defaultExpanded);
  }, [defaultExpanded]);

  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);

  const handleCopyValue = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  if (!isObject) {
    let typeClass = 'json-string';
    let displayVal = `"${String(value)}"`;

    if (typeof value === 'number') {
      typeClass = 'json-number';
      displayVal = String(value);
    } else if (typeof value === 'boolean') {
      typeClass = 'json-boolean';
      displayVal = String(value);
    } else if (value === null) {
      typeClass = 'json-null';
      displayVal = 'null';
    }

    const matches =
      searchTerm &&
      (label.toLowerCase().includes(searchTerm) || String(value).toLowerCase().includes(searchTerm));

    return (
      <div
        style={{
          paddingLeft: `${Math.min(level, 8) * 14}px`,
          background: matches ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
          borderRadius: '3px',
          display: 'flex',
          alignItems: 'baseline',
          gap: '6px',
          flexWrap: 'wrap'
        }}
      >
        <span className="json-key">{label}:</span>
        <span className={typeClass} style={{ wordBreak: 'break-all' }}>{displayVal}</span>
        {!isLast && <span style={{ color: 'var(--text-muted)' }}>,</span>}
      </div>
    );
  }

  const keys = Object.keys(value || {});
  const isEmpty = keys.length === 0;
  const renderedKeys = keys.slice(0, visibleCount);

  return (
    <div style={{ paddingLeft: `${Math.min(level, 8) * 14}px` }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          userSelect: 'none',
          padding: '2px 4px',
          borderRadius: '4px',
          color: 'var(--text-primary)'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        {isOpen ? <ChevronDownIcon size={12} /> : <ChevronRightIcon size={12} />}
        <span className="json-key">{label}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
          {isArray ? `[${keys.length}]` : `{${keys.length}}`}
        </span>

        <button
          type="button"
          onClick={handleCopyValue}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: '4px' }}
          title="Copy node JSON"
        >
          {copied ? <CheckIcon size={11} style={{ color: 'var(--accent-emerald)' }} /> : <CopyIcon size={11} />}
        </button>
      </div>

      {isOpen && !isEmpty && (
        <div>
          {renderedKeys.map((k, idx) => (
            <TreeNode
              key={k}
              label={isArray ? String(idx) : k}
              value={value[k]}
              isLast={idx === keys.length - 1}
              searchTerm={searchTerm}
              defaultExpanded={defaultExpanded}
              level={level + 1}
            />
          ))}

          {keys.length > visibleCount && (
            <div style={{ paddingLeft: `${(level + 1) * 14}px`, margin: '4px 0' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
                }}
                className="forge-btn forge-btn-ghost"
                style={{ padding: '3px 8px', fontSize: '11px', color: 'var(--accent-cyan)' }}
              >
                + Show {Math.min(ITEMS_PER_PAGE, keys.length - visibleCount)} more items ({keys.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
