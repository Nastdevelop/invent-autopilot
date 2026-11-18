import { useEffect } from "react"
import AppRoutes from "./AppRoutes/AppRoutes"
import { bootstrapAuth } from "./store/useAuthStore"

function App() {
  useEffect(() => {
    void bootstrapAuth()
  }, [])

  return <AppRoutes />
}

export default App
