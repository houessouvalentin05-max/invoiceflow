'use client'

import { useSyncExternalStore } from 'react'

const MOBILE_BREAKPOINT = 768

function subscribe(callback: () => void) {
  window.addEventListener('resize', callback)
  return () => window.removeEventListener('resize', callback)
}

function getSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT
}

/**
 * Vue réactive et sûre pour l'hydratation :
 * - hydratation : `getServerSnapshot()` (false) est utilisé côté serveur ET côté
 *   client pendant l'hydratation → aucune mismatch, aucun flash.
 * - dès que la page est hydratée, React abonne au store et applique `getSnapshot()`.
 */
function getServerSnapshot() {
  return false
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}