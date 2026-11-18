import { create } from "zustand"

export type ToastTone = "success" | "error" | "info"

export interface ToastMessage {
  id: number
  message: string
  tone: ToastTone
}

interface ToastState {
  toast: ToastMessage | null
  notify: (message: string, tone?: ToastTone) => void
  dismiss: () => void
}

let nextId = 1

export const useToastStore = create<ToastState>((set) => ({
  toast: null,
  notify: (message, tone = "info") => {
    set({ toast: { id: nextId++, message, tone } })
  },
  dismiss: () => set({ toast: null }),
}))
