import { useAuthStore } from "../store/useAuthStore"

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const status = useAuthStore((state) => state.status)
  const logout = useAuthStore((state) => state.signOut)
  return { user, status, logout }
}
