import type { ReactNode } from "react"

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  align?: "left" | "right" | "center"
  className?: string
}

const alignClass = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
}

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  empty,
  minWidth = 720,
}: {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
  empty?: ReactNode
  minWidth?: number
}) {
  if (rows.length === 0) {
    return <>{empty}</>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-line bg-surface-muted">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-4 py-2.5 text-xs font-semibold text-ink-soft sm:px-6 ${
                  alignClass[column.align ?? "left"]
                } ${column.className ?? ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-line/70 last:border-0 hover:bg-surface-muted/70"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 text-sm text-ink sm:px-6 ${
                    alignClass[column.align ?? "left"]
                  } ${column.className ?? ""}`}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
