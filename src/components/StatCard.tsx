import type { LucideIcon } from "lucide-react"

export type StatTone = "accent" | "sky" | "amber" | "emerald" | "red" | "slate"

const toneClass: Record<StatTone, string> = {
  accent: "bg-accent-soft text-accent-hover",
  sky: "bg-sky-50 text-sky-600",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
  red: "bg-red-50 text-red-600",
  slate: "bg-paper text-ink-soft",
}

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "accent",
}: {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  tone?: StatTone
}) {
  return (
    <article className="rounded-2xl border border-line bg-surface p-4 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-ink/5 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-ink-soft">{label}</p>
        <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${toneClass[tone]}`}>
          <Icon size={17} strokeWidth={2.1} />
        </span>
      </div>
      <p className="mt-3 text-xl font-semibold tracking-tight text-ink tabular-nums sm:text-2xl">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-ink-soft">{hint}</p> : null}
    </article>
  )
}
