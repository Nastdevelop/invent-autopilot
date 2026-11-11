import type { ReactNode } from "react"

export default function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-ink">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">{hint}</p> : null}
    </div>
  )
}
