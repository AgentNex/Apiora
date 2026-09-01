import os

BASE_DIR = "/data/data/com.termux/files/home/api-forge-ai"

files = {}

# 1. components/AmbientBackground.tsx
files["components/AmbientBackground.tsx"] = '''\'use client\';

import React, { useEffect, useState, memo } from \'react\';
import { DeviceProfile, UIState } from \'../lib/api/types\';
import { getDeviceProfile, subscribeToDeviceChanges } from \'../lib/performance/device-profile\';

interface AmbientBackgroundProps {
  uiState?: UIState;
  overrideAnimationLevel?: \'full\' | \'reduced\' | \'disabled\' | \'auto\';
}

function AmbientBackgroundComponent({
  uiState = \'idle\',
  overrideAnimationLevel = \'auto\'
}: AmbientBackgroundProps) {
  const [profile, setProfile] = useState<DeviceProfile>({
    prefersReducedMotion: false,
    isLowPower: false,
    animationLevel: \'full\'
  });
  const [isTabVisible, setIsTabVisible] = useState(true);

  useEffect(() => {
    try {
      setProfile(getDeviceProfile());
      const unsub = subscribeToDeviceChanges(setProfile);

      const handleVisibilityChange = () => {
        setIsTabVisible(document.visibilityState === \'visible\');
      };
      document.addEventListener(\'visibilitychange\', handleVisibilityChange);

      return () => {
        unsub();
        document.removeEventListener(\'visibilitychange\', handleVisibilityChange);
      };
    } catch {
      // Graceful fallback
    }
  }, []);

  const activeLevel =
    overrideAnimationLevel !== \'auto\'
      ? overrideAnimationLevel
      : profile.animationLevel;

  if (activeLevel === \'disabled\' || !isTabVisible) {
    return (
      <div
        className="ambient-base disabled-animation"
        aria-hidden="true"
        style={{ background: \'var(--bg-canvas)\' }}
      />
    );
  }

  const stateClass = `ambient-state-${uiState}`;
  const perfClass = activeLevel === \'reduced\' ? \'reduced-animation\' : \'\';

  return (
    <div
      className={`ambient-base ${stateClass} ${perfClass}`}
      aria-hidden="true"
    >
      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />
      <div className="ambient-orb ambient-orb-3" />
    </div>
  );
}

export const AmbientBackground = memo(AmbientBackgroundComponent);
'''

