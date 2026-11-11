import { useMemo } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  CalendarDays,
  CircleAlert,
  CircleCheck,
  Package,
  ShieldCheck,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Wallet,
  Warehouse,
} from "lucide-react"
import PageHeader from "../components/PageHeader"
import StatCard from "../components/StatCard"
import TrendChart from "../components/TrendChart"
import Badge from "../components/Badge"
import { useAppStore } from "../store/useAppStore"
import { angka, dateKey, lastNDays, rupiah } from "../lib/format"

const renderedAt = new Date()

export default function OwnerDashboard() {
  const products = useAppStore((state) => state.products)
  const sales = useAppStore((state) => state.sales)
  const adjustments = useAppStore((state) => state.adjustments)
  const approveProduct = useAppStore((state) => state.approveProduct)
  const approveAdjustment = useAppStore((state) => state.approveAdjustment)
  const notify = useAppStore((state) => state.notify)

  const periodDays = useMemo(() => lastNDays(30), [])
  const startKey = periodDays[0]

  const periodSales = sales.filter(
    (sale) =>
      sale.status === "SUCCESS" &&
      sale.confirmedAt !== null &&
      dateKey(sale.confirmedAt) >= startKey,
  )
  const omzet = periodSales.reduce((total, sale) => total + sale.total, 0)
  const totalHpp = periodSales.reduce((total, sale) => total + (sale.totalHpp ?? 0), 0)
  const grossProfit = omzet - totalHpp
  const grossMargin = omzet === 0 ? 0 : (grossProfit / omzet) * 100

  const damaged = adjustments.filter(
    (item) =>
      item.type === "DAMAGED" &&
      item.status === "APPROVED" &&
      item.decidedAt !== null &&
      dateKey(item.decidedAt) >= startKey,
  )
  const damagedUnits = damaged.reduce((total, item) => total + Math.abs(item.qtyChange), 0)
  const damagedLoss = damaged.reduce((total, item) => total + (item.lossValue ?? 0), 0)
  const profitAfterLoss = grossProfit - damagedLoss

  const activeProducts = products.filter((product) => product.status === "ACTIVE")
  const totalUnits = activeProducts.reduce((total, product) => total + product.stock, 0)
  const inventoryValue = activeProducts.reduce(
    (total, product) => total + product.stock * product.avgCost,
    0,
  )
  const lowStock = activeProducts
    .filter((product) => product.stock <= product.minStock)
    .sort((a, b) => a.stock - b.stock)
  const outOfStockCount = activeProducts.filter((product) => product.stock === 0).length

  const pendingProducts = products.filter((product) => product.status === "PENDING_APPROVAL")
  const pendingAdjustments = adjustments.filter((item) => item.status === "PENDING")

  const trend = useMemo(() => {
    return lastNDays(14).map((day) => {
      const value = sales
        .filter(
          (sale) =>
            sale.status === "SUCCESS" &&
            sale.confirmedAt !== null &&
            dateKey(sale.confirmedAt) === day,
        )
        .reduce((total, sale) => total + sale.total, 0)
      return { date: day, value }
    })
  }, [sales])

  const periodLabel = `${new Date(`${startKey}T00:00:00`).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  })} – ${renderedAt.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`

  const onApproveProduct = (id: number, name: string) => {
    const result = approveProduct(id)
    notify(
      result.message ?? (result.ok ? `${name} disetujui.` : "Gagal menyetujui produk."),
      result.ok ? "success" : "error",
    )
  }

  const onApproveAdjustment = (id: number) => {
    const result = approveAdjustment(id)
    notify(result.message ?? (result.ok ? "Adjustment disetujui." : "Gagal."), result.ok ? "success" : "error")
  }

  return (
    <div className="rise space-y-6">
      <PageHeader
        eyebrow="Owner"
        title="Ringkasan usaha"
        description="Pantau omzet, laba, kerugian, dan setujui permintaan manager dari satu halaman."
        actions={
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft">
            <CalendarDays size={14} />
            30 hari · {periodLabel}
          </span>
        }
      />

      <section aria-label="Ringkasan keuangan" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Omzet" value={rupiah(omzet)} hint={`${periodSales.length} penjualan sukses`} icon={TrendingUp} tone="emerald" />
        <StatCard label="HPP" value={rupiah(totalHpp)} hint="Harga pokok penjualan" icon={Wallet} tone="sky" />
        <StatCard
          label="Laba kotor"
          value={rupiah(grossProfit)}
          hint={`Margin ${grossMargin.toFixed(2)}%`}
          icon={CircleCheck}
          tone="accent"
        />
        <StatCard
          label="Setelah kerugian"
          value={rupiah(profitAfterLoss)}
          hint={`Kerugian ${rupiah(damagedLoss)}`}
          icon={TrendingDown}
          tone={profitAfterLoss < 0 ? "red" : "slate"}
        />
      </section>

      <section aria-label="Ringkasan inventori" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Nilai inventori" value={rupiah(inventoryValue)} hint="Stok × HPP rata-rata" icon={Warehouse} tone="accent" />
        <StatCard label="Total unit stok" value={angka(totalUnits)} hint={`${activeProducts.length} produk aktif`} icon={Package} tone="sky" />
        <StatCard label="Stok rendah" value={angka(lowStock.length)} hint={`${outOfStockCount} produk habis`} icon={CircleAlert} tone="amber" />
        <StatCard label="Barang rusak" value={angka(damagedUnits)} hint={`${damaged.length} adjustment disetujui`} icon={TrendingDown} tone="red" />
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-ink">Tren omzet 14 hari</h2>
              <p className="mt-0.5 text-sm text-ink-soft">
                Hanya penjualan yang sudah dikonfirmasi.
              </p>
            </div>
            <Badge tone="accent">WIB</Badge>
          </div>
          <div className="mt-5">
            <TrendChart data={trend} />
          </div>
        </section>

        <aside className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-ink">Menunggu persetujuan</h2>
              <p className="mt-0.5 text-sm text-ink-soft">Permintaan dari manager.</p>
            </div>
            <ShieldCheck size={18} className="text-ink-soft" />
          </div>

          {pendingProducts.length === 0 && pendingAdjustments.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-line px-4 py-8 text-center">
              <CircleCheck size={22} className="mx-auto text-emerald-600" />
              <p className="mt-2 text-sm font-semibold text-ink">Tidak ada antrean</p>
              <p className="mt-0.5 text-xs text-ink-soft">Semua permintaan sudah diputuskan.</p>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-line">
              {pendingProducts.slice(0, 3).map((product) => (
                <div key={`product-${product.id}`} className="flex items-start gap-3 py-3 first:pt-0">
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink">{product.name}</span>
                    <span className="block truncate text-xs text-ink-soft">
                      Produk baru · {product.sku}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onApproveProduct(product.id, product.name)}
                    className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                  >
                    Setujui
                  </button>
                </div>
              ))}

              {pendingAdjustments.slice(0, 3).map((item) => {
                const product = products.find((candidate) => candidate.id === item.productId)
                return (
                  <div key={`adjustment-${item.id}`} className="flex items-start gap-3 py-3 first:pt-0">
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink">
                        {product?.name ?? "Produk"}
                      </span>
                      <span className="block truncate text-xs text-ink-soft">
                        {item.type === "DAMAGED" ? "Barang rusak" : "Koreksi"} ·{" "}
                        {item.qtyChange > 0 ? "+" : ""}
                        {item.qtyChange} unit
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onApproveAdjustment(item.id)}
                      className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                    >
                      Setujui
                    </button>
                  </div>
                )
              })}

              <Link
                to={pendingProducts.length > 0 ? "/owner/products" : "/owner/adjustments"}
                className="group flex items-center justify-between gap-2 py-3 text-xs font-semibold text-accent-hover last:pb-0"
              >
                Lihat semua permintaan
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          )}
        </aside>
      </div>

      <section className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-6">
          <div>
            <h2 className="text-sm font-semibold text-ink">Stok perlu restock</h2>
            <p className="mt-0.5 text-xs text-ink-soft">Produk aktif dengan stok di bawah minimum.</p>
          </div>
          <Link
            to="/owner/stockin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-hover hover:underline"
          >
            Catat barang masuk
            <ArrowRight size={14} />
          </Link>
        </div>

        {lowStock.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-ink-soft sm:px-6">
            Semua produk aktif masih di atas stok minimum.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {lowStock.slice(0, 5).map((product) => (
              <li key={product.id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">{product.name}</span>
                  <span className="block text-xs text-ink-soft">
                    {product.sku} · minimum {angka(product.minStock)} {product.unit}
                  </span>
                </span>
                <Badge tone={product.stock === 0 ? "danger" : "warning"}>
                  Sisa {angka(product.stock)} {product.unit}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-ink">Ringkasan penjualan</h2>
            <p className="mt-0.5 text-sm text-ink-soft">
              {periodSales.length} penjualan sukses · {sales.filter((sale) => sale.status === "PENDING").length} pending
            </p>
          </div>
          <Link
            to="/owner/sales"
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:border-accent hover:text-accent-hover"
          >
            <ShoppingCart size={14} />
            Lihat penjualan
          </Link>
        </div>
      </section>
    </div>
  )
}
