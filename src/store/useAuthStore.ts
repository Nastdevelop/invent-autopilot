import { create } from "zustand"
import { api } from "../api/endpoints"
import { clearToken, getToken, setToken, setUnauthorizedHandler } from "../api/client"
import type { User } from "../types/api"

export type AuthStatus = "loading" | "authenticated" | "anonymous"

interface AuthState {
  user: User | null
  status: AuthStatus
  setSession: (token: string, user: User) => void
  setUser: (user: User) => void
  signOut: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "loading",
  setSession: (token, user) => {
    setToken(token)
    set({ user, status: "authenticated" })
  },
  setUser: (user) => set({ user, status: "authenticated" }),
  signOut: () => {
    clearToken()
    set({ user: null, status: "anonymous" })
  },
}))

setUnauthorizedHandler(() => {
  useAuthStore.getState().signOut()
})

let bootstrapPromise: Promise<void> | null = null

export function bootstrapAuth(): Promise<void> {
  if (bootstrapPromise) return bootstrapPromise

  const token = getToken()
  if (!token) {
    useAuthStore.setState({ user: null, status: "anonymous" })
    bootstrapPromise = Promise.resolve()
    return bootstrapPromise
  }

  bootstrapPromise = api
    .me()
    .then(({ user }) => {
      useAuthStore.getState().setUser(user)
    })
    .catch(() => {
      useAuthStore.getState().signOut()
    })

  return bootstrapPromise
}