# 2. components/StatusIndicator.tsx
files["components/StatusIndicator.tsx"] = '''\'use client\';

import React, { useState, useEffect } from \'react\';
import { ActivityIcon, ShieldIcon } from \'./Icons\';
import { DeviceProfile } from \'../lib/api/types\';
import { getDeviceProfile, subscribeToDeviceChanges } from \'../lib/performance/device-profile\';

interface StatusIndicatorProps {
  activeEnvironmentName?: string;
  onOpenSettings?: () => void;
  onOpenEnvironments?: () => void;
}

export function StatusIndicator({
  activeEnvironmentName = \'Development\',
  onOpenSettings,
  onOpenEnvironments
}: StatusIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [profile, setProfile] = useState<DeviceProfile>({
    prefersReducedMotion: false,
    isLowPower: false,
    animationLevel: \'full\'
  });

  useEffect(() => {
    setIsOnline(navigator.onLine);
    setProfile(getDeviceProfile());

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener(\'online\', handleOnline);
    window.addEventListener(\'offline\', handleOffline);
    const unsub = subscribeToDeviceChanges(setProfile);

    return () => {
      window.removeEventListener(\'online\', handleOnline);
      window.removeEventListener(\'offline\', handleOffline);
      unsub();
    };
  }, []);

  return (
    <div style={{ display: \'flex\', alignItems: \'center\', gap: \'10px\' }}>
      {/* Network / Proxy Status */}
      <div
        title={isOnline ? \'Connected to Proxy Gateway\' : \'Offline\'}
        style={{
          display: \'flex\',
          alignItems: \'center\',
          gap: \'6px\',
          padding: \'4px 8px\',
          borderRadius: \'6px\',
          background: \'var(--bg-card)\',
          border: \'1px solid var(--border-subtle)\',
          fontSize: \'12px\',
          color: \'var(--text-secondary)\'
        }}
      >
        <span
          style={{
            width: \'7px\',
            height: \'7px\',
            borderRadius: \'50%\',
            background: isOnline ? \'var(--accent-emerald)\' : \'var(--accent-rose)\',
            boxShadow: isOnline ? \'0 0 8px var(--accent-emerald)\' : \'none\'
          }}
        />
        <span style={{ fontWeight: 500 }}>{isOnline ? \'Proxy Ready\' : \'Offline\'}</span>
      </div>

      {/* Active Environment Chip */}
      <button
        onClick={onOpenEnvironments}
        title="Active Environment. Click to switch or edit."
        className="forge-btn forge-btn-ghost"
        style={{
          padding: \'4px 8px\',
          fontSize: \'12px\',
          color: \'var(--text-secondary)\',
          border: \'1px solid var(--border-subtle)\',
          borderRadius: \'6px\'
        }}
      >
        <ShieldIcon size={13} style={{ color: \'var(--accent-cyan)\' }} />
        <span>{activeEnvironmentName}</span>
      </button>

      {/* Device Capability Badge */}
      <button
        onClick={onOpenSettings}
        title={`Device Performance: ${profile.animationLevel.toUpperCase()} motion. Click to adjust settings.`}
        className="forge-btn forge-btn-ghost"
        style={{
          padding: \'4px 8px\',
          fontSize: \'11px\',
          color: profile.isLowPower ? \'var(--accent-amber)\' : \'var(--text-muted)\',
          border: \'1px solid var(--border-subtle)\',
          borderRadius: \'6px\'
        }}
      >
        <ActivityIcon size={13} />
        <span>{profile.animationLevel === \'full\' ? \'60 FPS UI\' : profile.animationLevel === \'reduced\' ? \'Eco Mode\' : \'Static\'}</span>
      </button>
    </div>
  );
}
'''

