/**
 * src/hooks/useModal.js
 *
 * PURPOSE:
 *   Simple open/close/toggle state for modals, drawers, and dropdowns.
 *   Used by MobileMenu drawer, UserMenu dropdown, and future modals
 *   (product quick-view, confirm dialogs, etc.).
 *
 * REUSE:
 *   Any component that needs a boolean open/close state uses this
 *   instead of duplicating useState + handlers.
 */

import { useState, useCallback } from "react";

export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
}