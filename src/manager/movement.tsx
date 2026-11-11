import { useMemo, useState } from "react"
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, ClipboardList } from "lucide-react"
import PageHeader from "../components/PageHeader"
import StatCard from "../components/StatCard"
import Badge, { type BadgeTone } from "../components/Badge"
import DataTable, { type Column } from "../components/DataTable"
import EmptyState from "../components/EmptyState"
import Pagination from "../components/Pagination"
import { movementLabels, useAppStore } from "../store/useAppStore"
import type { MovementType, StockMovement } from "../types/api"
import { angka, tanggalWaktu } from "../lib/format"
import { findUser, paginate } from "../lib/selectors"
import { selectClass } from "../lib/ui"

const typeTone: Record<MovementType, BadgeTone> = {
  STOCK_IN: "success",
  SALE: "info",
  CANCEL_SALE: "accent",
  DAMAGED: "danger",
  ADJUSTMENT: "warning",
}

const referenceLabel: Record<string, string> = {
  STOCK_IN: "Barang masuk",
  SALE: "Penjualan",
  ADJUSTMENT: "Adjustment",
}

export default function Movement() {
  const movements = useAppStore((state) => state.movements)
  const products = useAppStore((state) => state.products)
  const users = useAppStore((state) => state.users)

  const [type, setType] = useState<"ALL" | MovementType>("ALL")
  const [productId, setProductId] = useState("ALL")
  const [page, setPage] = useState(1)

  const filtered = useMemo(
    () =>
      movements.filter((movement) => {
        const matchType = type === "ALL" || movement.type === type
        const matchProduct =
          productId === "ALL" || movement.productId === Number(productId)
        return matchType && matchProduct
      }),
    [movements, type, productId],
  )
  const pageData = paginate(filtered, page, 10)

  const totalIn = movements
    .filter((movement) => movement.quantityChange > 0)
    .reduce((total, movement) => total + movement.quantityChange, 0)
  const totalOut = movements
    .filter((movement) => movement.quantityChange < 0)
    .reduce((total, movement) => total + Math.abs(movement.quantityChange), 0)

  const columns: Column<StockMovement>[] = [
    {
      key: "time",
      header: "Waktu",
      render: (movement) => (
        <div>
          <p className="text-ink">{tanggalWaktu(movement.createdAt)}</p>
          <p className="mt-0.5 text-xs text-ink-soft">#{movement.id}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Tipe",
      render: (movement) => (
        <Badge tone={typeTone[movement.type]}>{movementLabels[movement.type]}</Badge>
      ),
    },
    {
      key: "product",
      header: "Produk",
      render: (movement) => {
        const product = products.find((candidate) => candidate.id === movement.productId)
        return (
          <div>
            <p className="font-medium text-ink">{product?.name ?? "Produk"}</p>
            <p className="mt-0.5 text-xs text-ink-soft">{product?.sku ?? "-"}</p>
          </div>
        )
      },
    },
    {
      key: "change",
      header: "Perubahan",
      align: "right",
      render: (movement) => (
        <span
          className={`font-semibold tabular-nums ${
            movement.quantityChange < 0 ? "text-danger" : "text-emerald-700"
          }`}
        >
          {movement.quantityChange > 0 ? "+" : ""}
          {angka(movement.quantityChange)}
        </span>
      ),
    },
    {
      key: "reference",
      header: "Referensi",
      render: (movement) =>
        movement.reference ? (
          <div>
            <p className="text-ink">{referenceLabel[movement.reference.type]}</p>
            <p className="mt-0.5 text-xs text-ink-soft">#{movement.reference.id}</p>
          </div>
        ) : (
          <span className="text-xs text-ink-soft/70">—</span>
        ),
    },
    {
      key: "user",
      header: "Oleh",
      render: (movement) => (
        <span className="text-ink">{findUser(users, movement.createdBy)?.name ?? "—"}</span>
      ),
    },
    {
      key: "reason",
      header: "Alasan",
      render: (movement) => (
        <p className="max-w-[220px] truncate text-xs text-ink-soft">{movement.reason ?? "—"}</p>
      ),
    },
  ]

  return (
    <div className="rise space-y-6">
      <PageHeader
        eyebrow="Audit"
        title="Movement"
        description="Riwayat otomatis setiap perubahan stok: barang masuk, penjualan, pembatalan, dan adjustment."
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total catatan" value={angka(movements.length)} icon={ClipboardList} tone="slate" />
        <StatCard label="Unit masuk" value={angka(totalIn)} icon={ArrowDownLeft} tone="emerald" />
        <StatCard label="Unit keluar" value={angka(totalOut)} icon={ArrowUpRight} tone="red" />
      </section>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
        <select
          value={type}
          onChange={(event) => {
            setType(event.target.value as "ALL" | MovementType)
            setPage(1)
          }}
          aria-label="Filter tipe movement"
          className={selectClass}
        >
          <option value="ALL">Semua tipe</option>
          {(Object.keys(movementLabels) as MovementType[]).map((key) => (
            <option key={key} value={key}>
              {movementLabels[key]}
            </option>
          ))}
        </select>

        <select
          value={productId}
          onChange={(event) => {
            setProductId(event.target.value)
            setPage(1)
          }}
          aria-label="Filter produk movement"
          className={selectClass}
        >
          <option value="ALL">Semua produk</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} ({product.sku})
            </option>
          ))}
        </select>

        <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-semibold text-ink-soft">
          <ArrowLeftRight size={15} />
          {filtered.length} catatan
        </span>
      </div>

      <section className="overflow-hidden rounded-2xl border border-line bg-surface">
        <DataTable
          columns={columns}
          rows={pageData.items}
          rowKey={(movement) => movement.id}
          minWidth={980}
          empty={
            <EmptyState
              icon={<ArrowLeftRight size={24} strokeWidth={1.9} />}
              title="Belum ada pergerakan stok"
              description="Catatan muncul otomatis setelah barang masuk, penjualan, atau adjustment."
            />
          }
        />
        <Pagination
          page={pageData.page}
          pageCount={pageData.pageCount}
          total={pageData.total}
          onPage={setPage}
        />
      </section>
    </div>
  )
}
