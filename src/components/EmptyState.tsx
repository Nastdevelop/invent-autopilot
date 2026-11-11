import type { ReactNode } from "react"
import { Inbox } from "lucide-react"

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="px-5 py-14 text-center sm:px-8">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-paper text-ink-soft">
        {icon ?? <Inbox size={24} strokeWidth={1.9} />}
      </span>
      <p className="mt-4 text-sm font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-ink-soft">
        {description}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}
