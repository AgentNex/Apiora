'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ApiRequestConfig,
  ApiResponseData,
  Environment,
  ProviderPreset,
  RequestHistoryItem,
  SavedRequest,
  UIState
} from '../lib/api/types';
import { PROVIDER_PRESETS } from '../lib/api/presets';
import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';
import { RequestPanel } from './RequestPanel';
import { ResponsePanel } from './ResponsePanel';
import { RequestHistory } from './RequestHistory';
import { SavedRequests } from './SavedRequests';
import { EnvironmentManager } from './EnvironmentManager';
import { SettingsModal } from './SettingsModal';
import { AmbientBackground } from './AmbientBackground';
import { ErrorBoundary } from './ErrorBoundary';
import { ModelArena } from './ModelArena';
import { PipelineRunner } from './PipelineRunner';
import { CommandPalette } from './CommandPalette';
import { executeApiRequest } from '../lib/api/proxy-client';
import { calculateEstimatedCost } from '../lib/api/pricing';
import { estimateTokens } from '../lib/api/stream-parser';
import {
  addHistoryItem,
  getHistoryItems,
  deleteHistoryItem,
  clearHistory,
  getSavedRequests,
  saveRequestItem,
  deleteSavedRequest,
  getEnvironments,
  saveEnvironments,
  getSetting,
  setSetting
} from '../lib/storage/indexed-db';

