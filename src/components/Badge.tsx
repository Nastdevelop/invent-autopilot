import type { ReactNode } from "react"

export type BadgeTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "accent"

const toneClass: Record<BadgeTone, string> = {
  neutral: "border-line bg-paper text-ink-soft",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
  accent: "border-accent/20 bg-accent-soft text-accent-hover",
}

export default function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode
  tone?: BadgeTone
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${toneClass[tone]}`}
    >
      {children}
    </span>
  )
}
