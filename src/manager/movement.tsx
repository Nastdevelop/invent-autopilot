import { useState } from "react"
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, ClipboardList } from "lucide-react"
import PageHeader from "../components/PageHeader"
import StatCard from "../components/StatCard"
import Badge, { type BadgeTone } from "../components/Badge"
import DataTable, { type Column } from "../components/DataTable"
import EmptyState from "../components/EmptyState"
import Pagination from "../components/Pagination"
import { ErrorBlock, LoadingBlock } from "../components/QueryFeedback"
import { useMovements, useProducts } from "../api/hooks"
import type { MovementType, StockMovement } from "../types/api"
import { angka, tanggalWaktu } from "../lib/format"
import { pageCount } from "../lib/pagination"
import { selectClass } from "../lib/ui"

const movementLabels: Record<MovementType, string> = {
  STOCK_IN: "Barang masuk",
  SALE: "Penjualan",
  CANCEL_SALE: "Pembatalan",
  DAMAGED: "Barang rusak",
  ADJUSTMENT: "Koreksi stok",
}

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

const PAGE_SIZE = 10

export default function Movement() {
  const [type, setType] = useState<"ALL" | MovementType>("ALL")
  const [productId, setProductId] = useState("ALL")
  const [page, setPage] = useState(1)

  const productsQuery = useProducts({ limit: 100 })
  const list = useMovements({
    type: type === "ALL" ? undefined : type,
    productId: productId === "ALL" ? undefined : Number(productId),
    page,
    limit: PAGE_SIZE,
  })

  const data = list.data
  const items = data?.items ?? []
  const totalIn = items
    .filter((movement) => movement.quantityChange > 0)
    .reduce((total, movement) => total + movement.quantityChange, 0)
  const totalOut = items
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
      render: (movement) => (
        <div>
          <p className="font-medium text-ink">{movement.product.name}</p>
          <p className="mt-0.5 text-xs text-ink-soft">{movement.product.sku}</p>
        </div>
      ),
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
      render: (movement) => <span className="text-ink">{movement.createdBy.name}</span>,
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
        <StatCard
          label="Total catatan"
          value={angka(data?.total ?? 0)}
          icon={ClipboardList}
          tone="slate"
        />
        <StatCard
          label="Unit masuk"
          value={angka(totalIn)}
          hint="Halaman ini"
          icon={ArrowDownLeft}
          tone="emerald"
        />
        <StatCard
          label="Unit keluar"
          value={angka(totalOut)}
          hint="Halaman ini"
          icon={ArrowUpRight}
          tone="red"
        />
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
          {(productsQuery.data?.items ?? []).map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} ({product.sku})
            </option>
          ))}
        </select>

        <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-semibold text-ink-soft">
          <ArrowLeftRight size={15} />
          {angka(data?.total ?? 0)} catatan
        </span>
      </div>

      <section className="overflow-hidden rounded-2xl border border-line bg-surface">
        {list.isPending ? (
          <LoadingBlock label="Memuat riwayat stok..." />
        ) : list.error ? (
          <ErrorBlock error={list.error} onRetry={() => void list.refetch()} />
        ) : (
          <DataTable
            columns={columns}
            rows={items}
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
        )}
        {data ? (
          <Pagination
            page={data.page}
            pageCount={pageCount(data.total, PAGE_SIZE)}
            total={data.total}
            onPage={setPage}
          />
        ) : null}
      </section>
    </div>
  )
}
