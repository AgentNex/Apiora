import os

BASE_DIR = "/data/data/com.termux/files/home/api-forge-ai"

files = {}

# 14. components/JsonTreeView.tsx
files["components/JsonTreeView.tsx"] = '''\'use client\';

import React, { useState } from \'react\';
import { ChevronDownIcon, ChevronRightIcon, CopyIcon, CheckIcon } from \'./Icons\';

interface JsonTreeViewProps {
  data: any;
}

export function JsonTreeView({ data }: JsonTreeViewProps) {
  const [searchTerm, setSearchTerm] = useState(\'\');
  const [expandAll, setExpandAll] = useState(true);

  return (
    <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'8px\' }}>
      <div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'space-between\', gap: \'8px\', flexWrap: \'wrap\' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter JSON keys & values..."
          className="forge-input forge-input-mono"
          style={{ maxWidth: \'280px\', padding: \'5px 10px\', fontSize: \'12px\' }}
        />

        <div style={{ display: \'flex\', gap: \'6px\' }}>
          <button
            type="button"
            onClick={() => setExpandAll(true)}
            className="forge-btn forge-btn-ghost"
            style={{ padding: \'4px 8px\', fontSize: \'11.5px\', border: \'1px solid var(--border-subtle)\' }}
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={() => setExpandAll(false)}
            className="forge-btn forge-btn-ghost"
            style={{ padding: \'4px 8px\', fontSize: \'11.5px\', border: \'1px solid var(--border-subtle)\' }}
          >
            Collapse All
          </button>
        </div>
      </div>

      <div
        className="glass-card"
        style={{
          padding: \'12px\',
          overflowX: \'auto\',
          maxHeight: \'500px\',
          overflowY: \'auto\',
          fontFamily: \'var(--font-mono)\',
          fontSize: \'12px\',
          lineHeight: \'1.6\'
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

function TreeNode({ label, value, isLast, searchTerm, defaultExpanded, level }: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);

  const isObject = value !== null && typeof value === \'object\';
  const isArray = Array.isArray(value);

  const handleCopyValue = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(typeof value === \'object\' ? JSON.stringify(value, null, 2) : String(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  if (!isObject) {
    let typeClass = \'json-string\';
    let displayVal = `"${String(value)}"`;

    if (typeof value === \'number\') {
      typeClass = \'json-number\';
      displayVal = String(value);
    } else if (typeof value === \'boolean\') {
      typeClass = \'json-boolean\';
      displayVal = String(value);
    } else if (value === null) {
      typeClass = \'json-null\';
      displayVal = \'null\';
    }

    const matches =
      searchTerm &&
      (label.toLowerCase().includes(searchTerm) || String(value).toLowerCase().includes(searchTerm));

    return (
      <div
        style={{
          paddingLeft: `${level * 16}px`,
          background: matches ? \'rgba(99, 102, 241, 0.15)\' : \'transparent\',
          borderRadius: \'3px\',
          display: \'flex\',
          alignItems: \'center\',
          gap: \'6px\'
        }}
      >
        <span className="json-key">{label}:</span>
        <span className={typeClass}>{displayVal}</span>
        {!isLast && <span style={{ color: \'var(--text-muted)\' }}>,</span>}
      </div>
    );
  }

  const keys = Object.keys(value || {});
  const isEmpty = keys.length === 0;

  return (
    <div style={{ paddingLeft: `${level * 16}px` }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: \'inline-flex\',
          alignItems: \'center\',
          gap: \'4px\',
          cursor: \'pointer\',
          userSelect: \'none\',
          padding: \'1px 4px\',
          borderRadius: \'4px\',
          color: \'var(--text-primary)\'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = \'rgba(255,255,255,0.05)\')}
        onMouseLeave={(e) => (e.currentTarget.style.background = \'transparent\')}
      >
        {isOpen ? <ChevronDownIcon size={12} /> : <ChevronRightIcon size={12} />}
        <span className="json-key">{label}</span>
        <span style={{ color: \'var(--text-muted)\', fontSize: \'11px\' }}>
          {isArray ? `[${keys.length}]` : `{${keys.length}}`}
        </span>

        <button
          type="button"
          onClick={handleCopyValue}
          style={{ background: \'none\', border: \'none\', color: \'var(--text-muted)\', cursor: \'pointer\', marginLeft: \'4px\' }}
          title="Copy node JSON"
        >
          {copied ? <CheckIcon size={11} style={{ color: \'var(--accent-emerald)\' }} /> : <CopyIcon size={11} />}
        </button>
      </div>

      {isOpen && !isEmpty && (
        <div>
          {keys.map((k, idx) => (
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
        </div>
      )}
    </div>
  );
}
'''

