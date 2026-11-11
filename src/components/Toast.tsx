import { useEffect } from "react"
import { createPortal } from "react-dom"
import { CircleAlert, CircleCheck, Info, X } from "lucide-react"
import { useAppStore } from "../store/useAppStore"

const tone = {
  success: {
    icon: CircleCheck,
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    iconClass: "text-emerald-600",
  },
  error: {
    icon: CircleAlert,
    className: "border-red-200 bg-red-50 text-red-800",
    iconClass: "text-red-600",
  },
  info: {
    icon: Info,
    className: "border-sky-200 bg-sky-50 text-sky-800",
    iconClass: "text-sky-600",
  },
}

export default function Toast() {
  const toast = useAppStore((state) => state.toast)
  const dismissToast = useAppStore((state) => state.dismissToast)

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(dismissToast, 3600)
    return () => window.clearTimeout(timer)
  }, [toast, dismissToast])

  if (!toast) return null
  const style = tone[toast.tone]
  const Icon = style.icon

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4 sm:inset-x-auto sm:right-6 sm:justify-end">
      <div
        role="status"
        className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg shadow-ink/10 ${style.className}`}
      >
        <Icon size={18} className={`mt-0.5 shrink-0 ${style.iconClass}`} />
        <p className="flex-1 leading-relaxed">{toast.message}</p>
        <button
          type="button"
          onClick={dismissToast}
          aria-label="Tutup notifikasi"
          className="shrink-0 rounded-md p-0.5 opacity-60 transition-opacity hover:opacity-100"
        >
          <X size={15} />
        </button>
      </div>
    </div>,
    document.body,
  )
}