# 3. components/TopNav.tsx
files["components/TopNav.tsx"] = '''\'use client\';

import React from \'react\';
import { ForgeLogo, SettingsIcon, SunIcon, MoonIcon, PlusIcon, BookmarkIcon, HistoryIcon, ShieldIcon } from \'./Icons\';
import { StatusIndicator } from \'./StatusIndicator\';
import { Environment } from \'../lib/api/types\';

interface TopNavProps {
  environments: Environment[];
  activeEnvironmentId: string;
  onSelectEnvironment: (id: string) => void;
  onNewRequest: () => void;
  onOpenSettings: () => void;
  onOpenEnvironments: () => void;
  theme: \'dark\' | \'light\';
  onToggleTheme: () => void;
  activeTab: \'playground\' | \'history\' | \'saved\' | \'environments\';
  onSelectTab: (tab: \'playground\' | \'history\' | \'saved\' | \'environments\') => void;
}

export function TopNav({
  environments,
  activeEnvironmentId,
  onSelectEnvironment,
  onNewRequest,
  onOpenSettings,
  onOpenEnvironments,
  theme,
  onToggleTheme,
  activeTab,
  onSelectTab
}: TopNavProps) {
  const activeEnv = environments.find((e) => e.id === activeEnvironmentId) || environments[0];

  return (
    <header
      style={{
        height: \'var(--header-height)\',
        display: \'flex\',
        alignItems: \'center\',
        justifyContent: \'space-between\',
        padding: \'0 16px\',
        background: \'var(--bg-surface)\',
        borderBottom: \'1px solid var(--border-subtle)\',
        position: \'relative\',
        zIndex: 20
      }}
    >
      {/* Brand & Workspace Title */}
      <div style={{ display: \'flex\', alignItems: \'center\', gap: \'14px\' }}>
        <div
          onClick={() => onSelectTab(\'playground\')}
          style={{ display: \'flex\', alignItems: \'center\', gap: \'10px\', cursor: \'pointer\' }}
        >
          <ForgeLogo size={28} />
          <div>
            <div style={{ display: \'flex\', alignItems: \'center\', gap: \'6px\' }}>
              <span style={{ fontWeight: 700, fontSize: \'15px\', letterSpacing: \'-0.02em\', color: \'var(--text-primary)\' }}>
                API FORGE
              </span>
              <span
                style={{
                  fontSize: \'10px\',
                  fontWeight: 700,
                  padding: \'1px 5px\',
                  borderRadius: \'4px\',
                  background: \'linear-gradient(135deg, #6366f1, #06b6d4)\',
                  color: \'#ffffff\',
                  letterSpacing: \'0.05em\'
                }}
              >
                AI
              </span>
            </div>
            <div style={{ fontSize: \'10px\', color: \'var(--text-muted)\', marginTop: \'-2px\' }}>
              Universal Model Laboratory
            </div>
          </div>
        </div>

        <div style={{ width: \'1px\', height: \'20px\', background: \'var(--border-subtle)\', margin: \'0 4px\' }} />

        {/* Navigation Tabs for Mobile / Desktop */}
        <div style={{ display: \'flex\', alignItems: \'center\', gap: \'4px\' }}>
          <button
            onClick={() => onSelectTab(\'playground\')}
            className={`forge-btn ${activeTab === \'playground\' ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
            style={{ padding: \'5px 10px\', fontSize: \'12.5px\' }}
          >
            Playground
          </button>
          <button
            onClick={() => onSelectTab(\'history\')}
            className={`forge-btn ${activeTab === \'history\' ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
            style={{ padding: \'5px 10px\', fontSize: \'12.5px\' }}
          >
            <HistoryIcon size={14} />
            <span className="hidden sm:inline">History</span>
          </button>
          <button
            onClick={() => onSelectTab(\'saved\')}
            className={`forge-btn ${activeTab === \'saved\' ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
            style={{ padding: \'5px 10px\', fontSize: \'12.5px\' }}
          >
            <BookmarkIcon size={14} />
            <span className="hidden sm:inline">Saved</span>
          </button>
          <button
            onClick={() => onSelectTab(\'environments\')}
            className={`forge-btn ${activeTab === \'environments\' ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
            style={{ padding: \'5px 10px\', fontSize: \'12.5px\' }}
          >
            <ShieldIcon size={14} />
            <span className="hidden sm:inline">Environments</span>
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: \'flex\', alignItems: \'center\', gap: \'8px\' }}>
        {/* New Request Button */}
        <button
          onClick={onNewRequest}
          className="forge-btn"
          style={{
            padding: \'6px 12px\',
            fontSize: \'12px\',
            background: \'var(--bg-card)\',
            border: \'1px solid var(--border-medium)\'
          }}
          title="Create a fresh blank request"
        >
          <PlusIcon size={14} style={{ color: \'var(--accent-primary)\' }} />
          <span>New</span>
        </button>

        {/* Environment Selector Dropdown */}
        <select
          value={activeEnvironmentId}
          onChange={(e) => onSelectEnvironment(e.target.value)}
          className="forge-select"
          style={{ padding: \'5px 10px\', fontSize: \'12px\', minWidth: \'120px\' }}
          title="Select Active Environment"
        >
          {environments.map((env) => (
            <option key={env.id} value={env.id}>
              {env.name}
            </option>
          ))}
        </select>

        {/* Status indicator */}
        <div className="hidden md:flex">
          <StatusIndicator
            activeEnvironmentName={activeEnv?.name}
            onOpenSettings={onOpenSettings}
            onOpenEnvironments={onOpenEnvironments}
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="forge-btn forge-btn-ghost"
          style={{ padding: \'7px\', borderRadius: \'6px\' }}
          title={`Switch to ${theme === \'dark\' ? \'Light\' : \'Dark\'} Theme`}
        >
          {theme === \'dark\' ? <SunIcon size={15} /> : <MoonIcon size={15} />}
        </button>

        {/* Settings Modal Button */}
        <button
          onClick={onOpenSettings}
          className="forge-btn forge-btn-ghost"
          style={{ padding: \'7px\', borderRadius: \'6px\' }}
          title="Application Settings"
        >
          <SettingsIcon size={15} />
        </button>
      </div>
    </header>
  );
}
'''

