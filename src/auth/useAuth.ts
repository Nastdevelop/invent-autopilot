import { useAppStore } from "../store/useAppStore"

export function useAuth() {
  const user = useAppStore(
    (state) => state.users.find((candidate) => candidate.id === state.currentUserId) ?? null,
  )
  const login = useAppStore((state) => state.login)
  const logout = useAppStore((state) => state.logout)
  return { user, login, logout }
}
