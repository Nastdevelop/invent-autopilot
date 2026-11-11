import { rupiah, shortDate } from "../lib/format"

export interface TrendPoint {
  date: string
  value: number
}

export default function TrendChart({ data }: { data: TrendPoint[] }) {
  const max = Math.max(...data.map((point) => point.value), 0)

  if (max === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-line/70 bg-surface-muted px-6 text-center">
        <p className="text-sm font-semibold text-ink">Belum ada omzet</p>
        <p className="mt-1 max-w-xs text-xs leading-relaxed text-ink-soft">
          Konfirmasi penjualan agar tren omzet harian muncul di sini.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-line/70 bg-surface-muted p-4">
      <div className="flex h-48 items-end gap-2 sm:h-56 sm:gap-3">
        {data.map((point) => {
          const height = Math.max(4, Math.round((point.value / max) * 100))
          return (
            <div key={point.date} className="group flex h-full flex-1 flex-col justify-end gap-1.5">
              <div className="relative flex flex-1 items-end">
                <div
                  className="w-full rounded-t-md bg-accent/80 transition-colors group-hover:bg-accent"
                  style={{ height: `${height}%` }}
                  title={`${shortDate(point.date)}: ${rupiah(point.value)}`}
                />
              </div>
              <span className="truncate text-center text-[10px] font-medium text-ink-soft">
                {shortDate(point.date)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
