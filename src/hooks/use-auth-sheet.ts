"use client";

import { create } from "zustand";

type AuthSheetStore = {
  isOpen: boolean;
  onSuccess: (() => void) | null;
  open: (onSuccess?: () => void) => void;
  close: () => void;
};

export const useAuthSheet = create<AuthSheetStore>((set) => ({
  isOpen: false,
  onSuccess: null,
  open: (onSuccessCallback) => set({ isOpen: true, onSuccess: onSuccessCallback || null }),
  close: () => set({ isOpen: false, onSuccess: null }),
}));