# 4. components/Sidebar.tsx
files["components/Sidebar.tsx"] = '''\'use client\';

import React from \'react\';
import {
  CodeIcon,
  HistoryIcon,
  BookmarkIcon,
  ShieldIcon,
  SparklesIcon,
  LayersIcon,
  ActivityIcon
} from \'./Icons\';
import { RequestHistoryItem, SavedRequest } from \'../lib/api/types\';

interface SidebarProps {
  activeTab: \'playground\' | \'history\' | \'saved\' | \'environments\';
  onSelectTab: (tab: \'playground\' | \'history\' | \'saved\' | \'environments\') => void;
  historyItems: RequestHistoryItem[];
  savedRequests: SavedRequest[];
  onSelectHistoryItem: (item: RequestHistoryItem) => void;
  onSelectSavedRequest: (saved: SavedRequest) => void;
  onNewRequest: () => void;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  historyItems,
  savedRequests,
  onSelectHistoryItem,
  onSelectSavedRequest,
  onNewRequest
}: SidebarProps) {
  return (
    <aside
      style={{
        width: \'var(--sidebar-width)\',
        background: \'var(--bg-surface)\',
        borderRight: \'1px solid var(--border-subtle)\',
        display: \'flex\',
        flexDirection: \'column\',
        height: \'calc(100vh - var(--header-height))\',
        overflowY: \'auto\',
        zIndex: 10
      }}
    >
      {/* Navigation section */}
      <div style={{ padding: \'12px\', display: \'flex\', flexDirection: \'column\', gap: \'4px\' }}>
        <button
          onClick={() => onSelectTab(\'playground\')}
          className={`forge-btn ${activeTab === \'playground\' ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
          style={{ justifyContent: \'flex-start\', width: \'100%\', padding: \'8px 12px\' }}
        >
          <CodeIcon size={15} />
          <span>Playground</span>
        </button>

        <button
          onClick={() => onSelectTab(\'history\')}
          className={`forge-btn ${activeTab === \'history\' ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
          style={{ justifyContent: \'flex-start\', width: \'100%\', padding: \'8px 12px\' }}
        >
          <HistoryIcon size={15} />
          <span>History</span>
          <span
            style={{
              marginLeft: \'auto\',
              fontSize: \'11px\',
              background: \'rgba(255,255,255,0.08)\',
              padding: \'1px 6px\',
              borderRadius: \'999px\'
            }}
          >
            {historyItems.length}
          </span>
        </button>

        <button
          onClick={() => onSelectTab(\'saved\')}
          className={`forge-btn ${activeTab === \'saved\' ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
          style={{ justifyContent: \'flex-start\', width: \'100%\', padding: \'8px 12px\' }}
        >
          <BookmarkIcon size={15} />
          <span>Saved Collections</span>
          <span
            style={{
              marginLeft: \'auto\',
              fontSize: \'11px\',
              background: \'rgba(255,255,255,0.08)\',
              padding: \'1px 6px\',
              borderRadius: \'999px\'
            }}
          >
            {savedRequests.length}
          </span>
        </button>

        <button
          onClick={() => onSelectTab(\'environments\')}
          className={`forge-btn ${activeTab === \'environments\' ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
          style={{ justifyContent: \'flex-start\', width: \'100%\', padding: \'8px 12px\' }}
        >
          <ShieldIcon size={15} />
          <span>Environments</span>
        </button>
      </div>

      <div style={{ height: \'1px\', background: \'var(--border-subtle)\', margin: \'0 12px\' }} />

      {/* Quick Recent History List */}
      <div style={{ flex: 1, padding: \'12px\', overflowY: \'auto\' }}>
        <div
          style={{
            fontSize: \'11px\',
            fontWeight: 600,
            textTransform: \'uppercase\',
            color: \'var(--text-muted)\',
            letterSpacing: \'0.05em\',
            marginBottom: \'8px\',
            display: \'flex\',
            alignItems: \'center\',
            justifyContent: \'space-between\'
          }}
        >
          <span>Recent Activity</span>
          <button
            onClick={() => onSelectTab(\'history\')}
            style={{ background: \'none\', border: \'none\', color: \'var(--accent-primary)\', cursor: \'pointer\', fontSize: \'11px\' }}
          >
            View all
          </button>
        </div>

        {historyItems.length === 0 ? (
          <div
            style={{
              padding: \'16px 8px\',
              textAlign: \'center\',
              color: \'var(--text-muted)\',
              fontSize: \'12px\'
            }}
          >
            No requests executed yet.
          </div>
        ) : (
          <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'6px\' }}>
            {historyItems.slice(0, 8).map((item) => {
              const isSuccess = item.status >= 200 && item.status < 300;
              const isClientError = item.status >= 400 && item.status < 500;

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectHistoryItem(item)}
                  className="glass-card"
                  style={{
                    padding: \'8px 10px\',
                    cursor: \'pointer\',
                    display: \'flex\',
                    flexDirection: \'column\',
                    gap: \'4px\'
                  }}
                >
                  <div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'space-between\' }}>
                    <span className={`forge-badge method-badge-${item.method.toLowerCase()}`} style={{ fontSize: \'9.5px\', padding: \'1px 5px\' }}>
                      {item.method}
                    </span>
                    <span
                      style={{
                        fontSize: \'10.5px\',
                        fontWeight: 600,
                        color: isSuccess ? \'var(--accent-emerald)\' : isClientError ? \'var(--accent-amber)\' : \'var(--accent-rose)\'
                      }}
                    >
                      {item.status || \'ERR\'}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: \'11.5px\',
                      color: \'var(--text-primary)\',
                      whiteSpace: \'nowrap\',
                      overflow: \'hidden\',
                      textOverflow: \'ellipsis\',
                      fontFamily: \'var(--font-mono)\'
                    }}
                    title={item.endpoint}
                  >
                    {item.endpoint.replace(/^https?:\/\//, \'\')}
                  </div>
                  <div style={{ display: \'flex\', justifyContent: \'space-between\', fontSize: \'10px\', color: \'var(--text-muted)\' }}>
                    <span>{item.modelId || \'generic\'}</span>
                    <span>{item.durationMs}ms</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Security notice footer */}
      <div
        style={{
          padding: \'10px 12px\',
          background: \'rgba(0, 0, 0, 0.2)\',
          borderTop: \'1px solid var(--border-subtle)\',
          fontSize: \'11px\',
          color: \'var(--text-muted)\',
          lineHeight: \'1.4\'
        }}
      >
        <div style={{ display: \'flex\', alignItems: \'center\', gap: \'4px\', color: \'var(--accent-cyan)\', fontWeight: 600, marginBottom: \'2px\' }}>
          <ShieldIcon size={12} />
          <span>Local Security Policy</span>
        </div>
        API keys are kept in session memory by default and never stored in history logs.
      </div>
    </aside>
  );
}
'''