# 15. components/StreamViewer.tsx
files["components/StreamViewer.tsx"] = '''\'use client\';

import React, { useState } from \'react\';
import { StreamEvent } from \'../lib/api/types\';
import { CopyIcon, CheckIcon, StopIcon, ActivityIcon, BracesIcon, FileTextIcon } from \'./Icons\';
import { estimateTokens } from \'../lib/api/stream-parser\';

interface StreamViewerProps {
  streamEvents: StreamEvent[];
  accumulatedText: string;
  isStreamingActive: boolean;
  onStopStreaming: () => void;
  ttfbMs?: number;
  durationMs?: number;
  sizeBytes?: number;
}

export function StreamViewer({
  streamEvents,
  accumulatedText,
  isStreamingActive,
  onStopStreaming,
  ttfbMs,
  durationMs,
  sizeBytes
}: StreamViewerProps) {
  const [activeTab, setActiveTab] = useState<\'parsed\' | \'raw\'>(\'parsed\');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(accumulatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const estimatedTokens = estimateTokens(accumulatedText);

  return (
    <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'10px\' }}>
      {/* Live Stream Telemetry Bar */}
      <div
        className="glass-card"
        style={{
          padding: \'10px 14px\',
          display: \'flex\',
          alignItems: \'center\',
          justifyContent: \'space-between\',
          flexWrap: \'wrap\',
          gap: \'8px\',
          borderLeft: isStreamingActive ? \'3px solid var(--accent-cyan)\' : \'3px solid var(--accent-emerald)\'
        }}
      >
        <div style={{ display: \'flex\', alignItems: \'center\', gap: \'12px\', flexWrap: \'wrap\' }}>
          {isStreamingActive ? (
            <div style={{ display: \'flex\', alignItems: \'center\', gap: \'6px\', color: \'var(--accent-cyan)\', fontWeight: 600, fontSize: \'12.5px\' }}>
              <span
                style={{
                  width: \'8px\',
                  height: \'8px\',
                  borderRadius: \'50%\',
                  background: \'var(--accent-cyan)\',
                  boxShadow: \'0 0 10px var(--accent-cyan)\',
                  animation: \'streamGlowPulse 1.5s infinite\'
                }}
              />
              <span>Live Streaming Active</span>
            </div>
          ) : (
            <div style={{ display: \'flex\', alignItems: \'center\', gap: \'6px\', color: \'var(--accent-emerald)\', fontWeight: 600, fontSize: \'12.5px\' }}>
              <CheckIcon size={14} />
              <span>Stream Completed</span>
            </div>
          )}

          <div style={{ display: \'flex\', gap: \'10px\', fontSize: \'12px\', color: \'var(--text-muted)\' }}>
            <span>Chunks: <strong style={{ color: \'var(--text-primary)\' }}>{streamEvents.length}</strong></span>
            {ttfbMs !== undefined && <span>TTFB: <strong style={{ color: \'var(--text-primary)\' }}>{ttfbMs}ms</strong></span>}
            {durationMs !== undefined && <span>Time: <strong style={{ color: \'var(--text-primary)\' }}>{(durationMs / 1000).toFixed(2)}s</strong></span>}
            <span>Est. Tokens: <strong style={{ color: \'var(--accent-cyan)\' }}>{estimatedTokens}</strong></span>
          </div>
        </div>

        <div style={{ display: \'flex\', alignItems: \'center\', gap: \'8px\' }}>
          {isStreamingActive && (
            <button
              type="button"
              onClick={onStopStreaming}
              className="forge-btn forge-btn-danger"
              style={{ padding: \'5px 12px\', fontSize: \'12px\' }}
            >
              <StopIcon size={13} />
              <span>Stop Stream</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="forge-btn forge-btn-ghost"
            style={{ padding: \'5px 10px\', fontSize: \'12px\', border: \'1px solid var(--border-subtle)\' }}
          >
            {copied ? <CheckIcon size={13} style={{ color: \'var(--accent-emerald)\' }} /> : <CopyIcon size={13} />}
            <span>Copy Output</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Switcher (Parsed View vs Raw Event Stream) */}
      <div style={{ display: \'flex\', gap: \'4px\', borderBottom: \'1px solid var(--border-subtle)\', paddingBottom: \'4px\' }}>
        <button
          type="button"
          onClick={() => setActiveTab(\'parsed\')}
          className={`forge-btn ${activeTab === \'parsed\' ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
          style={{ padding: \'4px 10px\', fontSize: \'12px\' }}
        >
          <FileTextIcon size={13} />
          <span>Parsed Output</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(\'raw\')}
          className={`forge-btn ${activeTab === \'raw\' ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
          style={{ padding: \'4px 10px\', fontSize: \'12px\' }}
        >
          <BracesIcon size={13} />
          <span>Raw Event Stream ({streamEvents.length})</span>
        </button>
      </div>

      {/* Content Rendering */}
      {activeTab === \'parsed\' ? (
        <div
          className="glass-card"
          style={{
            padding: \'16px\',
            minHeight: \'240px\',
            maxHeight: \'550px\',
            overflowY: \'auto\',
            fontFamily: \'var(--font-sans)\',
            fontSize: \'13.5px\',
            lineHeight: \'1.65\',
            color: \'var(--text-primary)\',
            whiteSpace: \'pre-wrap\',
            wordBreak: \'break-word\'
          }}
        >
          {accumulatedText || (
            <span style={{ color: \'var(--text-muted)\', fontStyle: \'italic\' }}>
              {isStreamingActive ? \'Awaiting first stream chunk...\' : \'No stream output recorded.\'}
            </span>
          )}
          {isStreamingActive && (
            <span
              style={{
                display: \'inline-block\',
                width: \'6px\',
                height: \'14px\',
                background: \'var(--accent-primary)\',
                marginLeft: \'4px\',
                verticalAlign: \'middle\',
                animation: \'streamGlowPulse 0.8s infinite\'
              }}
            />
          )}
        </div>
      ) : (
        /* Raw Stream Events Inspector */
        <div
          className="glass-card"
          style={{
            padding: \'10px\',
            maxHeight: \'550px\',
            overflowY: \'auto\',
            display: \'flex\',
            flexDirection: \'column\',
            gap: \'6px\'
          }}
        >
          {streamEvents.length === 0 ? (
            <div style={{ padding: \'16px\', textAlign: \'center\', color: \'var(--text-muted)\', fontSize: \'12px\' }}>
              No stream events recorded yet.
            </div>
          ) : (
            streamEvents.map((ev) => (
              <div
                key={ev.index}
                style={{
                  padding: \'8px 10px\',
                  background: \'var(--bg-input)\',
                  borderRadius: \'6px\',
                  border: \'1px solid var(--border-subtle)\',
                  fontFamily: \'var(--font-mono)\',
                  fontSize: \'11.5px\',
                  display: \'flex\',
                  flexDirection: \'column\',
                  gap: \'4px\'
                }}
              >
                <div style={{ display: \'flex\', justifyContent: \'space-between\', color: \'var(--text-muted)\', fontSize: \'10.5px\' }}>
                  <span style={{ color: \'var(--accent-cyan)\', fontWeight: 600 }}>Chunk #{ev.index}</span>
                  <span>{ev.eventType}</span>
                  <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                </div>
                <div style={{ color: \'var(--text-primary)\', whiteSpace: \'pre-wrap\', wordBreak: \'break-all\' }}>
                  {ev.raw}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
'''

