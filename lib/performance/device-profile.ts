import { AnimationLevel, DeviceProfile } from '../api/types';

export function getDeviceProfile(): DeviceProfile {
  if (typeof window === 'undefined') {
    return {
      prefersReducedMotion: false,
      isLowPower: false,
      animationLevel: 'full'
    };
  }

  const nav = window.navigator as any;
  const memory = nav.deviceMemory as number | undefined; // in GB
  const concurrency = nav.hardwareConcurrency as number | undefined; // CPU threads
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = nav.connection?.saveData === true;

  // Determine low-power status
  const isLowMemory = memory !== undefined && memory < 4;
  const isLowCpu = concurrency !== undefined && concurrency < 4;
  const isLowPower = isLowMemory || isLowCpu || saveData;

  let animationLevel: AnimationLevel = 'full';
  if (prefersReduced) {
    animationLevel = 'disabled';
  } else if (isLowPower) {
    animationLevel = 'reduced';
  }

  return {
    deviceMemory: memory,
    hardwareConcurrency: concurrency,
    prefersReducedMotion: prefersReduced,
    isLowPower,
    animationLevel
  };
}

export function subscribeToDeviceChanges(callback: (profile: DeviceProfile) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const listener = () => {
    callback(getDeviceProfile());
  };

  mediaQuery.addEventListener('change', listener);
  return () => {
    mediaQuery.removeEventListener('change', listener);
  };
}
