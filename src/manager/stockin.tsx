import { useMemo, useState, type FormEvent } from "react"
import { PackagePlus, Search, Wallet } from "lucide-react"
import PageHeader from "../components/PageHeader"
import StatCard from "../components/StatCard"
import Badge from "../components/Badge"
import DataTable, { type Column } from "../components/DataTable"
import EmptyState from "../components/EmptyState"
import Field from "../components/Field"
import Pagination from "../components/Pagination"
import { useAppStore } from "../store/useAppStore"
import type { StockIn } from "../types/api"
import { angka, rupiah, tanggalWaktu } from "../lib/format"
import { findUser, paginate } from "../lib/selectors"
import { inputClass, primaryButton, selectClass } from "../lib/ui"

export default function Stockin() {
  const products = useAppStore((state) => state.products)
  const stockIns = useAppStore((state) => state.stockIns)
  const users = useAppStore((state) => state.users)
  const stockIn = useAppStore((state) => state.stockIn)
  const notify = useAppStore((state) => state.notify)

  const activeProducts = useMemo(
    () => products.filter((product) => product.status === "ACTIVE"),
    [products],
  )

  const [productId, setProductId] = useState("")
  const [qty, setQty] = useState("")
  const [unitCost, setUnitCost] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const selected = products.find((product) => product.id === Number(productId))
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return stockIns
    return stockIns.filter((item) => {
      const product = products.find((candidate) => candidate.id === item.productId)
      return product
        ? product.name.toLowerCase().includes(query) ||
            product.sku.toLowerCase().includes(query)
        : false
    })
  }, [stockIns, products, search])

  const pageData = paginate(filtered, page, 8)
  const totalUnits = stockIns.reduce((total, item) => total + item.qty, 0)
  const totalValue = stockIns.reduce((total, item) => total + item.qty * item.unitCost, 0)

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = stockIn({
      productId: Number(productId),
      qty: Number(qty),
      unitCost: Number(unitCost),
    })
    notify(result.message ?? (result.ok ? "Barang masuk dicatat." : "Gagal."), result.ok ? "success" : "error")
    if (result.ok) {
      setQty("")
      setUnitCost("")
    }
  }

  const columns: Column<StockIn>[] = [
    {
      key: "product",
      header: "Produk",
      render: (item) => {
        const product = products.find((candidate) => candidate.id === item.productId)
        return (
          <div>
            <p className="font-semibold text-ink">{product?.name ?? "Produk dihapus"}</p>
            <p className="mt-0.5 text-xs text-ink-soft">{product?.sku ?? "-"}</p>
          </div>
        )
      },
    },
    {
      key: "qty",
      header: "Jumlah",
      align: "right",
      render: (item) => (
        <Badge tone="success">
          +{angka(item.qty)} {products.find((product) => product.id === item.productId)?.unit ?? "unit"}
        </Badge>
      ),
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
          <p className="text-ink">{findUser(users, item.createdBy)?.name ?? "—"}</p>
          <p className="mt-0.5 text-xs text-ink-soft">{tanggalWaktu(item.createdAt)}</p>
        </div>
      ),
    },
  ]

  return (
    <div className="rise space-y-6">
      <PageHeader
        eyebrow="Pergerakan"
        title="Barang masuk"
        description="Catat pembelian stok. HPP rata-rata dihitung ulang otomatis memakai weighted average."
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Transaksi masuk" value={angka(stockIns.length)} icon={PackagePlus} tone="accent" />
        <StatCard label="Total unit masuk" value={angka(totalUnits)} icon={PackagePlus} tone="sky" />
        <StatCard label="Nilai pembelian" value={rupiah(totalValue)} icon={Wallet} tone="emerald" />
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

        <form onSubmit={onSubmit} className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_0.8fr_1fr_auto] lg:items-end">
          <Field label="Produk" htmlFor="stockin-product">
            <select
              id="stockin-product"
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              className={selectClass}
            >
              <option value="">Pilih produk aktif</option>
              {activeProducts.map((product) => (
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
          <button type="submit" className={`${primaryButton} h-[42px]`}>
            <PackagePlus size={16} />
            Simpan
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
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-sm font-semibold text-ink">Riwayat barang masuk</h2>
            <p className="mt-0.5 text-xs text-ink-soft">{filtered.length} transaksi</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/70"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Cari produk..."
              aria-label="Cari riwayat barang masuk"
              className={`${inputClass} py-2 pl-9 text-xs`}
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={pageData.items}
          rowKey={(item) => item.id}
          empty={
            <EmptyState
              icon={<PackagePlus size={24} strokeWidth={1.9} />}
              title="Belum ada barang masuk"
              description="Catat pembelian pertama lewat form di atas."
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