# 16. components/ResponsePanel.tsx
files["components/ResponsePanel.tsx"] = '''\'use client\';

import React, { useState } from \'react\';
import { ApiResponseData } from \'../lib/api/types\';
import { JsonTreeView } from \'./JsonTreeView\';
import { StreamViewer } from \'./StreamViewer\';
import { CopyIcon, CheckIcon, LayersIcon, ActivityIcon, BracesIcon, FileTextIcon, InfoIcon } from \'./Icons\';

interface ResponsePanelProps {
  response: ApiResponseData | null;
  isLoading: boolean;
  isStreamingActive: boolean;
  onStopStreaming: () => void;
}

type ResponseTab = \'pretty\' | \'raw\' | \'tree\' | \'headers\' | \'stream\' | \'diagnostics\';

export function ResponsePanel({
  response,
  isLoading,
  isStreamingActive,
  onStopStreaming
}: ResponsePanelProps) {
  const [activeTab, setActiveTab] = useState<ResponseTab>(\'pretty\');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!response) return;
    const textToCopy =
      typeof response.data === \'object\' ? JSON.stringify(response.data, null, 2) : response.rawText;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    if (!response) return;
    const content =
      typeof response.data === \'object\' ? JSON.stringify(response.data, null, 2) : response.rawText;
    const blob = new Blob([content], { type: \'application/json\' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement(\'a\');
    a.href = url;
    a.download = `response_${response.requestId || \'dump\'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // If initial loading state before first byte
  if (isLoading && !response) {
    return (
      <div
        className="glass-panel"
        style={{
          height: \'100%\',
          display: \'flex\',
          flexDirection: \'column\',
          alignItems: \'center\',
          justifyContent: \'center\',
          padding: \'40px 20px\',
          gap: \'16px\'
        }}
      >
        <div
          style={{
            width: \'36px\',
            height: \'36px\',
            borderRadius: \'50%\',
            border: \'3px solid rgba(99, 102, 241, 0.2)\',
            borderTopColor: \'var(--accent-primary)\',
            animation: \'spin 1s linear infinite\'
          }}
        />
        <div style={{ textAlign: \'center\' }}>
          <div style={{ fontSize: \'14px\', fontWeight: 600, color: \'var(--text-primary)\' }}>
            Dispatching AI API Request...
          </div>
          <div style={{ fontSize: \'12px\', color: \'var(--text-muted)\', marginTop: \'4px\' }}>
            Connecting to model gateway & awaiting first token
          </div>
        </div>
      </div>
    );
  }

  // If no response yet
  if (!response) {
    return (
      <div
        className="glass-panel"
        style={{
          height: \'100%\',
          display: \'flex\',
          flexDirection: \'column\',
          alignItems: \'center\',
          justifyContent: \'center\',
          padding: \'40px 20px\',
          color: \'var(--text-muted)\',
          textAlign: \'center\',
          gap: \'8px\'
        }}
      >
        <ActivityIcon size={32} style={{ color: \'var(--text-faint)\' }} />
        <div style={{ fontSize: \'14px\', fontWeight: 500, color: \'var(--text-secondary)\' }}>
          Response Viewer Awaiting Execution
        </div>
        <div style={{ fontSize: \'12px\', maxWidth: \'320px\', lineHeight: \'1.4\' }}>
          Configure your model endpoint, enter prompt or payload, and press <strong>Send Request</strong>.
        </div>
      </div>
    );
  }

  const isSuccess = response.status >= 200 && response.status < 300;
  const isClientError = response.status >= 400 && response.status < 500;
  const statusColor = isSuccess
    ? \'var(--accent-emerald)\'
    : isClientError
    ? \'var(--accent-amber)\'
    : \'var(--accent-rose)\';

  return (
    <div
      className="glass-panel"
      style={{
        display: \'flex\',
        flexDirection: \'column\',
        height: \'100%\',
        overflow: \'hidden\'
      }}
    >
      {/* Response Header Status Bar */}
      <div
        style={{
          padding: \'12px 16px\',
          borderBottom: \'1px solid var(--border-subtle)\',
          display: \'flex\',
          alignItems: \'center\',
          justifyContent: \'space-between\',
          flexWrap: \'wrap\',
          gap: \'8px\',
          background: \'rgba(0, 0, 0, 0.15)\'
        }}
      >
        {/* Status code & Metrics */}
        <div style={{ display: \'flex\', alignItems: \'center\', gap: \'12px\', flexWrap: \'wrap\' }}>
          <div
            style={{
              display: \'flex\',
              alignItems: \'center\',
              gap: \'6px\',
              padding: \'3px 8px\',
              borderRadius: \'6px\',
              background: isSuccess ? \'rgba(16, 185, 129, 0.15)\' : \'rgba(244, 63, 94, 0.15)\',
              border: `1px solid ${statusColor}`
            }}
          >
            <span
              style={{
                width: \'7px\',
                height: \'7px\',
                borderRadius: \'50%\',
                background: statusColor
              }}
            />
            <span style={{ fontSize: \'12.5px\', fontWeight: 700, color: statusColor, fontFamily: \'var(--font-mono)\' }}>
              {response.status} {response.statusText}
            </span>
          </div>

          <div style={{ display: \'flex\', gap: \'10px\', fontSize: \'12px\', color: \'var(--text-muted)\' }}>
            <span>Time: <strong style={{ color: \'var(--text-primary)\' }}>{(response.durationMs / 1000).toFixed(2)}s</strong></span>
            <span>Size: <strong style={{ color: \'var(--text-primary)\' }}>{(response.sizeBytes / 1024).toFixed(1)} KB</strong></span>
            {response.isStream && (
              <span className="forge-badge" style={{ background: \'rgba(6, 182, 212, 0.2)\', color: \'var(--accent-cyan)\' }}>
                Streaming
              </span>
            )}
          </div>
        </div>

        {/* Actions (Copy, Download) */}
        <div style={{ display: \'flex\', alignItems: \'center\', gap: \'6px\' }}>
          <button
            type="button"
            onClick={handleCopy}
            className="forge-btn forge-btn-ghost"
            style={{ padding: \'4px 8px\', fontSize: \'12px\', border: \'1px solid var(--border-subtle)\' }}
            title="Copy response body"
          >
            {copied ? <CheckIcon size={13} style={{ color: \'var(--accent-emerald)\' }} /> : <CopyIcon size={13} />}
            <span>{copied ? \'Copied!\' : \'Copy\'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="forge-btn forge-btn-ghost"
            style={{ padding: \'4px 8px\', fontSize: \'12px\', border: \'1px solid var(--border-subtle)\' }}
            title="Download JSON file"
          >
            Download
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: \'flex\',
          alignItems: \'center\',
          gap: \'4px\',
          padding: \'6px 12px\',
          borderBottom: \'1px solid var(--border-subtle)\',
          background: \'var(--bg-surface)\',
          overflowX: \'auto\'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab(\'pretty\')}
          className={`forge-btn ${activeTab === \'pretty\' ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
          style={{ padding: \'4px 10px\', fontSize: \'12px\' }}
        >
          <FileTextIcon size={13} />
          <span>Pretty / Text</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(\'raw\')}
          className={`forge-btn ${activeTab === \'raw\' ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
          style={{ padding: \'4px 10px\', fontSize: \'12px\' }}
        >
          <BracesIcon size={13} />
          <span>Raw</span>
        </button>

        {typeof response.data === \'object\' && response.data !== null && (
          <button
            type="button"
            onClick={() => setActiveTab(\'tree\')}
            className={`forge-btn ${activeTab === \'tree\' ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
            style={{ padding: \'4px 10px\', fontSize: \'12px\' }}
          >
            JSON Tree
          </button>
        )}

        {response.isStream && (
          <button
            type="button"
            onClick={() => setActiveTab(\'stream\')}
            className={`forge-btn ${activeTab === \'stream\' ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
            style={{ padding: \'4px 10px\', fontSize: \'12px\' }}
          >
            Stream Live
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab(\'headers\')}
          className={`forge-btn ${activeTab === \'headers\' ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
          style={{ padding: \'4px 10px\', fontSize: \'12px\' }}
        >
          <LayersIcon size={13} />
          <span>Headers ({Object.keys(response.headers || {}).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(\'diagnostics\')}
          className={`forge-btn ${activeTab === \'diagnostics\' ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
          style={{ padding: \'4px 10px\', fontSize: \'12px\' }}
        >
          <InfoIcon size={13} />
          <span>Diagnostics</span>
        </button>
      </div>

      {/* Main View Area */}
      <div style={{ flex: 1, overflowY: \'auto\', padding: \'14px\' }}>
        {/* Error Alert if failed */}
        {response.error && (
          <div
            style={{
              padding: \'12px 14px\',
              borderRadius: \'8px\',
              background: \'rgba(244, 63, 94, 0.1)\',
              border: \'1px solid rgba(244, 63, 94, 0.3)\',
              marginBottom: \'14px\',
              display: \'flex\',
              flexDirection: \'column\',
              gap: \'4px\'
            }}
          >
            <div style={{ fontSize: \'13px\', fontWeight: 600, color: \'var(--accent-rose)\' }}>
              {response.error}
            </div>
            {response.errorDetails && (
              <div style={{ fontSize: \'12px\', color: \'var(--text-secondary)\' }}>
                {response.errorDetails}
              </div>
            )}
          </div>
        )}

        {/* Tab 1: Pretty / Parsed */}
        {activeTab === \'pretty\' && (
          <div>
            {typeof response.data === \'object\' && response.data !== null ? (
              <pre
                style={{
                  background: \'var(--bg-input)\',
                  padding: \'14px\',
                  borderRadius: \'6px\',
                  fontFamily: \'var(--font-mono)\',
                  fontSize: \'12.5px\',
                  lineHeight: \'1.5\',
                  color: \'var(--text-primary)\',
                  overflowX: \'auto\'
                }}
              >
                {JSON.stringify(response.data, null, 2)}
              </pre>
            ) : (
              <div
                style={{
                  background: \'var(--bg-input)\',
                  padding: \'14px\',
                  borderRadius: \'6px\',
                  fontFamily: \'var(--font-sans)\',
                  fontSize: \'13.5px\',
                  lineHeight: \'1.6\',
                  color: \'var(--text-primary)\',
                  whiteSpace: \'pre-wrap\',
                  wordBreak: \'break-word\'
                }}
              >
                {response.rawText || String(response.data)}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Raw Response */}
        {activeTab === \'raw\' && (
          <pre
            style={{
              background: \'var(--bg-input)\',
              padding: \'14px\',
              borderRadius: \'6px\',
              fontFamily: \'var(--font-mono)\',
              fontSize: \'12px\',
              color: \'var(--text-primary)\',
              overflowX: \'auto\',
              whiteSpace: \'pre-wrap\',
              wordBreak: \'break-all\'
            }}
          >
            {response.rawText}
          </pre>
        )}

        {/* Tab 3: JSON Tree */}
        {activeTab === \'tree\' && <JsonTreeView data={response.data} />}

        {/* Tab 4: Stream View */}
        {activeTab === \'stream\' && (
          <StreamViewer
            streamEvents={response.streamEvents || []}
            accumulatedText={typeof response.data === \'string\' ? response.data : response.rawText}
            isStreamingActive={isStreamingActive}
            onStopStreaming={onStopStreaming}
            ttfbMs={response.ttfbMs}
            durationMs={response.durationMs}
            sizeBytes={response.sizeBytes}
          />
        )}

        {/* Tab 5: Response Headers */}
        {activeTab === \'headers\' && (
          <div className="glass-card" style={{ padding: \'12px\', display: \'flex\', flexDirection: \'column\', gap: \'8px\' }}>
            <div style={{ display: \'grid\', gridTemplateColumns: \'220px 1fr\', gap: \'8px\', fontSize: \'11px\', fontWeight: 700, color: \'var(--text-muted)\', textTransform: \'uppercase\' }}>
              <span>Header Key</span>
              <span>Value</span>
            </div>
            {Object.entries(response.headers || {}).map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: \'grid\',
                  gridTemplateColumns: \'220px 1fr\',
                  gap: \'8px\',
                  padding: \'6px 0\',
                  borderTop: \'1px solid var(--border-subtle)\',
                  fontSize: \'12px\',
                  fontFamily: \'var(--font-mono)\'
                }}
              >
                <span style={{ color: \'var(--accent-purple)\', fontWeight: 600 }}>{k}</span>
                <span style={{ color: \'var(--text-primary)\', wordBreak: \'break-all\' }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 6: Diagnostics */}
        {activeTab === \'diagnostics\' && (
          <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'12px\' }}>
            <div className="glass-card" style={{ padding: \'14px\', display: \'flex\', flexDirection: \'column\', gap: \'8px\' }}>
              <div style={{ fontSize: \'13px\', fontWeight: 600, color: \'var(--text-primary)\' }}>
                Request & Response Performance Telemetry
              </div>
              <div style={{ display: \'grid\', gridTemplateColumns: \'repeat(auto-fit, minmax(180px, 1fr))\', gap: \'10px\', marginTop: \'6px\' }}>
                <div style={{ background: \'var(--bg-input)\', padding: \'10px\', borderRadius: \'6px\' }}>
                  <div style={{ fontSize: \'11px\', color: \'var(--text-muted)\' }}>Total Latency</div>
                  <div style={{ fontSize: \'16px\', fontWeight: 700, color: \'var(--text-primary)\', fontFamily: \'var(--font-mono)\' }}>
                    {response.durationMs} ms
                  </div>
                </div>
                {response.ttfbMs !== undefined && (
                  <div style={{ background: \'var(--bg-input)\', padding: \'10px\', borderRadius: \'6px\' }}>
                    <div style={{ fontSize: \'11px\', color: \'var(--text-muted)\' }}>Time To First Byte (TTFB)</div>
                    <div style={{ fontSize: \'16px\', fontWeight: 700, color: \'var(--accent-cyan)\', fontFamily: \'var(--font-mono)\' }}>
                      {response.ttfbMs} ms
                    </div>
                  </div>
                )}
                <div style={{ background: \'var(--bg-input)\', padding: \'10px\', borderRadius: \'6px\' }}>
                  <div style={{ fontSize: \'11px\', color: \'var(--text-muted)\' }}>Payload Size</div>
                  <div style={{ fontSize: \'16px\', fontWeight: 700, color: \'var(--text-primary)\', fontFamily: \'var(--font-mono)\' }}>
                    {(response.sizeBytes / 1024).toFixed(2)} KB
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
'''