# 5. components/ProviderPresetSelector.tsx
files["components/ProviderPresetSelector.tsx"] = '''\'use client\';

import React, { useState } from \'react\';
import { PROVIDER_PRESETS } from \'../lib/api/presets\';
import { ProviderPreset } from \'../lib/api/types\';
import { SparklesIcon, ChevronDownIcon, CheckIcon } from \'./Icons\';

interface ProviderPresetSelectorProps {
  activePresetId?: string;
  onApplyPreset: (preset: ProviderPreset) => void;
}

export function ProviderPresetSelector({
  activePresetId,
  onApplyPreset
}: ProviderPresetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activePreset = PROVIDER_PRESETS.find((p) => p.id === activePresetId) || PROVIDER_PRESETS[0];

  return (
    <div style={{ position: \'relative\' }}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="forge-btn"
        style={{
          background: \'var(--bg-card)\',
          border: \'1px solid var(--border-subtle)\',
          padding: \'7px 12px\',
          display: \'flex\',
          alignItems: \'center\',
          gap: \'8px\'
        }}
      >
        <SparklesIcon size={14} style={{ color: \'var(--accent-primary)\' }} />
        <span style={{ fontWeight: 600, color: \'var(--text-primary)\', fontSize: \'12.5px\' }}>
          Preset: {activePreset.name}
        </span>
        <ChevronDownIcon size={13} style={{ color: \'var(--text-muted)\' }} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{ position: \'fixed\', inset: 0, zIndex: 40 }}
          />
          <div
            className="glass-panel"
            style={{
              position: \'absolute\',
              top: \'calc(100% + 6px)\',
              left: 0,
              width: \'340px\',
              maxHeight: \'400px\',
              overflowY: \'auto\',
              padding: \'8px\',
              zIndex: 50,
              boxShadow: \'0 12px 36px rgba(0, 0, 0, 0.45)\'
            }}
          >
            <div
              style={{
                fontSize: \'11px\',
                fontWeight: 600,
                color: \'var(--text-muted)\',
                padding: \'4px 8px\',
                textTransform: \'uppercase\',
                letterSpacing: \'0.05em\'
              }}
            >
              Choose Model Endpoint Preset
            </div>

            <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'4px\', marginTop: \'4px\' }}>
              {PROVIDER_PRESETS.map((preset) => {
                const isSelected = preset.id === activePresetId;

                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onApplyPreset(preset);
                      setIsOpen(false);
                    }}
                    style={{
                      display: \'flex\',
                      flexDirection: \'column\',
                      gap: \'2px\',
                      padding: \'8px 10px\',
                      borderRadius: \'6px\',
                      border: isSelected ? \'1px solid var(--border-accent)\' : \'1px solid transparent\',
                      background: isSelected ? \'rgba(99, 102, 241, 0.12)\' : \'transparent\',
                      cursor: \'pointer\',
                      textAlign: \'left\',
                      transition: \'background 0.12s ease\'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = \'rgba(255, 255, 255, 0.05)\';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = \'transparent\';
                    }}
                  >
                    <div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'space-between\' }}>
                      <span style={{ fontSize: \'13px\', fontWeight: 600, color: isSelected ? \'var(--accent-primary)\' : \'var(--text-primary)\' }}>
                        {preset.name}
                      </span>
                      {isSelected && <CheckIcon size={14} style={{ color: \'var(--accent-primary)\' }} />}
                    </div>
                    <span style={{ fontSize: \'11px\', color: \'var(--text-muted)\', lineHeight: \'1.3\' }}>
                      {preset.description}
                    </span>
                    <span style={{ fontSize: \'10.5px\', color: \'var(--accent-cyan)\', fontFamily: \'var(--font-mono)\', marginTop: \'2px\' }}>
                      {preset.defaultModel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
'''

