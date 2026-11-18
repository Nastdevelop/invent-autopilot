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
import { ErrorBlock, LoadingBlock } from "../components/QueryFeedback"
import {
  useAdjustments,
  useApproveAdjustment,
  useApproveProduct,
  useDashboardSummary,
  useLowStock,
  useProducts,
  useSales,
  useSalesTrend,
} from "../api/hooks"
import { errorMessage } from "../api/client"
import { useToastStore } from "../store/useToastStore"
import { angka, lastNDays, rupiah, shortDate } from "../lib/format"

export default function OwnerDashboard() {
  const notify = useToastStore((state) => state.notify)

  const period = useMemo(() => {
    const days = lastNDays(30)
    return { from: days[0], to: days[days.length - 1] }
  }, [])

  const summaryQuery = useDashboardSummary(period)
  const trendQuery = useSalesTrend(period)
  const lowStockQuery = useLowStock({ limit: 5 })
  const pendingProducts = useProducts({ status: "PENDING_APPROVAL", limit: 100 })
  const pendingAdjustments = useAdjustments({ status: "PENDING", limit: 100 })
  const pendingSales = useSales({ status: "PENDING", limit: 1 })

  const approveProduct = useApproveProduct()
  const approveAdjustment = useApproveAdjustment()

  const summary = summaryQuery.data
  const trend = (trendQuery.data?.series ?? []).map((point) => ({
    date: point.date,
    value: point.omzet,
  }))
  const lowStock = lowStockQuery.data?.items ?? []
  const productQueue = pendingProducts.data?.items ?? []
  const adjustmentQueue = pendingAdjustments.data?.items ?? []

  const onApproveProduct = async (id: number, name: string) => {
    try {
      await approveProduct.mutateAsync(id)
      notify(`Produk ${name} disetujui dan sekarang aktif.`, "success")
    } catch (error) {
      notify(errorMessage(error), "error")
    }
  }

  const onApproveAdjustment = async (id: number) => {
    try {
      await approveAdjustment.mutateAsync(id)
      notify(`Adjustment #${id} disetujui. Stok sudah diperbarui.`, "success")
    } catch (error) {
      notify(errorMessage(error), "error")
    }
  }

  const periodLabel =
    summary?.period
      ? `${shortDate(summary.period.from)} – ${shortDate(summary.period.to)}`
      : `${shortDate(period.from)} – ${shortDate(period.to)}`

  const isPending = summaryQuery.isPending || trendQuery.isPending || lowStockQuery.isPending
  const error = summaryQuery.error ?? trendQuery.error ?? lowStockQuery.error

  if (isPending) return <LoadingBlock label="Memuat ringkasan usaha..." />
  if (error || !summary) {
    return (
      <ErrorBlock
        error={error}
        onRetry={() => {
          void summaryQuery.refetch()
          void trendQuery.refetch()
          void lowStockQuery.refetch()
        }}
      />
    )
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
        <StatCard
          label="Omzet"
          value={rupiah(summary.sales.omzet)}
          hint={`${angka(summary.sales.count)} penjualan sukses`}
          icon={TrendingUp}
          tone="emerald"
        />
        <StatCard
          label="HPP"
          value={rupiah(summary.sales.hpp)}
          hint="Harga pokok penjualan"
          icon={Wallet}
          tone="sky"
        />
        <StatCard
          label="Laba kotor"
          value={rupiah(summary.sales.grossProfit)}
          hint={`Margin ${summary.sales.grossMarginPercent.toFixed(2)}%`}
          icon={CircleCheck}
          tone="accent"
        />
        <StatCard
          label="Setelah kerugian"
          value={rupiah(summary.profitAfterLoss)}
          hint={`Kerugian ${rupiah(summary.damaged.lossValue)}`}
          icon={TrendingDown}
          tone={summary.profitAfterLoss < 0 ? "red" : "slate"}
        />
      </section>

      <section aria-label="Ringkasan inventori" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Nilai inventori"
          value={rupiah(summary.inventory.totalValue)}
          hint="Stok × HPP rata-rata"
          icon={Warehouse}
          tone="accent"
        />
        <StatCard
          label="Total unit stok"
          value={angka(summary.inventory.totalUnits)}
          hint={`${angka(summary.inventory.productCount)} produk aktif`}
          icon={Package}
          tone="sky"
        />
        <StatCard
          label="Stok rendah"
          value={angka(summary.inventory.lowStockCount)}
          hint={`${angka(summary.inventory.outOfStockCount)} produk habis`}
          icon={CircleAlert}
          tone="amber"
        />
        <StatCard
          label="Barang rusak"
          value={angka(summary.damaged.units)}
          hint={`${angka(summary.damaged.count)} adjustment disetujui`}
          icon={TrendingDown}
          tone="red"
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-ink">Tren omzet 30 hari</h2>
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

          {productQueue.length === 0 && adjustmentQueue.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-line px-4 py-8 text-center">
              <CircleCheck size={22} className="mx-auto text-emerald-600" />
              <p className="mt-2 text-sm font-semibold text-ink">Tidak ada antrean</p>
              <p className="mt-0.5 text-xs text-ink-soft">Semua permintaan sudah diputuskan.</p>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-line">
              {productQueue.slice(0, 3).map((product) => (
                <div
                  key={`product-${product.id}`}
                  className="flex items-start gap-3 py-3 first:pt-0"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink">{product.name}</span>
                    <span className="block truncate text-xs text-ink-soft">
                      Produk baru · {product.sku}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onApproveProduct(product.id, product.name)}
                    disabled={approveProduct.isPending}
                    className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                  >
                    Setujui
                  </button>
                </div>
              ))}

              {adjustmentQueue.slice(0, 3).map((item) => (
                <div
                  key={`adjustment-${item.id}`}
                  className="flex items-start gap-3 py-3 first:pt-0"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink">
                      {item.product.name}
                    </span>
                    <span className="block truncate text-xs text-ink-soft">
                      {item.type === "DAMAGED" ? "Barang rusak" : "Koreksi"} ·{" "}
                      {item.qtyChange > 0 ? "+" : ""}
                      {item.qtyChange} unit · {item.requestedBy.name}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onApproveAdjustment(item.id)}
                    disabled={approveAdjustment.isPending}
                    className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                  >
                    Setujui
                  </button>
                </div>
              ))}

              <Link
                to={productQueue.length > 0 ? "/owner/products" : "/owner/adjustments"}
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
            {lowStock.map((product) => (
              <li key={product.id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">{product.name}</span>
                  <span className="block text-xs text-ink-soft">
                    {product.sku} · minimum {angka(product.minStock)} {product.unit}
                  </span>
                </span>
                <Badge tone={product.isOutOfStock ? "danger" : "warning"}>
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
              {angka(summary.sales.count)} penjualan sukses ·{" "}
              {angka(pendingSales.data?.total ?? 0)} pending ·{" "}
              {angka(summary.sales.cancelledCount)} dibatalkan
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