# 17. components/RequestPanel.tsx
files["components/RequestPanel.tsx"] = '''\'use client\';

import React, { useState } from \'react\';
import { ApiRequestConfig, Environment, ProviderPreset } from \'../lib/api/types\';
import { EndpointInput } from \'./EndpointInput\';
import { ProviderPresetSelector } from \'./ProviderPresetSelector\';
import { ModelInput } from \'./ModelInput\';
import { ApiKeyInput } from \'./ApiKeyInput\';
import { HeaderEditor } from \'./HeaderEditor\';
import { ParameterEditor } from \'./ParameterEditor\';
import { MessageEditor } from \'./MessageEditor\';
import { RawJsonEditor } from \'./RawJsonEditor\';
import { RequestPreview } from \'./RequestPreview\';
import { PlayIcon, StopIcon, LayersIcon, SlidersIcon, KeyIcon, CodeIcon, TerminalIcon } from \'./Icons\';

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

type RequestTab = \'messages\' | \'raw\' | \'headers\' | \'params\' | \'auth\' | \'preview\';

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
  const [activeTab, setActiveTab] = useState<RequestTab>(\'messages\');

  return (
    <div
      className="glass-panel"
      style={{
        display: \'flex\',
        flexDirection: \'column\',
        height: \'100%\',
        overflow: \'hidden\'
      }}
    >
      {/* Top Bar: Preset + Method + Endpoint + Send Button */}
      <div
        style={{
          padding: \'12px 14px\',
          borderBottom: \'1px solid var(--border-subtle)\',
          display: \'flex\',
          flexDirection: \'column\',
          gap: \'10px\',
          background: \'rgba(0, 0, 0, 0.15)\'
        }}
      >
        <div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'space-between\', flexWrap: \'wrap\', gap: \'8px\' }}>
          <ProviderPresetSelector
            activePresetId={config.presetId}
            onApplyPreset={onApplyPreset}
          />

          <div style={{ display: \'flex\', alignItems: \'center\', gap: \'8px\' }}>
            <span style={{ fontSize: \'11px\', color: \'var(--text-muted)\' }}>
              Shortcut: <strong>Ctrl + Enter</strong>
            </span>

            {isLoading || isStreamingActive ? (
              <button
                type="button"
                onClick={onStopStreaming}
                className="forge-btn forge-btn-danger"
                style={{ padding: \'8px 18px\', fontSize: \'13px\' }}
              >
                <StopIcon size={15} />
                <span>{isStreamingActive ? \'Stop Stream\' : \'Cancel\'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onSendRequest}
                className="forge-btn forge-btn-primary"
                style={{ padding: \'8px 20px\', fontSize: \'13px\' }}
              >
                <PlayIcon size={15} />
                <span>Send Request</span>
              </button>
            )}
          </div>
        </div>

        {/* Method & Endpoint Input */}
        <div style={{ display: \'flex\', alignItems: \'center\', gap: \'10px\', flexWrap: \'wrap\' }}>
          <EndpointInput
            method={config.method}
            onChangeMethod={(method) => onChangeConfig((prev) => ({ ...prev, method }))}
            endpoint={config.endpoint}
            onChangeEndpoint={(endpoint) => onChangeConfig((prev) => ({ ...prev, endpoint }))}
          />
        </div>

        {/* Model ID & Auth Quick Bar */}
        <div style={{ display: \'grid\', gridTemplateColumns: \'repeat(auto-fit, minmax(220px, 1fr))\', gap: \'10px\' }}>
          <ModelInput
            modelId={config.modelId}
            onChangeModelId={(modelId) => onChangeConfig((prev) => ({ ...prev, modelId }))}
          />
        </div>
      </div>

      {/* Request Sub-Tabs */}
      <div
        style={{
          display: \'flex\',
          alignItems: \'center\',
          gap: \'4px\',
          padding: \'6px 12px\',
          borderBottom: \'1px solid var(--border-subtle)\',
          background: \'var(--bg-surface)\',
          overflowX: \'auto\'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab(\'messages\')}
          className={`forge-btn ${activeTab === \'messages\' ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
          style={{ padding: \'4px 10px\', fontSize: \'12px\' }}
        >
          <CodeIcon size={13} />
          <span>Messages ({config.messages.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(\'raw\')}
          className={`forge-btn ${activeTab === \'raw\' ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
          style={{ padding: \'4px 10px\', fontSize: \'12px\' }}
        >
          <span>Raw Body</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(\'params\')}
          className={`forge-btn ${activeTab === \'params\' ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
          style={{ padding: \'4px 10px\', fontSize: \'12px\' }}
        >
          <SlidersIcon size={13} />
          <span>Parameters</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(\'headers\')}
          className={`forge-btn ${activeTab === \'headers\' ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
          style={{ padding: \'4px 10px\', fontSize: \'12px\' }}
        >
          <LayersIcon size={13} />
          <span>Headers ({config.headers.filter((h) => h.enabled).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(\'auth\')}
          className={`forge-btn ${activeTab === \'auth\' ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
          style={{ padding: \'4px 10px\', fontSize: \'12px\' }}
        >
          <KeyIcon size={13} />
          <span>Auth</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(\'preview\')}
          className={`forge-btn ${activeTab === \'preview\' ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
          style={{ padding: \'4px 10px\', fontSize: \'12px\' }}
        >
          <TerminalIcon size={13} />
          <span>Preview cURL</span>
        </button>
      </div>

      {/* Main Request Form Area */}
      <div style={{ flex: 1, overflowY: \'auto\', padding: \'14px\' }}>
        {activeTab === \'messages\' && (
          <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'12px\' }}>
            <div style={{ display: \'flex\', justifyContent: \'space-between\', alignItems: \'center\', fontSize: \'12px\', color: \'var(--text-secondary)\' }}>
              <span>Mode: Structured AI Prompt Builder</span>
              <button
                type="button"
                onClick={() => {
                  onChangeConfig((prev) => ({ ...prev, bodyMode: \'raw\' }));
                  setActiveTab(\'raw\');
                }}
                className="forge-btn forge-btn-ghost"
                style={{ padding: \'3px 8px\', fontSize: \'11.5px\', color: \'var(--accent-primary)\' }}
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

        {activeTab === \'raw\' && (
          <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'12px\' }}>
            <div style={{ display: \'flex\', justifyContent: \'space-between\', alignItems: \'center\', fontSize: \'12px\', color: \'var(--text-secondary)\' }}>
              <span>Mode: Direct Raw JSON Payload</span>
              <button
                type="button"
                onClick={() => {
                  onChangeConfig((prev) => ({ ...prev, bodyMode: \'builder\' }));
                  setActiveTab(\'messages\');
                }}
                className="forge-btn forge-btn-ghost"
                style={{ padding: \'3px 8px\', fontSize: \'11.5px\', color: \'var(--accent-primary)\' }}
              >
                Switch to Messages Builder →
              </button>
            </div>
            <RawJsonEditor
              value={config.rawBody}
              onChange={(rawBody) => onChangeConfig((prev) => ({ ...prev, rawBody, bodyMode: \'raw\' }))}
            />
          </div>
        )}

        {activeTab === \'params\' && (
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

        {activeTab === \'headers\' && (
          <HeaderEditor
            headers={config.headers}
            onChangeHeaders={(headers) => onChangeConfig((prev) => ({ ...prev, headers }))}
          />
        )}

        {activeTab === \'auth\' && (
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

        {activeTab === \'preview\' && (
          <RequestPreview config={config} environment={environment} />
        )}
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

print("Batch 3 completed successfully!")