# 6. components/EndpointInput.tsx
files["components/EndpointInput.tsx"] = '''\'use client\';

import React from \'react\';
import { HttpMethod } from \'../lib/api/types\';
import { GlobeIcon, XIcon } from \'./Icons\';

interface EndpointInputProps {
  method: HttpMethod;
  onChangeMethod: (method: HttpMethod) => void;
  endpoint: string;
  onChangeEndpoint: (endpoint: string) => void;
}

const METHODS: HttpMethod[] = [\'GET\', \'POST\', \'PUT\', \'PATCH\', \'DELETE\'];

export function EndpointInput({
  method,
  onChangeMethod,
  endpoint,
  onChangeEndpoint
}: EndpointInputProps) {
  let isInvalidUrl = false;
  if (endpoint.trim() && !endpoint.includes(\'{{\')) {
    try {
      new URL(endpoint.trim());
    } catch {
      isInvalidUrl = true;
    }
  }

  return (
    <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'4px\', flex: 1 }}>
      <div
        style={{
          display: \'flex\',
          alignItems: \'center\',
          background: \'var(--bg-input)\',
          border: isInvalidUrl ? \'1px solid var(--accent-rose)\' : \'1px solid var(--border-subtle)\',
          borderRadius: \'8px\',
          overflow: \'hidden\',
          boxShadow: \'inset 0 1px 2px rgba(0,0,0,0.2)\'
        }}
      >
        {/* Method Selector */}
        <select
          value={method}
          onChange={(e) => onChangeMethod(e.target.value as HttpMethod)}
          style={{
            background: \'var(--bg-card)\',
            border: \'none\',
            borderRight: \'1px solid var(--border-subtle)\',
            color: \'var(--text-primary)\',
            fontWeight: 700,
            fontSize: \'12.5px\',
            padding: \'10px 14px\',
            cursor: \'pointer\',
            outline: \'none\'
          }}
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        {/* URL Input */}
        <div style={{ display: \'flex\', alignItems: \'center\', flex: 1, padding: \'0 12px\', gap: \'8px\' }}>
          <GlobeIcon size={15} style={{ color: \'var(--text-muted)\', flexShrink: 0 }} />
          <input
            type="text"
            value={endpoint}
            onChange={(e) => onChangeEndpoint(e.target.value)}
            placeholder="https://api.openai.com/v1/chat/completions or {{BASE_URL}}/chat"
            className="forge-input-mono"
            style={{
              flex: 1,
              background: \'transparent\',
              border: \'none\',
              outline: \'none\',
              color: \'var(--text-primary)\',
              fontSize: \'13px\',
              padding: \'9px 0\'
            }}
          />
          {endpoint && (
            <button
              onClick={() => onChangeEndpoint(\'\')}
              style={{ background: \'none\', border: \'none\', color: \'var(--text-muted)\', cursor: \'pointer\', padding: \'4px\' }}
              title="Clear Endpoint"
            >
              <XIcon size={14} />
            </button>
          )}
        </div>
      </div>

      {isInvalidUrl && (
        <span style={{ fontSize: \'11px\', color: \'var(--accent-rose)\', marginLeft: \'4px\' }}>
          Please enter a valid HTTP/HTTPS URL or use an environment variable (e.g. &#123;&#123;BASE_URL&#125;&#125;).
        </span>
      )}
    </div>
  );
}
'''

