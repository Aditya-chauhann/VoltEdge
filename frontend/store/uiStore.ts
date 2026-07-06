'use client';
/**
 * UI Store (Zustand)
 * Controls global UI state: auth modal visibility, pending cart action.
 */

import { create } from 'zustand';

interface PendingCartAction {
  productId:  string;
  qty:        number;
  variantId?: string;
}

interface UIStore {
  // Auth modal
  authModalOpen:   boolean;
  authModalMode:   'login' | 'register' | 'forgot';
  pendingCartAction: PendingCartAction | null;

  openAuthModal:  (mode?: 'login' | 'register' | 'forgot', pendingAction?: PendingCartAction) => void;
  closeAuthModal: () => void;
  clearPendingAction: () => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  authModalOpen:     false,
  authModalMode:     'login',
  pendingCartAction: null,

  openAuthModal: (mode = 'login', pendingAction) =>
    set({ authModalOpen: true, authModalMode: mode, pendingCartAction: pendingAction ?? null }),

  closeAuthModal: () =>
    set({ authModalOpen: false }),

  clearPendingAction: () =>
    set({ pendingCartAction: null }),
}));
