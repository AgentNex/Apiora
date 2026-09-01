<div align="center">

<img src="./logo.png" alt="Apiora Logo" width="120" height="120" style="border-radius: 24px; box-shadow: 0 12px 40px rgba(99, 102, 241, 0.35);" />

# APIORA

### The Universal AI Model API Testing, Streaming Playground & Diagnostics Laboratory

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Deployment](https://img.shields.io/badge/Vercel-Live_Production-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://api-forge-ai-ivory.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![SSRF Protected](https://img.shields.io/badge/Security-SSRF_Hardened-6366f1?style=for-the-badge)](https://owasp.org/www-community/attacks/Server_Side_Request_Forgery)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-06b6d4?style=for-the-badge)](https://github.com/AgentNex/Apiora/pulls)

<p align="center">
  <a href="https://api-forge-ai-ivory.vercel.app"><strong>Explore Live Demo »</strong></a>
  <br />
  <br />
  <a href="#-key-features">Key Features</a> •
  <a href="#-workspace-modes">Workspace Modes</a> •
  <a href="#-supported-providers--presets">Presets</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-security--ssrf-defense">Security</a> •
  <a href="#-license">License</a>
</p>

</div>

---

## 🌟 Overview

**Apiora** (formerly *API Forge AI*) is a high-craft, production-grade developer laboratory engineered for testing, inspecting, and benchmarking LLM and Speech/Audio model APIs. Built without heavy visual frameworks or proprietary SDK dependencies, Apiora provides native Web Streams, bidirectional formatting, SSRF-hardened serverless proxying, and pure CSS ambient motion.

> 🚀 **Live Production Deployment**: [https://api-forge-ai-ivory.vercel.app](https://api-forge-ai-ivory.vercel.app)

---

## ✨ Key Features

- 🌐 **Unrestricted Universal Playground**: Connect to any HTTP/HTTPS endpoint, specify any custom model ID, and test without provider locks.
- ⚡ **Native Web Streams Engine**: Progressive real-time token rendering via SSE (`text/event-stream`) and NDJSON with live TTFB, chunk counters, and `AbortController` cancellation.
- 🛡️ **SSRF-Protected Proxy Gateway**: Integrated serverless route (`/api/proxy`) validating outbound target IP addresses against RFC1918 private subnets, cloud metadata (`169.254.169.254`), and loopback interfaces.
- 🎛️ **Multi-Turn Prompt Matrix & Raw REST Workspaces**: Dual-mode request authoring with instant formatting, minification, and multi-role dialogue management.
- 🌳 **Interactive Collapsible JSON Tree**: Real-time explorer with type badges, copy-to-path, search filters, and raw payload tabs.
- 🎙️ **Speech & Audio Quick Presets**: First-class templates for asynchronous and synchronous audio transcription (Speechmatics, Deepgram Nova-2, Groq Whisper).
- 🔐 **Zero-Trust Security Model**: Sensitive API credentials exist strictly in session memory by default and are masked in request previews and cURL exports. Optional browser-side AES-GCM encryption.
- 📦 **IndexedDB Persistence**: Request execution history (sanitized without keys), saved request collections, and dynamic environment variables (`{{BASE_URL}}`, `{{API_KEY}}`).
- 🎨 **Pure CSS Ambient Motion**: Lightweight, 60fps CSS gradient animation adapting dynamically to device hardware profiles and `prefers-reduced-motion` preferences (0 GPU shaders / 0 WebGL).
- 📱 **Adaptive Responsive Design**: Drag-resizable split panes on desktop with touch-optimized stacked views for mobile viewports.

---

## 🎛️ Workspace Modes

Apiora features two specialized workspaces accessible directly from the Request Builder header:

### 1. 💬 Prompt Matrix Mode
Tailored for conversational AI and multi-turn LLMs:
- **Role Isolation**: Add and customize `system`, `developer`, `user`, `assistant`, or custom role segments.
- **Dynamic Reordering**: Move prompt blocks up/down to test context sensitivity.
- **Real-Time Token & Character Telemetry**: Live metrics for prompt sizing.

### 2. ⚡ Raw JSON / REST Mode
Engineered for raw API experimentation, webhooks, and multimodal services:
- **Direct Headers Toolbar**: Instant header indicators with quick-add helpers (`+ Content-Type: json`, `+ Accept: json`).
- **Auto-Formatting Engine**: Press **`Ctrl + Shift + F`** or click **Format JSON** to beautify indented payloads.
- **Tab Indentation & Line Numbers**: Code-editor-like UX with 2-space soft tabs.
- **Syntax Validator**: Real-time linting with precise error position reporting.

---

## 🔌 Supported Providers & Presets

| Provider / API | Mode | Category | Streaming | Default Auth Strategy |
| :--- | :--- | :--- | :---: | :--- |
| **OpenAI Chat Completions** | Chat | Major Providers | ✅ Yes | `Bearer {{API_KEY}}` |
| **Anthropic Messages** | Chat | Major Providers | ✅ Yes | `x-api-key` + `anthropic-version` |
| **Google Gemini Generate Content** | Multimodal | Major Providers | ✅ Yes | `x-goog-api-key` header |
| **DeepSeek API (V3 / R1)** | Chat / Reasoning | OpenAI Compatible | ✅ Yes | `Bearer {{API_KEY}}` |
| **Groq Cloud LPU** | Inference | OpenAI Compatible | ✅ Yes | `Bearer {{API_KEY}}` |
| **OpenRouter Gateway** | Multi-Provider | OpenAI Compatible | ✅ Yes | `Bearer {{API_KEY}}` |
| **Mistral AI** | Chat | Major Providers | ✅ Yes | `Bearer {{API_KEY}}` |
| **Together AI** | Open Source | OpenAI Compatible | ✅ Yes | `Bearer {{API_KEY}}` |
| **Cohere Chat v2** | Enterprise | Major Providers | ❌ No | `Bearer {{API_KEY}}` |
| **Speechmatics STT (Async Job)** | Speech-to-Text | Speech & Audio | ❌ No | `Bearer {{API_KEY}}` |
| **Deepgram Nova-2 (Audio URL)** | Speech-to-Text | Speech & Audio | ❌ No | `Authorization: Token {{API_KEY}}` |
| **Groq Whisper (Audio Transcribe)** | Speech-to-Text | Speech & Audio | ❌ No | `Bearer {{API_KEY}}` |
| **Generic REST JSON** | Custom | Custom | Customizable | Customizable |

---

## 🏗 Architecture

```
apiora/
├── app/
│   ├── layout.tsx              # Root HTML, multi-device viewport & favicon metadata
│   ├── page.tsx                # Main playground orchestrator wrapper
│   ├── globals.css             # Obsidian dark design system & hardware CSS keyframes
│   └── api/
│       └── proxy/
│           └── route.ts        # SSRF-protected serverless proxy & streaming pipe
├── components/
│   ├── AmbientBackground.tsx   # Hardware-accelerated CSS ambient atmosphere
│   ├── ApiKeyInput.tsx         # Masked credential manager & auth strategy picker
│   ├── ApiTester.tsx           # Primary workspace coordinator & split-pane manager
│   ├── EndpointInput.tsx       # HTTP method selector & target URL editor
│   ├── EnvironmentManager.tsx  # Dynamic environment variable system ({{VAR}})
│   ├── HeaderEditor.tsx        # Dynamic HTTP headers table with toggle controls
│   ├── Icons.tsx               # Handcrafted lightweight SVG icons
│   ├── JsonTreeView.tsx        # Collapsible interactive JSON tree explorer
│   ├── MessageEditor.tsx       # Multi-turn prompt matrix builder
│   ├── ModelInput.tsx          # Unrestricted model ID selector
│   ├── ParameterEditor.tsx     # Query parameters & model hyperparameters
│   ├── ProviderPresetSelector.tsx # 10+ provider template selector
│   ├── RawJsonEditor.tsx       # Custom syntax-highlighted JSON editor with auto-format
│   ├── RequestHistory.tsx      # IndexedDB execution history inspector
│   ├── RequestPanel.tsx        # Request Builder with Prompt Matrix / Raw REST switch
│   ├── RequestPreview.tsx      # Real-time cURL and JavaScript fetch preview
│   ├── ResponsePanel.tsx       # Multi-tab response inspector & performance telemetry
│   ├── SavedRequests.tsx       # Reusable template collections manager
│   ├── SettingsModal.tsx       # Performance, timeout, and theme settings
│   ├── Sidebar.tsx             # Workspace navigation sidebar
│   ├── StatusIndicator.tsx     # Connection & device telemetry badge
│   ├── StreamViewer.tsx        # Live token stream renderer & raw chunk logs
│   └── TopNav.tsx              # Top navigation bar with brand logo
├── lib/
│   ├── api/
│   │   ├── presets.ts          # Provider preset definitions & sample payloads
│   │   ├── proxy-client.ts     # Client-side streaming & non-streaming dispatcher
│   │   ├── request-builder.ts  # Variable interpolation & cURL compiler
│   │   ├── ssrf.ts             # Strict SSRF IP/hostname validation engine
│   │   ├── stream-parser.ts    # SSE & NDJSON progressive parser
│   │   └── types.ts            # Strict TypeScript definitions
│   ├── performance/
│   │   └── device-profile.ts   # Device RAM, concurrency, and motion detection
│   └── storage/
│       ├── encryption.ts       # Browser AES-GCM Web Crypto API encryption
│       └── indexed-db.ts       # IndexedDB storage abstraction
└── public/
    ├── logo.png                # Official brand logo
    ├── favicon.ico             # App icon
    └── icon.png                # Progressive web icon
```

---

## 🔒 Security & SSRF Defense

Apiora includes a multi-layered security architecture:

1. **Strict SSRF Validation**: All target URLs routed through `/api/proxy` are checked against private IP ranges:
   - RFC1918 Private Subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`)
   - Loopback Addresses (`127.0.0.0/8`, `::1`, `localhost`)
   - Link-Local & Cloud Metadata IPs (`169.254.169.254`, `metadata.google.internal`)
   - Prohibited URL Schemes (Only `http:` and `https:` allowed).
2. **Credential Sanitization**: API keys are stripped before saving to local history records and masked during preview export.
3. **Session-Only Memory**: API keys are retained exclusively in active browser memory by default.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.17+ or higher
- npm, pnpm, or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/AgentNex/Apiora.git
cd Apiora
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| **`Ctrl + Enter`** / **`Cmd + Enter`** | Send API Request |
| **`Escape`** | Abort Active Stream / Cancel Request |
| **`Ctrl + Shift + F`** | Auto-Format JSON (in Raw JSON / REST mode) |
| **`Tab`** | Insert 2-space soft indentation (in JSON editor) |

---

## 🤝 Contributing

Contributions are welcome! If you'd like to add new provider presets, improve stream extractors, or optimize performance:

1. Fork the Project (`git checkout -b feature/AmazingFeature`)
2. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
3. Push to the Branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/AgentNex">AgentNex</a>. Powered by Next.js & Web Streams.</sub>
</div>
