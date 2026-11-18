import { useState, type FormEvent } from "react"
import { PackagePlus, Wallet } from "lucide-react"
import PageHeader from "../components/PageHeader"
import StatCard from "../components/StatCard"
import Badge from "../components/Badge"
import DataTable, { type Column } from "../components/DataTable"
import EmptyState from "../components/EmptyState"
import Field from "../components/Field"
import Pagination from "../components/Pagination"
import { ErrorBlock, LoadingBlock } from "../components/QueryFeedback"
import { useCreateStockIn, useProducts, useStockIns } from "../api/hooks"
import { errorMessage } from "../api/client"
import { useToastStore } from "../store/useToastStore"
import type { StockIn } from "../types/api"
import { angka, rupiah, tanggalWaktu } from "../lib/format"
import { pageCount } from "../lib/pagination"
import { inputClass, primaryButton, selectClass } from "../lib/ui"

const PAGE_SIZE = 8

export default function Stockin() {
  const notify = useToastStore((state) => state.notify)
  const createStockIn = useCreateStockIn()

  const activeProducts = useProducts({ status: "ACTIVE", limit: 100 })
  const stockInsSummary = useStockIns({ page: 1, limit: 100 })

  const [productId, setProductId] = useState("")
  const [qty, setQty] = useState("")
  const [unitCost, setUnitCost] = useState("")
  const [page, setPage] = useState(1)

  const paged = useStockIns({ page, limit: PAGE_SIZE })
  const products = activeProducts.data?.items ?? []
  const selected = products.find((product) => product.id === Number(productId))

  const summary = stockInsSummary.data?.items ?? []
  const totalUnits = summary.reduce((total, item) => total + item.qty, 0)
  const totalValue = summary.reduce((total, item) => total + item.qty * item.unitCost, 0)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const id = Number(productId)
    const amount = Number(qty)
    const cost = Number(unitCost)

    if (!id) {
      notify("Pilih produk terlebih dahulu.", "error")
      return
    }
    if (!Number.isInteger(amount) || amount <= 0) {
      notify("Jumlah harus bilangan bulat lebih dari 0.", "error")
      return
    }
    if (!Number.isFinite(cost) || cost < 0) {
      notify("Harga beli per unit tidak boleh negatif.", "error")
      return
    }

    try {
      await createStockIn.mutateAsync({ productId: id, qty: amount, unitCost: cost })
      notify("Barang masuk dicatat. Stok dan HPP rata-rata sudah diperbarui.", "success")
      setQty("")
      setUnitCost("")
      setPage(1)
    } catch (error) {
      notify(errorMessage(error), "error")
    }
  }

  const columns: Column<StockIn>[] = [
    {
      key: "product",
      header: "Produk",
      render: (item) => (
        <div>
          <p className="font-semibold text-ink">{item.product?.name ?? "Produk"}</p>
          <p className="mt-0.5 text-xs text-ink-soft">{item.product?.sku ?? "-"}</p>
        </div>
      ),
    },
    {
      key: "qty",
      header: "Jumlah",
      align: "right",
      render: (item) => <Badge tone="success">+{angka(item.qty)} unit</Badge>,
    },
    {
      key: "unitCost",
      header: "Harga beli",
      align: "right",
      render: (item) => <span className="tabular-nums">{rupiah(item.unitCost)}</span>,
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      render: (item) => (
        <span className="font-semibold tabular-nums">{rupiah(item.qty * item.unitCost)}</span>
      ),
    },
    {
      key: "user",
      header: "Dicatat oleh",
      render: (item) => (
        <div>
          <p className="text-ink">{item.createdBy?.name ?? "—"}</p>
          <p className="mt-0.5 text-xs text-ink-soft">{tanggalWaktu(item.createdAt)}</p>
        </div>
      ),
    },
  ]

  const data = paged.data

  return (
    <div className="rise space-y-6">
      <PageHeader
        eyebrow="Pergerakan"
        title="Barang masuk"
        description="Catat pembelian stok. HPP rata-rata dihitung ulang otomatis memakai weighted average."
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Transaksi masuk"
          value={angka(data?.total ?? 0)}
          icon={PackagePlus}
          tone="accent"
        />
        <StatCard
          label="Total unit masuk"
          value={angka(totalUnits)}
          hint="Dari 100 transaksi terbaru"
          icon={PackagePlus}
          tone="sky"
        />
        <StatCard
          label="Nilai pembelian"
          value={rupiah(totalValue)}
          hint="Dari 100 transaksi terbaru"
          icon={Wallet}
          tone="emerald"
        />
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-ink">Catat barang masuk</h2>
            <p className="mt-0.5 text-sm text-ink-soft">
              Hanya produk aktif yang bisa menerima stok.
            </p>
          </div>
          {selected ? (
            <Badge tone="info">
              Stok sekarang {angka(selected.stock)} {selected.unit} · HPP {rupiah(selected.avgCost)}
            </Badge>
          ) : null}
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_0.8fr_1fr_auto] lg:items-end"
        >
          <Field label="Produk" htmlFor="stockin-product">
            <select
              id="stockin-product"
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              className={selectClass}
            >
              <option value="">Pilih produk aktif</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku}) · stok {product.stock}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Jumlah" htmlFor="stockin-qty">
            <input
              id="stockin-qty"
              type="number"
              min="1"
              step="1"
              value={qty}
              onChange={(event) => setQty(event.target.value)}
              className={inputClass}
              placeholder="10"
            />
          </Field>
          <Field label="Harga beli / unit" htmlFor="stockin-cost">
            <input
              id="stockin-cost"
              type="number"
              min="0"
              step="any"
              value={unitCost}
              onChange={(event) => setUnitCost(event.target.value)}
              className={inputClass}
              placeholder="50000"
            />
          </Field>
          <button
            type="submit"
            disabled={createStockIn.isPending}
            className={`${primaryButton} h-[42px]`}
          >
            <PackagePlus size={16} />
            {createStockIn.isPending ? "Menyimpan..." : "Simpan"}
          </button>
        </form>

        {selected && Number(qty) > 0 && Number(unitCost) >= 0 ? (
          <p className="mt-3 rounded-xl border border-line bg-surface-muted px-3.5 py-3 text-xs leading-relaxed text-ink-soft">
            Perkiraan total pembelian{" "}
            <span className="font-semibold text-ink">{rupiah(Number(qty) * Number(unitCost))}</span>.
            HPP baru akan dihitung dari stok {angka(selected.stock)} {selected.unit} dengan HPP lama{" "}
            {rupiah(selected.avgCost)}.
          </p>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-6">
          <div>
            <h2 className="text-sm font-semibold text-ink">Riwayat barang masuk</h2>
            <p className="mt-0.5 text-xs text-ink-soft">
              {angka(data?.total ?? 0)} transaksi tercatat
            </p>
          </div>
          <Badge tone="neutral">Terbaru dulu</Badge>
        </div>

        {paged.isPending ? (
          <LoadingBlock label="Memuat riwayat barang masuk..." />
        ) : paged.error ? (
          <ErrorBlock error={paged.error} onRetry={() => void paged.refetch()} />
        ) : (
          <DataTable
            columns={columns}
            rows={data?.items ?? []}
            rowKey={(item) => item.id}
            minWidth={820}
            empty={
              <EmptyState
                icon={<PackagePlus size={24} strokeWidth={1.9} />}
                title="Belum ada barang masuk"
                description="Catat pembelian pertama lewat form di atas."
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