# 7. components/ApiKeyInput.tsx
files["components/ApiKeyInput.tsx"] = '''\'use client\';

import React, { useState } from \'react\';
import { AuthType } from \'../lib/api/types\';
import { KeyIcon, EyeIcon, EyeOffIcon, CopyIcon, CheckIcon, XIcon, ShieldIcon } from \'./Icons\';

interface ApiKeyInputProps {
  authType: AuthType;
  onChangeAuthType: (type: AuthType) => void;
  apiKey: string;
  onChangeApiKey: (key: string) => void;
  customAuthHeaderKey?: string;
  onChangeCustomAuthHeaderKey?: (key: string) => void;
  customAuthQueryKey?: string;
  onChangeCustomAuthQueryKey?: (key: string) => void;
}

export function ApiKeyInput({
  authType,
  onChangeAuthType,
  apiKey,
  onChangeApiKey,
  customAuthHeaderKey = \'x-goog-api-key\',
  onChangeCustomAuthHeaderKey,
  customAuthQueryKey = \'key\',
  onChangeCustomAuthQueryKey
}: ApiKeyInputProps) {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="glass-card" style={{ padding: \'12px\', display: \'flex\', flexDirection: \'column\', gap: \'10px\' }}>
      <div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'space-between\' }}>
        <div style={{ display: \'flex\', alignItems: \'center\', gap: \'6px\', fontSize: \'12px\', fontWeight: 600, color: \'var(--text-secondary)\' }}>
          <KeyIcon size={14} style={{ color: \'var(--accent-amber)\' }} />
          <span>Authentication Strategy</span>
        </div>
        <div style={{ display: \'flex\', alignItems: \'center\', gap: \'4px\', fontSize: \'11px\', color: \'var(--text-muted)\' }}>
          <ShieldIcon size={12} style={{ color: \'var(--accent-emerald)\' }} />
          <span>Masked in Session</span>
        </div>
      </div>

      <div style={{ display: \'grid\', gridTemplateColumns: \'repeat(auto-fit, minmax(130px, 1fr))\', gap: \'6px\' }}>
        {[
          { id: \'bearer\', label: \'Bearer Token\' },
          { id: \'x-api-key\', label: \'x-api-key\' },
          { id: \'custom-header\', label: \'Custom Header\' },
          { id: \'query-param\', label: \'Query Param\' },
          { id: \'none\', label: \'No Auth\' }
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChangeAuthType(item.id as AuthType)}
            className={`forge-btn ${authType === item.id ? \'forge-btn-primary\' : \'forge-btn-ghost\'}`}
            style={{ padding: \'6px 10px\', fontSize: \'12px\', border: \'1px solid var(--border-subtle)\' }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {authType !== \'none\' && (
        <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'8px\' }}>
          {/* Custom Header or Query Key inputs */}
          {authType === \'custom-header\' && (
            <div style={{ display: \'flex\', alignItems: \'center\', gap: \'8px\' }}>
              <label style={{ fontSize: \'12px\', color: \'var(--text-muted)\', width: \'100px\' }}>Header Name:</label>
              <input
                type="text"
                value={customAuthHeaderKey}
                onChange={(e) => onChangeCustomAuthHeaderKey && onChangeCustomAuthHeaderKey(e.target.value)}
                placeholder="e.g. x-goog-api-key, Authorization, api-key"
                className="forge-input forge-input-mono"
              />
            </div>
          )}

          {authType === \'query-param\' && (
            <div style={{ display: \'flex\', alignItems: \'center\', gap: \'8px\' }}>
              <label style={{ fontSize: \'12px\', color: \'var(--text-muted)\', width: \'100px\' }}>Param Name:</label>
              <input
                type="text"
                value={customAuthQueryKey}
                onChange={(e) => onChangeCustomAuthQueryKey && onChangeCustomAuthQueryKey(e.target.value)}
                placeholder="e.g. key, api_key, token"
                className="forge-input forge-input-mono"
              />
            </div>
          )}

          {/* API Key value input with Show/Hide/Copy/Clear */}
          <div style={{ display: \'flex\', alignItems: \'center\', gap: \'6px\' }}>
            <div style={{ position: \'relative\', flex: 1 }}>
              <input
                type={showKey ? \'text\' : \'password\'}
                value={apiKey}
                onChange={(e) => onChangeApiKey(e.target.value)}
                placeholder="Enter API Key or use {{API_KEY}} variable"
                className="forge-input forge-input-mono"
                style={{ paddingRight: \'36px\' }}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: \'absolute\',
                  right: \'8px\',
                  top: \'50%\',
                  transform: \'translateY(-50%)\',
                  background: \'none\',
                  border: \'none\',
                  color: \'var(--text-muted)\',
                  cursor: \'pointer\',
                  padding: \'4px\'
                }}
                title={showKey ? \'Hide API Key\' : \'Show API Key\'}
              >
                {showKey ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!apiKey}
              className="forge-btn forge-btn-ghost"
              style={{ padding: \'8px 10px\' }}
              title="Copy API Key"
            >
              {copied ? <CheckIcon size={14} style={{ color: \'var(--accent-emerald)\' }} /> : <CopyIcon size={14} />}
            </button>

            <button
              type="button"
              onClick={() => onChangeApiKey(\'\')}
              disabled={!apiKey}
              className="forge-btn forge-btn-ghost"
              style={{ padding: \'8px 10px\' }}
              title="Clear Key"
            >
              <XIcon size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
'''