export function ApiTester() {
  // Navigation & Workspace State
  const [activeTab, setActiveTab] = useState<'playground' | 'arena' | 'pipeline' | 'history' | 'saved' | 'environments'>('playground');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [animationMode, setAnimationMode] = useState<'auto' | 'full' | 'reduced' | 'disabled'>('auto');
  const [timeoutSeconds, setTimeoutSeconds] = useState(60);
  const [rememberApiKeys, setRememberApiKeys] = useState(false);

  // Session Totals
  const [sessionCost, setSessionCost] = useState(0);
  const [sessionTokens, setSessionTokens] = useState(0);

  // Environment State
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [activeEnvironmentId, setActiveEnvironmentId] = useState<string>('');

  // History & Saved Requests
  const [historyItems, setHistoryItems] = useState<RequestHistoryItem[]>([]);
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([]);

  // Split Panel Resizing (desktop)
  const [leftPanelWidthPercent, setLeftPanelWidthPercent] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active Request Configuration
  const defaultPreset = PROVIDER_PRESETS[1]; // OpenAI Chat
  const [config, setConfig] = useState<ApiRequestConfig>({
    id: 'req_init',
    method: defaultPreset.defaultMethod,
    endpoint: defaultPreset.endpointTemplate,
    modelId: defaultPreset.defaultModel,
    authType: defaultPreset.authType,
    apiKey: '',
    headers: defaultPreset.defaultHeaders.map((h, i) => ({ id: `h_${i}`, ...h })),
    queryParams: [],
    bodyMode: defaultPreset.defaultBodyMode,
    messages: defaultPreset.defaultMessages,
    parameters: defaultPreset.defaultParameters,
    customParameters: [],
    rawBody: '{\n  "model": "gpt-4o",\n  "messages": [\n    {"role": "user", "content": "Hello!"}\n  ]\n}',
    isStreaming: defaultPreset.isStreaming,
    timeoutSeconds: 60,
    presetId: defaultPreset.id,
    executionMode: 'proxy',
    retryOnFailure: false
  });

  // Active Response State
  const [response, setResponse] = useState<ApiResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreamingActive, setIsStreamingActive] = useState(false);
  const [uiState, setUiState] = useState<UIState>('idle');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Mobile View Tab (Toggle between Request & Response when screen is small)
  const [mobileActiveView, setMobileActiveView] = useState<'request' | 'response'>('request');

  // Initialize from IndexedDB
  useEffect(() => {
    async function loadInitialData() {
      try {
        const envs = await getEnvironments();
        setEnvironments(envs);
        if (envs.length > 0) setActiveEnvironmentId(envs[0].id);

        const history = await getHistoryItems(100);
        setHistoryItems(history);

        const saved = await getSavedRequests();
        setSavedRequests(saved);

        const savedTheme = await getSetting<'dark' | 'light'>('theme', 'dark');
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);

        const savedTimeout = await getSetting<number>('timeout', 60);
        setTimeoutSeconds(savedTimeout);

        const savedAnim = await getSetting<'auto' | 'full' | 'reduced' | 'disabled'>('animationMode', 'auto');
        setAnimationMode(savedAnim);
      } catch (err) {
        console.error('IndexedDB initialization warning:', err);
      }
    }
    loadInitialData();
  }, []);

  // Theme change
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    setSetting('theme', nextTheme);
  };

  // Preset switching
  const handleApplyPreset = (preset: ProviderPreset) => {
    setConfig((prev) => ({
      ...prev,
      presetId: preset.id,
      method: preset.defaultMethod,
      endpoint: preset.endpointTemplate,
      modelId: preset.defaultModel,
      authType: preset.authType,
      customAuthHeaderKey: preset.customAuthHeaderKey,
      customAuthHeaderValue: preset.customAuthHeaderValue,
      headers: preset.defaultHeaders.map((h, idx) => ({ id: `h_${Date.now()}_${idx}`, ...h })),
      messages: preset.defaultMessages,
      parameters: preset.defaultParameters,
      rawBody: preset.defaultRawBody || prev.rawBody,
      isStreaming: preset.isStreaming,
      bodyMode: preset.defaultBodyMode
    }));
  };

  // New clean request
  const handleNewRequest = () => {
    const genericPreset = PROVIDER_PRESETS[0];
    handleApplyPreset(genericPreset);
    setResponse(null);
    setUiState('idle');
    setActiveTab('playground');
    setMobileActiveView('request');
  };

  // Reopen History item
  const handleSelectHistoryItem = (item: RequestHistoryItem) => {
    setConfig((prev) => ({
      ...prev,
      ...item.config,
      apiKey: prev.apiKey // Keep active in-memory API key
    }));
    setActiveTab('playground');
    setMobileActiveView('request');
  };

  // Reopen Saved request
  const handleSelectSavedRequest = (saved: SavedRequest) => {
    setConfig((prev) => ({
      ...prev,
      ...saved.config,
      apiKey: prev.apiKey
    }));
    setActiveTab('playground');
    setMobileActiveView('request');
  };

  // Save request to collection
  const handleSaveCurrentRequest = async (name: string, collection: string) => {
    const { apiKey, ...safeConfig } = config;
    const newSaved: SavedRequest = {
      id: 'saved_' + Math.random().toString(36).substring(2, 9),
      name,
      collection,
      config: safeConfig,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await saveRequestItem(newSaved);
    const updated = await getSavedRequests();
    setSavedRequests(updated);
  };

  // Send API Request
  const handleSendRequest = async () => {
    if (isLoading || isStreamingActive) return;

    setIsLoading(true);
    setUiState('requesting');
    setResponse(null);
    setMobileActiveView('response'); // Auto-switch focus on phone

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const activeEnv = environments.find((e) => e.id === activeEnvironmentId);

    try {
      if (config.isStreaming) {
        setIsStreamingActive(true);
        setUiState('streaming');
      }

      const result = await executeApiRequest({
        config: { ...config, timeoutSeconds },
        environment: activeEnv,
        signal: controller.signal,
        onStreamEvent: (event, fullText, chunkCount, elapsedMs) => {
          setResponse((prev) => {
            const events = prev?.streamEvents ? [...prev.streamEvents, event] : [event];
            return {
              requestId: prev?.requestId || 'req_stream',
              status: 200,
              statusText: 'Streaming',
              ok: true,
              headers: prev?.headers || {},
              data: fullText,
              rawText: fullText,
              sizeBytes: new Blob([fullText]).size,
              durationMs: elapsedMs,
              ttfbMs: prev?.ttfbMs || elapsedMs,
              chunkCount,
              isStream: true,
              streamEvents: events,
              timestamp: Date.now()
            };
          });
        }
      });

      setResponse(result);
      setUiState(result.ok ? 'success' : 'error');

      // Update session totals
      const outTokens = estimateTokens(typeof result.data === 'object' ? JSON.stringify(result.data) : result.rawText || '');
      const inTokens = estimateTokens(config.bodyMode === 'raw' ? config.rawBody : config.messages.map(m => m.content).join(' '));
      const costCalc = calculateEstimatedCost(inTokens, outTokens, config.modelId);
      setSessionCost((prev) => prev + costCalc.totalCost);
      setSessionTokens((prev) => prev + inTokens + outTokens);

      // Save to History (API Key sanitized)
      const { apiKey, ...safeConfig } = config;
      const historyRecord: RequestHistoryItem = {
        id: result.requestId,
        timestamp: Date.now(),
        method: config.method,
        endpoint: config.endpoint,
        modelId: config.modelId,
        status: result.status,
        durationMs: result.durationMs,
        sizeBytes: result.sizeBytes,
        isStream: result.isStream,
        config: safeConfig,
        responseSummary: {
          status: result.status,
          statusText: result.statusText,
          durationMs: result.durationMs,
          sizeBytes: result.sizeBytes,
          error: result.error
        }
      };

      await addHistoryItem(historyRecord);
      const updatedHistory = await getHistoryItems(100);
      setHistoryItems(updatedHistory);
    } catch (err: any) {
      setUiState('error');
      setResponse({
        requestId: 'req_err',
        status: 0,
        statusText: 'Execution Error',
        ok: false,
        headers: {},
        data: null,
        rawText: err.message || 'Unknown execution error',
        sizeBytes: 0,
        durationMs: 0,
        isStream: false,
        error: err.message || 'Failed to send request',
        timestamp: Date.now()
      });
    } finally {
      setIsLoading(false);
      setIsStreamingActive(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreamingActive(false);
      setIsLoading(false);
      setUiState('idle');
    }
  };

  // Keyboard Shortcuts (Ctrl/Cmd + Enter, Cmd+K, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSendRequest();
      }
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
        } else if (isLoading || isStreamingActive) {
          e.preventDefault();
          handleStopStreaming();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config, isLoading, isStreamingActive, activeEnvironmentId, isCommandPaletteOpen]);

  // Split Panel Dragging
  const handleMouseDown = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newPercent = ((e.clientX - rect.left) / rect.width) * 100;
      if (newPercent >= 25 && newPercent <= 75) {
        setLeftPanelWidthPercent(newPercent);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const activeEnv = environments.find((e) => e.id === activeEnvironmentId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', width: '100dvw', overflow: 'hidden' }}>
      {/* CSS-Only Ambient Background */}
      <AmbientBackground uiState={uiState} overrideAnimationLevel={animationMode} />

      {/* Top Navigation */}
      <TopNav
        environments={environments}
        activeEnvironmentId={activeEnvironmentId}
        onSelectEnvironment={setActiveEnvironmentId}
        onNewRequest={handleNewRequest}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenEnvironments={() => setActiveTab('environments')}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onToggleMobileDrawer={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        sessionCost={sessionCost}
        sessionTokens={sessionTokens}
      />

      {/* Main Workspace Frame */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        {/* Sidebar (Desktop Rail / Mobile Slide-Over Drawer) */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          historyItems={historyItems}
          savedRequests={savedRequests}
          onSelectHistoryItem={handleSelectHistoryItem}
          onSelectSavedRequest={handleSelectSavedRequest}
          onNewRequest={handleNewRequest}
          isMobileDrawerOpen={isMobileDrawerOpen}
          onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
        />

        {/* Main Content Area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100dvh - var(--header-height))', overflow: 'hidden' }}>
          {activeTab === 'arena' && (
            <ModelArena environment={activeEnv} />
          )}

          {activeTab === 'pipeline' && (
            <PipelineRunner environment={activeEnv} />
          )}

          {activeTab === 'history' && (
            <RequestHistory
              historyItems={historyItems}
              onSelectHistoryItem={handleSelectHistoryItem}
              onDeleteHistoryItem={async (id) => {
                await deleteHistoryItem(id);
                setHistoryItems(await getHistoryItems(100));
              }}
              onClearHistory={async () => {
                await clearHistory();
                setHistoryItems([]);
              }}
            />
          )}

          {activeTab === 'saved' && (
            <SavedRequests
              savedRequests={savedRequests}
              onSelectSavedRequest={handleSelectSavedRequest}
              onSaveCurrentRequest={handleSaveCurrentRequest}
              onDeleteSavedRequest={async (id) => {
                await deleteSavedRequest(id);
                setSavedRequests(await getSavedRequests());
              }}
              currentConfig={config}
            />
          )}

          {activeTab === 'environments' && (
            <EnvironmentManager
              environments={environments}
              activeEnvironmentId={activeEnvironmentId}
              onSelectEnvironment={setActiveEnvironmentId}
              onSaveEnvironments={async (envs) => {
                await saveEnvironments(envs);
                setEnvironments(envs);
              }}
            />
          )}

          {activeTab === 'playground' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              {/* Mobile View Switcher (Segmented Control for <1024px) */}
              <div className="mobile-view-switcher">
                <button
                  type="button"
                  onClick={() => setMobileActiveView('request')}
                  className={`forge-btn ${mobileActiveView === 'request' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
                  style={{ flex: 1, padding: '7px', fontSize: '12px' }}
                >
                  Request Builder
                </button>
                <button
                  type="button"
                  onClick={() => setMobileActiveView('response')}
                  className={`forge-btn ${mobileActiveView === 'response' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
                  style={{ flex: 1, padding: '7px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <span>Response Viewer</span>
                  {response && (
                    <span
                      style={{
                        fontSize: '10.5px',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        background: response.ok ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                        color: response.ok ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      {response.status}
                    </span>
                  )}
                </button>
              </div>

              {/* Desktop Resizable Split Pane / Mobile Stacked Single-View */}
              <div
                ref={containerRef}
                className="workspace-layout"
                style={{
                  display: 'flex',
                  flex: 1,
                  overflow: 'hidden',
                  padding: '8px',
                  gap: '8px'
                }}
              >
                {/* Left: Request Panel */}
                <div
                  className={mobileActiveView === 'request' ? 'workspace-panel-mobile-visible' : 'workspace-panel-mobile-hidden'}
                  style={{
                    width: `${leftPanelWidthPercent}%`,
                    height: '100%',
                    flexDirection: 'column',
                    minWidth: '280px'
                  }}
                >
                  <ErrorBoundary fallbackTitle="Request Builder Error">
                    <RequestPanel
                      config={config}
                      onChangeConfig={setConfig}
                      environment={activeEnv}
                      onApplyPreset={handleApplyPreset}
                      onSendRequest={handleSendRequest}
                      onStopStreaming={handleStopStreaming}
                      isLoading={isLoading}
                      isStreamingActive={isStreamingActive}
                    />
                  </ErrorBoundary>
                </div>

                {/* Resizer Handle */}
                <div
                  onMouseDown={handleMouseDown}
                  className={`resizer-handle ${isDragging ? 'dragging' : ''}`}
                  title="Drag to resize split workspace panels"
                />

                {/* Right: Response Panel */}
                <div
                  className={mobileActiveView === 'response' ? 'workspace-panel-mobile-visible' : 'workspace-panel-mobile-hidden'}
                  style={{
                    flex: 1,
                    height: '100%',
                    flexDirection: 'column',
                    minWidth: '280px'
                  }}
                >
                  <ErrorBoundary fallbackTitle="Response Viewer Error">
                    <ResponsePanel
                      response={response}
                      isLoading={isLoading}
                      isStreamingActive={isStreamingActive}
                      onStopStreaming={handleStopStreaming}
                    />
                  </ErrorBoundary>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectPreset={handleApplyPreset}
        onNavigate={setActiveTab}
        onToggleTheme={handleToggleTheme}
        onSendRequest={handleSendRequest}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onChangeTheme={(t) => {
          setTheme(t);
          document.documentElement.setAttribute('data-theme', t);
          setSetting('theme', t);
        }}
        timeoutSeconds={timeoutSeconds}
        onChangeTimeoutSeconds={(s) => {
          setTimeoutSeconds(s);
          setSetting('timeout', s);
        }}
        rememberApiKeys={rememberApiKeys}
        onChangeRememberApiKeys={setRememberApiKeys}
        animationMode={animationMode}
        onChangeAnimationMode={(m) => {
          setAnimationMode(m);
          setSetting('animationMode', m);
        }}
        onClearAllData={async () => {
          await clearHistory();
          setHistoryItems([]);
          alert('Database caches reset successfully.');
          setIsSettingsOpen(false);
        }}
      />
    </div>
  );
}
