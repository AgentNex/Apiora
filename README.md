<div align="center">

<img src="./logo.png" alt="Apiora Logo" width="120" height="120" style="border-radius: 24px; box-shadow: 0 12px 40px rgba(99, 102, 241, 0.35);" />

# APIORA

### The Universal AI Model API Testing, Streaming Playground & Diagnostics Laboratory

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Deployment](https://img.shields.io/badge/Vercel-Live_Production-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://api-forge-ai-ivory.vercel.app)
[![Documentation](https://img.shields.io/badge/Docs-Interactive_Portal-8b5cf6?style=for-the-badge&logo=googledocs&logoColor=white)](https://api-forge-ai-ivory.vercel.app/docs)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![SSRF Protected](https://img.shields.io/badge/Security-SSRF_Hardened-6366f1?style=for-the-badge)](https://owasp.org/www-community/attacks/Server_Side_Request_Forgery)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-06b6d4?style=for-the-badge)](https://github.com/AgentNex/Apiora/pulls)

<p align="center">
  <a href="https://api-forge-ai-ivory.vercel.app"><strong>🚀 Explore Live Playground »</strong></a>
  &nbsp;&nbsp;•&nbsp;&nbsp;
  <a href="https://api-forge-ai-ivory.vercel.app/docs"><strong>📖 Full Documentation Portal »</strong></a>
  <br />
  <br />
  <a href="#-key-features">Key Features</a> •
  <a href="#-full-documentation-portal">Documentation</a> •
  <a href="#-workspace-modes">Workspace Modes</a> •
  <a href="#-supported-providers--presets">Presets</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-security--ssrf-defense">Security</a> •
  <a href="#-license">License</a>
</p>

</div>

---

## 🌟 Overview

**Apiora** (formerly *API Forge AI*) is a high-craft, production-grade developer laboratory engineered for testing, inspecting, and benchmarking LLM and Speech/Audio model APIs. Built without heavy visual frameworks or proprietary SDK dependencies, Apiora provides native Web Streams, bidirectional formatting, SSRF-hardened serverless proxying, and pure CSS ambient motion.

> 🚀 **Live Production Application**: [https://api-forge-ai-ivory.vercel.app](https://api-forge-ai-ivory.vercel.app)  
> 📖 **Full Interactive Documentation**: [https://api-forge-ai-ivory.vercel.app/docs](https://api-forge-ai-ivory.vercel.app/docs)

---

## 📖 Full Documentation Portal

The full, interactive developer documentation portal is hosted live at **[https://api-forge-ai-ivory.vercel.app/docs](https://api-forge-ai-ivory.vercel.app/docs)** with multi-language code snippets, searchable topics, collapsible technical deep-dives, and copyable payloads.

### 📚 Documentation Chapters:
1. **[Overview & Architecture Philosophy](https://api-forge-ai-ivory.vercel.app/docs#overview)** — Universal playground vision, native Web Streams, and zero-bloat principles.
2. **[30-Second Quickstart Guide](https://api-forge-ai-ivory.vercel.app/docs#quickstart)** — Step-by-step instructions for firing your first live AI request.
3. **[Workspace Modes](https://api-forge-ai-ivory.vercel.app/docs#workspace-modes)** — Detailed guide to **Prompt Matrix** vs. **Raw JSON / REST** mode.
4. **[Supported Providers & Presets](https://api-forge-ai-ivory.vercel.app/docs#presets)** — Payloads and setup for OpenAI, Anthropic, Gemini, DeepSeek, Groq, Mistral, Together, and Cohere.
5. **[Speech & Audio STT Presets](https://api-forge-ai-ivory.vercel.app/docs#speech-audio)** — Asynchronous and synchronous voice presets for **Speechmatics**, **Deepgram Nova-2**, and **Groq Whisper**.
6. **[Real-Time Streaming Engine](https://api-forge-ai-ivory.vercel.app/docs#streaming)** — Web Streams mechanics, SSE vs NDJSON chunk parsing, TTFB, and abort cancellation.
7. **[Response Inspector & JSON Tree](https://api-forge-ai-ivory.vercel.app/docs#response-inspector)** — 6-tab response exploration, collapsible tree navigation, and path copying.
8. **[Security & SSRF Defense](https://api-forge-ai-ivory.vercel.app/docs#security)** — RFC1918 subnet filtering, cloud metadata protection (`169.254.169.254`), and client-side AES-GCM 256-bit encryption.
9. **[Dynamic Environments & Variable Interpolation](https://api-forge-ai-ivory.vercel.app/docs#environments)** — Defining and injecting `{{VARIABLE_NAME}}` across URLs, headers, and bodies.
10. **[Local Persistence & Collections](https://api-forge-ai-ivory.vercel.app/docs#indexeddb)** — IndexedDB offline database, sanitized execution history, and template folders.
11. **[Keyboard Shortcuts Reference](https://api-forge-ai-ivory.vercel.app/docs#shortcuts)** — Power user shortcuts for instant sending, formatting, and stream cancellation.
12. **[Proxy API Specification](https://api-forge-ai-ivory.vercel.app/docs#proxy-api)** — Complete schema definition for the `/api/proxy` serverless route.

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

| Provider / API | Mode | Category | Streaming |
| :--- | :--- | :--- | :---: |
| **OpenAI Chat Completions** | Chat | Major Providers | ✅ Yes |
| **Anthropic Messages** | Chat | Major Providers | ✅ Yes |
| **Google Gemini Generate Content** | Multimodal | Major Providers | ✅ Yes |
| **DeepSeek API (V3 / R1)** | Chat / Reasoning | OpenAI Compatible | ✅ Yes |
| **Groq Cloud LPU** | Inference | OpenAI Compatible | ✅ Yes |
| **OpenRouter Gateway** | Multi-Provider | OpenAI Compatible | ✅ Yes |
| **Mistral AI** | Chat | Major Providers | ✅ Yes |
| **Together AI** | Open Source | OpenAI Compatible | ✅ Yes |
| **Cohere Chat v2** | Enterprise | Major Providers | ❌ No |
| **Speechmatics STT (Async Job)** | Speech-to-Text | Speech & Audio | ❌ No |
| **Deepgram Nova-2 (Audio URL)** | Speech-to-Text | Speech & Audio | ❌ No |
| **Groq Whisper (Audio Transcribe)** | Speech-to-Text | Speech & Audio | ❌ No |
| **Generic REST JSON** | Custom | Custom | Customizable |

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
