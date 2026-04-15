import { router } from 'expo-router';
import type { Href } from 'expo-router';

const NAV_THROTTLE_MS = 600;
let lastNavigateAt = 0;

/**
 * Throttled router.push - ignores rapid taps so only one screen is pushed.
 * Use this instead of router.push for any button that navigates.
 */
export function safePush(href: Href<string>) {
  const now = Date.now();
  if (now - lastNavigateAt < NAV_THROTTLE_MS) return;
  lastNavigateAt = now;
  router.push(href);
}

/**
 * Throttled router.replace - ignores rapid taps.
 */
export function safeReplace(href: Href<string>) {
  const now = Date.now();
  if (now - lastNavigateAt < NAV_THROTTLE_MS) return;
  lastNavigateAt = now;
  router.replace(href);
}
