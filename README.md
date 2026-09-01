# Apiora (formerly API Forge AI)

> **Universal AI Model API Testing, Streaming Playground & Diagnostics Laboratory**

Apiora is a high-craft, production-ready AI developer platform built with Next.js App Router, TypeScript, and native Web Streams. It allows developers to test, inspect, and benchmark AI model APIs from any provider without restrictions or external SDK bloat.

---

## ✨ Features

- 🌐 **Universal Model Playground**: Connect to any endpoint URL, input any model ID, and test without restrictions.
- ⚡ **Native Streaming Engine**: Real-time progressive token streaming via SSE (`text/event-stream`) and NDJSON with live TTFB, chunk counters, and `AbortController` cancellation.
- 🛡️ **SSRF-Protected Server-Side Proxy**: Integrated gateway (`/api/proxy`) preventing unauthorized access to RFC1918 private subnets, cloud metadata (`169.254.169.254`), and loopback addresses.
- 🎛️ **10 Pre-Configured Editable Presets**:
  - OpenAI Chat Completions (`/v1/chat/completions`)
  - Anthropic Messages (`/v1/messages`)
  - Google Gemini Generate Content (`v1beta/models/...:streamGenerateContent`)
  - DeepSeek API (`deepseek-chat`)
  - Groq Cloud LPU (`llama-3.3-70b-versatile`)
  - OpenRouter Universal Gateway
  - Mistral AI (`mistral-large-latest`)
  - Together AI
  - Cohere Chat v2
  - Generic REST JSON API
- 🌳 **Interactive JSON Tree Viewer**: Collapsible nodes with data-type badges, JSON path copying, and search filters.
- 💬 **Structured Prompt Builder & Raw JSON Editor**: Switch seamlessly between multi-turn dialog editor and syntax-aware raw JSON editor with line numbers, formatting, and minification.
- 🔐 **Zero-Trust Credential Security**: API keys exist strictly in session memory by default and are masked in request previews and cURL exports. Optional browser AES-GCM local storage encryption.
- 📦 **IndexedDB Persistence**: Request execution history (sanitized without keys), saved collections/templates, and environment variables (`{{BASE_URL}}`, `{{API_KEY}}`).
- 🎨 **Pure CSS Ambient Motion**: Lightweight, 60fps CSS gradient motion that automatically scales or disables based on device hardware and `prefers-reduced-motion` settings (Zero GPU/WebGL dependencies).
- 📱 **Responsive Workspace**: Resizable split panes on desktop; tabbed controls optimized for mobile viewports.

---

## 🏗 Architecture

```
app/
  layout.tsx              # Root HTML & viewport layout
  page.tsx                # Home page wrapper
  globals.css             # Obsidian dark design system & CSS keyframes
  api/
    proxy/
      route.ts            # Server-side proxy with SSRF protection & streaming pipe

components/
  ApiTester.tsx           # Main workspace orchestrator & layout
  TopNav.tsx              # Navigation, workspace status & theme controls
  Sidebar.tsx             # History, collections, environments navigation
  RequestPanel.tsx        # Request builder tabs, methods & endpoints
  ResponsePanel.tsx       # Multi-tab response inspector & performance telemetry
  StreamViewer.tsx        # Live stream token renderer & raw chunk logs
  JsonTreeView.tsx        # Interactive collapsible JSON tree
  ProviderPresetSelector.tsx # Provider template selector
  HeaderEditor.tsx        # Dynamic HTTP headers manager
  ParameterEditor.tsx     # Query parameters & model hyperparameters
  MessageEditor.tsx       # Multi-turn prompt dialog builder
  RawJsonEditor.tsx       # Syntax-highlighted custom JSON editor
  ApiKeyInput.tsx         # Masked auth key input with Bearer/Header/Query modes
  ModelInput.tsx          # Unrestricted model ID selector
  EndpointInput.tsx       # Method & target URL editor
  RequestPreview.tsx      # Live compiled cURL and JavaScript fetch preview
  RequestHistory.tsx      # IndexedDB execution log viewer
  SavedRequests.tsx       # Reusable template collections
  EnvironmentManager.tsx  # Dynamic environment variable system
  SettingsModal.tsx       # App theme, timeout, and performance settings
  AmbientBackground.tsx   # Lightweight CSS ambient background
  StatusIndicator.tsx     # Network and device performance status
  Icons.tsx               # Handcrafted lightweight SVG icons

lib/
  api/
    types.ts              # Strict TypeScript definitions
    presets.ts            # Provider preset templates
    ssrf.ts               # SSRF security validation
    request-builder.ts    # Variable interpolation & cURL builder
    stream-parser.ts      # SSE & NDJSON stream parsing engine
    proxy-client.ts       # Client-side proxy dispatcher
  storage/
    indexed-db.ts         # IndexedDB database abstraction
    encryption.ts         # AES-GCM Web Crypto API encryption
  performance/
    device-profile.ts     # Device memory & motion detection
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### 3. Production Build

```bash
npm run build
npm run start
```

---

## 🔒 Security Policy

- **No Server Logging of API Keys**: The proxy routes requests directly without caching credentials.
- **SSRF Hardened**: Prohibits requests to internal IPs, loopback, link-local, and cloud metadata endpoints.
- **Client Session Memory**: API keys are cleared upon session close unless explicitly saved to encrypted browser storage.

---

## 📄 License

MIT License. Open-source and free for development and testing.