# 8. components/ModelInput.tsx
files["components/ModelInput.tsx"] = '''\'use client\';

import React from \'react\';
import { CpuIcon } from \'./Icons\';

interface ModelInputProps {
  modelId: string;
  onChangeModelId: (id: string) => void;
  presetModelSuggestion?: string;
}

const COMMON_MODELS = [
  \'gpt-4o\',
  \'gpt-4o-mini\',
  \'claude-3-5-sonnet-20241022\',
  \'claude-3-5-haiku-20241022\',
  \'gemini-1.5-pro\',
  \'gemini-1.5-flash\',
  \'deepseek-chat\',
  \'deepseek-reasoner\',
  \'llama-3.3-70b-versatile\',
  \'mistral-large-latest\',
  \'qwen-2.5-72b-instruct\'
];

export function ModelInput({
  modelId,
  onChangeModelId
}: ModelInputProps) {
  return (
    <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'4px\', flex: 1 }}>
      <label style={{ fontSize: \'11.5px\', fontWeight: 600, color: \'var(--text-secondary)\', display: \'flex\', alignItems: \'center\', gap: \'4px\' }}>
        <CpuIcon size={13} style={{ color: \'var(--accent-cyan)\' }} />
        <span>Model ID (Unrestricted)</span>
      </label>

      <div style={{ position: \'relative\' }}>
        <input
          type="text"
          list="model-suggestions"
          value={modelId}
          onChange={(e) => onChangeModelId(e.target.value)}
          placeholder="e.g. gpt-4o, claude-3-5-sonnet, custom-finetune"
          className="forge-input forge-input-mono"
        />
        <datalist id="model-suggestions">
          {COMMON_MODELS.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
      </div>
    </div>
  );
}
'''

# Write each file
for path, code in files.items():
    full_path = os.path.join(BASE_DIR, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(code)
    print(f"Generated {path}")

print("Batch 1 completed successfully!")
