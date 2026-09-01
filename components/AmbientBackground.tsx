'use client';

import React, { useEffect, useState, memo } from 'react';
import { DeviceProfile, UIState } from '../lib/api/types';
import { getDeviceProfile, subscribeToDeviceChanges } from '../lib/performance/device-profile';

interface AmbientBackgroundProps {
  uiState?: UIState;
  overrideAnimationLevel?: 'full' | 'reduced' | 'disabled' | 'auto';
}

function AmbientBackgroundComponent({
  uiState = 'idle',
  overrideAnimationLevel = 'auto'
}: AmbientBackgroundProps) {
  const [profile, setProfile] = useState<DeviceProfile>({
    prefersReducedMotion: false,
    isLowPower: false,
    animationLevel: 'full'
  });
  const [isTabVisible, setIsTabVisible] = useState(true);

  useEffect(() => {
    try {
      setProfile(getDeviceProfile());
      const unsub = subscribeToDeviceChanges(setProfile);

      const handleVisibilityChange = () => {
        setIsTabVisible(document.visibilityState === 'visible');
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        unsub();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } catch {
      // Graceful fallback
    }
  }, []);

  const activeLevel =
    overrideAnimationLevel !== 'auto'
      ? overrideAnimationLevel
      : profile.animationLevel;

  if (activeLevel === 'disabled' || !isTabVisible) {
    return (
      <div
        className="ambient-base disabled-animation"
        aria-hidden="true"
        style={{ background: 'var(--bg-canvas)' }}
      />
    );
  }

  const stateClass = `ambient-state-${uiState}`;
  const perfClass = activeLevel === 'reduced' ? 'reduced-animation' : '';

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
