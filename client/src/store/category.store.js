/**
 * src/store/category.store.js
 *
 * PURPOSE:
 *   Zustand store for category UI state — which tree nodes are expanded
 *   in the sidebar, and which category is currently active.
 *
 * WHAT THIS STORE HOLDS VS REACT QUERY:
 *   React Query owns: the actual category data (server cache, tree structure)
 *   This store owns: the UI state of the sidebar tree (which nodes are open)
 *
 *   Separation means:
 *   - Tree expansion state persists when the user navigates between products
 *   - React Query re-fetches categories in the background without collapsing
 *     the sidebar tree the user has already opened
 *   - The store is reset on logout (full page reload resets all Zustand state)
 *
 * WHY A SET FOR EXPANDED IDS:
 *   A Set allows O(1) toggle/check operations even for deep category trees.
 *   Array.includes() is O(n) — noticeable lag on trees with 50+ nodes.
 *   Zustand stores a JS Set serialised as an object — it is intentionally
 *   NOT persisted to localStorage (expansion state is session-only).
 *
 * FUTURE PHASES:
 *   Phase 8 (Admin) — Admin category manager will NOT use this store.
 *   It has its own UI state requirements (drag-and-drop reorder, edit mode).
 *   This store is customer-facing only.
 *
 *   Header MegaMenu (Phase 8) — will read expandedIds to highlight the
 *   currently viewed category subtree in the mega-menu.
 */

import { create } from "zustand";

export const useCategoryStore = create((set, get) => ({
  // ── Set of category _id strings that are expanded in the sidebar ──────────
  // Using a plain object as a set (key = id, value = true) for Zustand compat
  expandedIds: {},

  // ── Currently active category _id (highlighted in sidebar) ────────────────
  activeCategoryId: null,

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Toggle expand/collapse a node in the category tree.
   * @param {string} categoryId
   */
  toggleExpanded: (categoryId) =>
    set((state) => {
      const next = { ...state.expandedIds };
      if (next[categoryId]) {
        delete next[categoryId];
      } else {
        next[categoryId] = true;
      }
      return { expandedIds: next };
    }),

  /**
   * Force-expand a specific node (e.g. when navigating to a child category,
   * auto-expand its parent so the user sees context in the sidebar).
   * @param {string} categoryId
   */
  expandNode: (categoryId) =>
    set((state) => ({
      expandedIds: { ...state.expandedIds, [categoryId]: true },
    })),

  /**
   * Expand an entire chain of ancestor IDs (root → parent → current).
   * Called by CategoryPage when a category has ancestors — ensures the full
   * path is visible in the sidebar without the user having to manually expand.
   * @param {string[]} ancestorIds
   */
  expandAncestors: (ancestorIds) =>
    set((state) => {
      const next = { ...state.expandedIds };
      ancestorIds.forEach((id) => { next[id] = true; });
      return { expandedIds: next };
    }),

  /**
   * Returns true if a specific node is expanded.
   * @param {string} categoryId
   */
  isExpanded: (categoryId) => Boolean(get().expandedIds[categoryId]),

  /**
   * Set the currently active (viewed) category.
   * @param {string|null} categoryId
   */
  setActive: (categoryId) => set({ activeCategoryId: categoryId }),

  /**
   * Collapse all tree nodes and clear active category.
   * Called when the user navigates away from all category pages.
   */
  reset: () => set({ expandedIds: {}, activeCategoryId: null }),
}));