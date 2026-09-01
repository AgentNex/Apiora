'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ForgeLogo,
  CopyIcon,
  CheckIcon,
  CodeIcon,
  SparklesIcon,
  ShieldIcon,
  TerminalIcon,
  SlidersIcon,
  LayersIcon,
  KeyIcon,
  ActivityIcon,
  TreeIcon,
  CpuIcon,
  GlobeIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon,
  ArrowRightIcon,
  BracesIcon,
  RefreshCwIcon
} from '../../components/Icons';

interface CodeSnippetProps {
  code: string;
  language?: string;
  title?: string;
}

function CodeSnippet({ code, language = 'bash', title }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        borderRadius: '8px',
        border: '1px solid var(--border-subtle)',
        background: 'rgba(0, 0, 0, 0.45)',
        overflow: 'hidden',
        margin: '12px 0'
      }}
    >
      {title && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: '11.5px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)'
          }}
        >
          <span>{title}</span>
          <span style={{ textTransform: 'uppercase', fontSize: '10px', color: 'var(--accent-cyan)' }}>
            {language}
          </span>
        </div>
      )}
      <div style={{ position: 'relative', padding: '12px 14px' }}>
        <button
          type="button"
          onClick={handleCopy}
          className="forge-btn forge-btn-ghost"
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            padding: '4px 8px',
            fontSize: '11.5px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--border-subtle)'
          }}
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <CheckIcon size={12} style={{ color: 'var(--accent-emerald)' }} />
              <span style={{ color: 'var(--accent-emerald)', fontSize: '11px' }}>Copied</span>
            </>
          ) : (
            <>
              <CopyIcon size={12} />
              <span style={{ fontSize: '11px' }}>Copy</span>
            </>
          )}
        </button>
        <pre
          style={{
            margin: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: '12.5px',
            lineHeight: '1.55',
            color: 'var(--text-primary)',
            overflowX: 'auto',
            paddingRight: '60px'
          }}
        >
          <code>{code.trim()}</code>
        </pre>
      </div>
    </div>
  );
}

interface MultiTabCodeProps {
  tabs: { label: string; code: string; language: string }[];
}

