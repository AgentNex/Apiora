'use client';

import React, { useState, useEffect } from 'react';
import { ActivityIcon, ShieldIcon } from './Icons';
import { DeviceProfile } from '../lib/api/types';
import { getDeviceProfile, subscribeToDeviceChanges } from '../lib/performance/device-profile';

interface StatusIndicatorProps {
  activeEnvironmentName?: string;
  onOpenSettings?: () => void;
  onOpenEnvironments?: () => void;
}

export function StatusIndicator({
  activeEnvironmentName = 'Development',
  onOpenSettings,
  onOpenEnvironments
}: StatusIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [profile, setProfile] = useState<DeviceProfile>({
    prefersReducedMotion: false,
    isLowPower: false,
    animationLevel: 'full'
  });

  useEffect(() => {
    setIsOnline(navigator.onLine);
    setProfile(getDeviceProfile());

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const unsub = subscribeToDeviceChanges(setProfile);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsub();
    };
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* Network / Proxy Status */}
      <div
        title={isOnline ? 'Connected to Proxy Gateway' : 'Offline'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 8px',
          borderRadius: '6px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          fontSize: '12px',
          color: 'var(--text-secondary)'
        }}
      >
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: isOnline ? 'var(--accent-emerald)' : 'var(--accent-rose)',
            boxShadow: isOnline ? '0 0 8px var(--accent-emerald)' : 'none'
          }}
        />
        <span style={{ fontWeight: 500 }}>{isOnline ? 'Proxy Ready' : 'Offline'}</span>
      </div>

      {/* Active Environment Chip */}
      <button
        onClick={onOpenEnvironments}
        title="Active Environment. Click to switch or edit."
        className="forge-btn forge-btn-ghost"
        style={{
          padding: '4px 8px',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px'
        }}
      >
        <ShieldIcon size={13} style={{ color: 'var(--accent-cyan)' }} />
        <span>{activeEnvironmentName}</span>
      </button>

      {/* Device Capability Badge */}
      <button
        onClick={onOpenSettings}
        title={`Device Performance: ${profile.animationLevel.toUpperCase()} motion. Click to adjust settings.`}
        className="forge-btn forge-btn-ghost"
        style={{
          padding: '4px 8px',
          fontSize: '11px',
          color: profile.isLowPower ? 'var(--accent-amber)' : 'var(--text-muted)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px'
        }}
      >
        <ActivityIcon size={13} />
        <span>{profile.animationLevel === 'full' ? '60 FPS UI' : profile.animationLevel === 'reduced' ? 'Eco Mode' : 'Static'}</span>
      </button>
    </div>
  );
}
