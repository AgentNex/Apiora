'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { executeApiRequest } from '../lib/api/proxy-client';
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
  const [activeTab, setActiveTab] = useState<'playground' | 'history' | 'saved' | 'environments'>('playground');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [animationMode, setAnimationMode] = useState<'auto' | 'full' | 'reduced' | 'disabled'>('auto');
  const [timeoutSeconds, setTimeoutSeconds] = useState(60);
  const [rememberApiKeys, setRememberApiKeys] = useState(false);

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
    presetId: defaultPreset.id
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
      headers: preset.defaultHeaders.map((h, idx) => ({ id: `h_${Date.now()}_${idx}`, ...h })),
      messages: preset.defaultMessages,
      parameters: preset.defaultParameters,
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
    setMobileActiveView('response');

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

  // Keyboard Shortcuts (Ctrl/Cmd + Enter, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSendRequest();
      }
      if (e.key === 'Escape' && (isLoading || isStreamingActive)) {
        e.preventDefault();
        handleStopStreaming();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config, isLoading, isStreamingActive, activeEnvironmentId]);

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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
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
      />

      {/* Main Workspace Frame */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          historyItems={historyItems}
          savedRequests={savedRequests}
          onSelectHistoryItem={handleSelectHistoryItem}
          onSelectSavedRequest={handleSelectSavedRequest}
          onNewRequest={handleNewRequest}
        />

        {/* Main Content Area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--header-height))', overflow: 'hidden' }}>
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
              {/* Mobile View Switcher Tabs (Only displayed on smaller viewports) */}
              <div
                className="lg:hidden"
                style={{
                  display: 'flex',
                  borderBottom: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  padding: '4px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setMobileActiveView('request')}
                  className={`forge-btn ${mobileActiveView === 'request' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
                  style={{ flex: 1, padding: '6px', fontSize: '12px' }}
                >
                  Request Builder
                </button>
                <button
                  type="button"
                  onClick={() => setMobileActiveView('response')}
                  className={`forge-btn ${mobileActiveView === 'response' ? 'forge-btn-primary' : 'forge-btn-ghost'}`}
                  style={{ flex: 1, padding: '6px', fontSize: '12px' }}
                >
                  Response Viewer {response && `(${response.status})`}
                </button>
              </div>

              {/* Desktop Resizable Split Pane / Mobile Stacked Pane */}
              <div
                ref={containerRef}
                className="workspace-layout"
                style={{
                  display: 'flex',
                  flex: 1,
                  overflow: 'hidden',
                  padding: '10px',
                  gap: '8px'
                }}
              >
                {/* Left: Request Panel */}
                <div
                  style={{
                    width: `${leftPanelWidthPercent}%`,
                    height: '100%',
                    display: typeof window !== 'undefined' && window.innerWidth <= 1024 && mobileActiveView !== 'request' ? 'none' : 'flex',
                    flexDirection: 'column',
                    minWidth: '300px'
                  }}
                >
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
                </div>

                {/* Resizer Handle */}
                <div
                  onMouseDown={handleMouseDown}
                  className={`resizer-handle ${isDragging ? 'dragging' : ''}`}
                  title="Drag to resize split workspace panels"
                />

                {/* Right: Response Panel */}
                <div
                  style={{
                    flex: 1,
                    height: '100%',
                    display: typeof window !== 'undefined' && window.innerWidth <= 1024 && mobileActiveView !== 'response' ? 'none' : 'flex',
                    flexDirection: 'column',
                    minWidth: '300px'
                  }}
                >
                  <ResponsePanel
                    response={response}
                    isLoading={isLoading}
                    isStreamingActive={isStreamingActive}
                    onStopStreaming={handleStopStreaming}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

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