function MultiTabCode({ tabs }: MultiTabCodeProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div
      style={{
        borderRadius: '8px',
        border: '1px solid var(--border-subtle)',
        background: 'rgba(0, 0, 0, 0.45)',
        overflow: 'hidden',
        margin: '14px 0'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.03)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '4px 6px',
          gap: '4px',
          overflowX: 'auto'
        }}
      >
        {tabs.map((t, idx) => (
          <button
            key={t.label}
            type="button"
            onClick={() => setActiveIdx(idx)}
            className={`forge-btn ${activeIdx === idx ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
            style={{ padding: '4px 10px', fontSize: '11.5px' }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <CodeSnippet code={tabs[activeIdx].code} language={tabs[activeIdx].language} />
    </div>
  );
}

interface AccordionProps {
  title: string;
  badge?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Accordion({ title, badge, children, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        background: 'var(--bg-surface)',
        marginBottom: '10px',
        overflow: 'hidden'
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: '13.5px' }}>{title}</span>
          {badge && (
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '4px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--accent-cyan)'
              }}
            >
              {badge}
            </span>
          )}
        </div>
        {isOpen ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />}
      </button>
      {isOpen && (
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.15)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

const SECTIONS = [
  { id: 'overview', title: '1. Overview & Vision', icon: SparklesIcon },
  { id: 'quickstart', title: '2. 30-Second Quickstart', icon: TerminalIcon },
  { id: 'workspace-modes', title: '3. Workspace Modes', icon: CodeIcon },
  { id: 'presets', title: '4. Providers & Presets', icon: GlobeIcon },
  { id: 'speech-audio', title: '5. Speech & Audio STT', icon: ActivityIcon },
  { id: 'streaming', title: '6. Real-Time Streaming', icon: ActivityIcon },
  { id: 'response-inspector', title: '7. Response & JSON Tree', icon: TreeIcon },
  { id: 'security', title: '8. Security & SSRF Defense', icon: ShieldIcon },
  { id: 'environments', title: '9. Environments ({{VAR}})', icon: SlidersIcon },
  { id: 'indexeddb', title: '10. Local Persistence', icon: LayersIcon },
  { id: 'shortcuts', title: '11. Keyboard Shortcuts', icon: KeyIcon },
  { id: 'proxy-api', title: '12. Proxy API Reference', icon: CpuIcon }
];

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 120;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(s.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredSections = SECTIONS.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Top Header */}
      <header
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <ForgeLogo size={28} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                APIORA
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: '4px',
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  color: '#ffffff'
                }}
              >
                DOCS
              </span>
            </div>
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link
            href="/"
            className="forge-btn forge-btn-primary"
            style={{ padding: '6px 14px', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Launch Playground</span>
            <ArrowRightIcon size={13} />
          </Link>
          <a
            href="https://github.com/AgentNex/Apiora"
            target="_blank"
            rel="noreferrer"
            className="forge-btn forge-btn-ghost"
            style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none' }}
          >
            GitHub
          </a>
        </div>
      </header>

      {/* Main Docs Body */}
      <div style={{ display: 'flex', flex: 1, maxWidth: '1440px', width: '100%', margin: '0 auto', position: 'relative' }}>
        {/* Sidebar Nav */}
        <aside
          style={{
            width: '280px',
            borderRight: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            padding: '16px',
            position: 'sticky',
            top: 'var(--header-height)',
            height: 'calc(100vh - var(--header-height))',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
          className="hidden md:flex"
        >
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter topics..."
              className="forge-input"
              style={{ width: '100%', padding: '6px 10px', fontSize: '12px' }}
            />
          </div>

          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
            Documentation Index
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {filteredSections.map((s) => {
              const isActive = activeSection === s.id;
              const Icon = s.icon;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    textDecoration: 'none',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                    border: isActive ? '1px solid var(--border-accent)' : '1px solid transparent',
                    transition: 'all 0.12s ease'
                  }}
                >
                  <Icon size={14} style={{ color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />
                  <span>{s.title}</span>
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Content Container */}
        <main style={{ flex: 1, padding: '32px 24px 80px 32px', maxWidth: '900px', lineHeight: '1.65' }}>
          {/* Section 1: Overview */}
          <section id="overview" style={{ marginBottom: '48px', scrollMarginTop: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                ARCHITECTURE & PHILOSOPHY
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 14px 0', letterSpacing: '-0.02em' }}>
              1. Overview & Vision
            </h1>
            <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)' }}>
              <strong>Apiora</strong> is a high-craft developer testing laboratory and experimentation studio designed specifically for AI models, LLMs, and Speech/Audio APIs. It addresses the common pain points of existing API clients: heavy SDK dependencies, inflexible presets, lack of real-time SSE telemetry, and privacy vulnerabilities.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', margin: '20px 0' }}>
              <div className="glass-card" style={{ padding: '14px' }}>
                <div style={{ fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '4px' }}>
                  🌐 Universal & Unrestricted
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  Test any endpoint URL (OpenAI, Anthropic, Gemini, DeepSeek, Groq, local Ollama, custom enterprise REST) without vendor locks.
                </div>
              </div>

              <div className="glass-card" style={{ padding: '14px' }}>
                <div style={{ fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                  ⚡ Pure Native Web Streams
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  Built entirely on native <code className="forge-code">ReadableStream</code>, <code className="forge-code">TextDecoder</code>, and <code className="forge-code">AbortController</code> with 0ms chunk buffer lag.
                </div>
              </div>

              <div className="glass-card" style={{ padding: '14px' }}>
                <div style={{ fontWeight: 600, color: 'var(--accent-emerald)', marginBottom: '4px' }}>
                  🛡️ SSRF-Hardened Proxy
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  Built-in protection blocking RFC1918 subnets, cloud metadata (<code className="forge-code">169.254.169.254</code>), and loopbacks.
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Quickstart */}
          <section id="quickstart" style={{ marginBottom: '48px', scrollMarginTop: '80px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 12px 0' }}>
              2. 30-Second Quickstart
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Executing your first live AI request in Apiora takes under 30 seconds:
            </p>

            <ol style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong>Select a Provider Preset</strong>: Open the <em>Preset</em> dropdown and select <strong>OpenAI Chat</strong>, <strong>Anthropic Messages</strong>, or <strong>Google Gemini</strong>.
              </li>
              <li>
                <strong>Enter your API Key</strong>: Paste your key in the <em>Auth</em> bar. The key is masked immediately and stored strictly in active memory.
              </li>
              <li>
                <strong>Craft your Prompt</strong>: In the <em>Prompt Matrix</em> or <em>Raw JSON</em> workspace, write your user prompt or paste raw JSON.
              </li>
              <li>
                <strong>Send Request</strong>: Click <strong>Send Request</strong> or press <code className="forge-code">Ctrl + Enter</code> (<code className="forge-code">Cmd + Enter</code> on macOS).
              </li>
            </ol>

            <CodeSnippet
              title="cURL Equivalent for OpenAI Chat"
              language="bash"
              code={`curl -X POST "https://api.openai.com/v1/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "Explain Server-Sent Events in 2 sentences."}
    ],
    "stream": true
  }'`}
            />
          </section>

          {/* Section 3: Workspace Modes */}
          <section id="workspace-modes" style={{ marginBottom: '48px', scrollMarginTop: '80px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 12px 0' }}>
              3. Workspace Modes: Prompt Matrix vs. Raw REST
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Apiora provides a dedicated top-level segmented control allowing developers to toggle instantly between two optimized authoring paradigms:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', margin: '18px 0' }}>
              <div className="glass-card" style={{ padding: '16px', borderTop: '3px solid var(--accent-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  <CodeIcon size={16} style={{ color: 'var(--accent-primary)' }} />
                  <span>Prompt Matrix Mode</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  A structured multi-turn dialogue matrix designed for conversational LLMs:
                </p>
                <ul style={{ fontSize: '12.5px', color: 'var(--text-muted)', paddingLeft: '18px', marginTop: '8px' }}>
                  <li>Role selectors: <code className="forge-code">system</code>, <code className="forge-code">developer</code>, <code className="forge-code">user</code>, <code className="forge-code">assistant</code>, <code className="forge-code">custom</code>.</li>
                  <li>Reorder messages up/down to test context weighting.</li>
                  <li>Live character counts and token estimators per message.</li>
                </ul>
              </div>

              <div className="glass-card" style={{ padding: '16px', borderTop: '3px solid var(--accent-cyan)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  <BracesIcon size={16} style={{ color: 'var(--accent-cyan)' }} />
                  <span>Raw JSON / REST Mode</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  A streamlined, code-editor-style REST interface:
                </p>
                <ul style={{ fontSize: '12.5px', color: 'var(--text-muted)', paddingLeft: '18px', marginTop: '8px' }}>
                  <li>Auto-Formatting with <code className="forge-code">Ctrl + Shift + F</code>.</li>
                  <li>Soft 2-space Tab indentation handling.</li>
                  <li>Direct Header Quick-Adds (<code className="forge-code">+ Content-Type</code>, <code className="forge-code">+ Accept</code>).</li>
                  <li>Instant Speech & Audio Quick Presets dropdown.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4: Presets */}
          <section id="presets" style={{ marginBottom: '48px', scrollMarginTop: '80px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 12px 0' }}>
              4. Supported Providers & Quick Presets
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Apiora includes pre-configured, 100% editable presets. Selecting any preset pre-populates the endpoint, headers, and authentication parameters without locking any fields:
            </p>

            <Accordion title="OpenAI & OpenAI-Compatible (Groq, DeepSeek, Together, OpenRouter)" badge="CHAT & REASONING" defaultOpen>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Compatible with all <code className="forge-code">/v1/chat/completions</code> endpoints. Supports streaming, frequency/presence penalties, and reasoning models (e.g. DeepSeek-R1).
              </p>
              <CodeSnippet
                language="json"
                code={`{
  "model": "deepseek-chat",
  "messages": [
    {"role": "system", "content": "You are an expert developer."},
    {"role": "user", "content": "Explain zero-copy networking."}
  ],
  "temperature": 0.7,
  "stream": true
}`}
              />
            </Accordion>

            <Accordion title="Anthropic Claude Messages API" badge="MESSAGES V1">
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Uses <code className="forge-code">x-api-key</code> authentication and requires the <code className="forge-code">anthropic-version: 2023-06-01</code> header. System prompts are top-level fields outside the message array.
              </p>
              <CodeSnippet
                language="json"
                code={`{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 1024,
  "system": "You are a precise software architect.",
  "messages": [
    {"role": "user", "content": "Write a pure CSS ambient glow animation."}
  ],
  "stream": true
}`}
              />
            </Accordion>

            <Accordion title="Google Gemini v1beta Generate Content" badge="MULTIMODAL">
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Uses Google AI content parts format with <code className="forge-code">x-goog-api-key</code> authentication and <code className="forge-code">streamGenerateContent?alt=sse</code> for streaming.
              </p>
              <CodeSnippet
                language="json"
                code={`{
  "contents": [
    {
      "role": "user",
      "parts": [{"text": "Analyze the time complexity of QuickSort."}]
    }
  ],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 2048
  }
}`}
              />
            </Accordion>
          </section>

          {/* Section 5: Speech & Audio */}
          <section id="speech-audio" style={{ marginBottom: '48px', scrollMarginTop: '80px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 12px 0' }}>
              5. Speech & Audio Presets
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Apiora includes first-class Quick Presets for leading Speech-to-Text (STT) and audio transcription APIs in Raw REST mode:
            </p>

            <MultiTabCode
              tabs={[
                {
                  label: 'Speechmatics (Async Job)',
                  language: 'json',
                  code: `// Endpoint: POST https://asr.api.speechmatics.com/v2/jobs/
// Header: Authorization: Bearer {{API_KEY}}
{
  "type": "transcription",
  "transcription_config": {
    "language": "en",
    "operating_point": "enhanced",
    "enable_entities": true,
    "diarization": "speaker"
  },
  "fetch_data": {
    "url": "https://example.com/audio-sample.mp3"
  }
}`
                },
                {
                  label: 'Deepgram Nova-2 (Audio URL)',
                  language: 'json',
                  code: `// Endpoint: POST https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true&diarize=true
// Header: Authorization: Token {{API_KEY}}
{
  "url": "https://dpgr.am/bueller.wav"
}`
                },
                {
                  label: 'Groq Whisper (Audio Transcribe)',
                  language: 'json',
                  code: `// Endpoint: POST https://api.groq.com/openai/v1/audio/transcriptions
// Header: Authorization: Bearer {{API_KEY}}
{
  "model": "whisper-large-v3",
  "temperature": 0,
  "response_format": "verbose_json",
  "language": "en",
  "url": "https://example.com/audio-sample.mp3"
}`
                }
              ]}
            />
          </section>

          {/* Section 6: Real-Time Streaming */}
          <section id="streaming" style={{ marginBottom: '48px', scrollMarginTop: '80px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 12px 0' }}>
              6. Native Streaming Engine
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Unlike traditional API testing tools that buffer responses until completion, Apiora utilizes an asynchronous chunk pipeline built with native Web Streams:
            </p>

            <ul style={{ fontSize: '13.5px', color: 'var(--text-secondary)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Zero Buffer Lag</strong>: Every incoming chunk is immediately fed through a <code className="forge-code">TextDecoder</code> and pushed to the UI.</li>
              <li><strong>Dual-Mode Viewer</strong>:
                <ul>
                  <li><strong>Parsed View</strong>: Progressive typewriter rendering with auto-scroll and markdown formatting.</li>
                  <li><strong>Raw Stream Logs</strong>: Chronological table of every Server-Sent Event (<code className="forge-code">data: ...</code>) with byte length and timestamps.</li>
                </ul>
              </li>
              <li><strong>Real-Time Metrics</strong>: Displays Time To First Byte (TTFB), total elapsed duration, stream chunk counts, and estimated token counts.</li>
              <li><strong>Instant Stream Cancellation</strong>: Click <strong>Stop Stream</strong> or press <code className="forge-code">Escape</code> to cleanly trigger <code className="forge-code">abortController.abort()</code>.</li>
            </ul>
          </section>

          {/* Section 7: Response Inspector */}
          <section id="response-inspector" style={{ marginBottom: '48px', scrollMarginTop: '80px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 12px 0' }}>
              7. Response Inspector & Collapsible JSON Tree
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Inspect responses across 6 dedicated tabs:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', margin: '14px 0' }}>
              <div className="glass-card" style={{ padding: '12px' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--accent-primary)' }}>1. Pretty View</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Formatted text, markdown rendering, and syntax highlighting.</div>
              </div>
              <div className="glass-card" style={{ padding: '12px' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--accent-cyan)' }}>2. Raw Body</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Exact raw bytes received from upstream server.</div>
              </div>
              <div className="glass-card" style={{ padding: '12px' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--accent-emerald)' }}>3. JSON Tree</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Interactive collapsible tree with search filter and path copying.</div>
              </div>
              <div className="glass-card" style={{ padding: '12px' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>4. Headers Table</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>All HTTP response headers with one-click copy.</div>
              </div>
              <div className="glass-card" style={{ padding: '12px' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--accent-rose)' }}>5. Diagnostics</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>HTTP status explanations for 400, 401, 403, 429, 500+ errors.</div>
              </div>
            </div>
          </section>

          {/* Section 8: Security */}
          <section id="security" style={{ marginBottom: '48px', scrollMarginTop: '80px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 12px 0' }}>
              8. Security & SSRF Defense Architecture
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Apiora incorporates a zero-trust architecture to protect developer workstations and cloud infrastructure:
            </p>

            <Accordion title="SSRF IP & Hostname Filtering Rules" badge="SECURITY HARDENED" defaultOpen>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                The serverless proxy (<code className="forge-code">/api/proxy</code>) blocks requests to:
              </p>
              <ul style={{ fontSize: '12.5px', color: 'var(--text-muted)', paddingLeft: '18px' }}>
                <li><strong>RFC1918 Private Subnets</strong>: <code className="forge-code">10.0.0.0/8</code>, <code className="forge-code">172.16.0.0/12</code>, <code className="forge-code">192.168.0.0/16</code></li>
                <li><strong>Loopback Addresses</strong>: <code className="forge-code">127.0.0.0/8</code>, <code className="forge-code">::1</code>, <code className="forge-code">localhost</code></li>
                <li><strong>Link-Local & Cloud Metadata</strong>: <code className="forge-code">169.254.169.254</code> (AWS, GCP, Azure, DigitalOcean instance metadata endpoints)</li>
                <li><strong>Prohibited Protocols</strong>: <code className="forge-code">ftp:</code>, <code className="forge-code">file:</code>, <code className="forge-code">gopher:</code> (Only <code className="forge-code">http:</code> and <code className="forge-code">https:</code> permitted)</li>
              </ul>
            </Accordion>

            <Accordion title="Client-Side Key Masking & AES-GCM 256-Bit Storage" badge="WEB CRYPTO">
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                By default, API keys are held strictly in temporary session memory and are never persisted to disk or sent to analytics. If local storage is enabled in Settings, keys are encrypted using browser-native <strong>AES-GCM 256-bit encryption with PBKDF2 key derivation</strong> before being written to IndexedDB.
              </p>
            </Accordion>
          </section>

          {/* Section 9: Environments */}
          <section id="environments" style={{ marginBottom: '48px', scrollMarginTop: '80px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 12px 0' }}>
              9. Dynamic Environments & Variable Interpolation
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              You can define environment variables in the <em>Environments</em> manager and reference them anywhere using mustache syntax: <code className="forge-code">{'{{VARIABLE_NAME}}'}</code>.
            </p>

            <CodeSnippet
              title="Variable Interpolation Examples"
              language="json"
              code={`// Endpoint:
{{BASE_URL}}/v1/chat/completions

// Authorization Header:
Bearer {{OPENAI_API_KEY}}

// Request Body:
{
  "model": "{{MODEL_ID}}",
  "messages": [{"role": "user", "content": "Hello {{USER_NAME}}"}]
}`}
            />
          </section>

          {/* Section 10: Local Persistence */}
          <section id="indexeddb" style={{ marginBottom: '48px', scrollMarginTop: '80px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 12px 0' }}>
              10. Local Persistence & Saved Collections
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Apiora uses browser IndexedDB storage for offline reliability:
            </p>
            <ul style={{ fontSize: '13.5px', color: 'var(--text-secondary)', paddingLeft: '20px' }}>
              <li><strong>Execution History</strong>: Saves the last 100 requests. Sensitive keys are stripped automatically before saving.</li>
              <li><strong>Saved Requests</strong>: Organize requests into custom collections (e.g. <em>OpenAI Tests</em>, <em>Voice Transcriptions</em>).</li>
              <li><strong>Offline Availability</strong>: All templates, histories, and environment settings persist across page reloads without requiring an account or cloud database.</li>
            </ul>
          </section>

          {/* Section 11: Keyboard Shortcuts */}
          <section id="shortcuts" style={{ marginBottom: '48px', scrollMarginTop: '80px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 12px 0' }}>
              11. Keyboard Shortcuts
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', margin: '14px 0' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Shortcut</th>
                  <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Scope</th>
                  <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 12px' }}><code className="forge-code">Ctrl + Enter</code> / <code className="forge-code">Cmd + Enter</code></td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>Global</td>
                  <td style={{ padding: '10px 12px' }}>Send API Request immediately</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 12px' }}><code className="forge-code">Escape</code></td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>Global</td>
                  <td style={{ padding: '10px 12px' }}>Abort active stream / cancel request</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 12px' }}><code className="forge-code">Ctrl + Shift + F</code></td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>Raw REST Mode</td>
                  <td style={{ padding: '10px 12px' }}>Auto-format JSON payload (Pretty Print)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 12px' }}><code className="forge-code">Tab</code></td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>JSON Editor</td>
                  <td style={{ padding: '10px 12px' }}>Insert 2-space soft indentation</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Section 12: Proxy API Reference */}
          <section id="proxy-api" style={{ marginBottom: '48px', scrollMarginTop: '80px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 12px 0' }}>
              12. Server-Side Proxy API Reference (<code className="forge-code">/api/proxy</code>)
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              The serverless gateway routes outbound requests while protecting against CORS limitations and SSRF vulnerabilities.
            </p>

            <MultiTabCode
              tabs={[
                {
                  label: 'JSON Schema (POST /api/proxy)',
                  language: 'json',
                  code: `{
  "url": "https://api.openai.com/v1/chat/completions",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer sk-..."
  },
  "body": "{\\"model\\":\\"gpt-4o\\",\\"messages\\":[{\\"role\\":\\"user\\",\\"content\\":\\"Hello\\"}]}",
  "isStreaming": true,
  "timeoutSeconds": 60
}`
                },
                {
                  label: 'SSE Streaming Response',
                  language: 'http',
                  code: `HTTP/1.1 200 OK
Content-Type: text/event-stream; charset=utf-8
Cache-Control: no-cache, no-transform
Connection: keep-alive
X-Apiora-Proxy: true

data: {"choices":[{"delta":{"content":"Hello"}}]}
data: {"choices":[{"delta":{"content":" from"}}]}
data: {"choices":[{"delta":{"content":" Apiora!"}}]}
data: [DONE]`
                },
                {
                  label: 'SSRF Blocked Response',
                  language: 'json',
                  code: `HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "error": "SSRF Protection: Request Blocked",
  "message": "Access to local/metadata host \\"169.254.169.254\\" is blocked for security (SSRF protection).",
  "targetUrl": "http://169.254.169.254",
  "timestamp": 1788242000000
}`
                }
              ]}
            />
          </section>

          {/* Footer Callout */}
          <div
            className="glass-card"
            style={{
              padding: '24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              marginTop: '40px',
              border: '1px solid var(--border-accent)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(6, 182, 212, 0.1))'
            }}
          >
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Ready to test your AI Model APIs?</h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '500px' }}>
              Launch the live interactive playground to experiment with OpenAI, Claude, Gemini, DeepSeek, Speechmatics, and more.
            </p>
            <Link
              href="/"
              className="forge-btn forge-btn-primary"
              style={{ padding: '8px 20px', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span>Open Apiora Playground</span>
              <ArrowRightIcon size={14} />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
