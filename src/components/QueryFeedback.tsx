import { CircleAlert, LoaderCircle, RotateCw } from "lucide-react"
import { errorMessage } from "../api/client"
import { secondaryButton } from "../lib/ui"

export function LoadingBlock({ label = "Memuat data..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2.5 px-4 py-14 text-sm text-ink-soft">
      <LoaderCircle size={18} className="animate-spin" />
      {label}
    </div>
  )
}

export function ErrorBlock({
  error,
  onRetry,
}: {
  error: unknown
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-red-50 text-red-600">
        <CircleAlert size={22} />
      </span>
      <p className="text-sm font-semibold text-ink">Gagal memuat data</p>
      <p className="max-w-sm text-xs leading-relaxed text-ink-soft">{errorMessage(error)}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className={secondaryButton}>
          <RotateCw size={15} />
          Coba lagi
        </button>
      ) : null}
    </div>
  )
}
