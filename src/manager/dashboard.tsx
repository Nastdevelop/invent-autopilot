import { useMemo } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  CalendarDays,
  CircleAlert,
  CircleCheck,
  Package,
  ShoppingCart,
  TrendingUp,
  Wrench,
} from "lucide-react"
import PageHeader from "../components/PageHeader"
import StatCard from "../components/StatCard"
import TrendChart from "../components/TrendChart"
import Badge from "../components/Badge"
import { useAppStore } from "../store/useAppStore"
import { angka, dateKey, lastNDays, rupiah, tanggalWaktu } from "../lib/format"

const renderedAt = new Date()

export default function Mdashboard() {
  const products = useAppStore((state) => state.products)
  const sales = useAppStore((state) => state.sales)
  const adjustments = useAppStore((state) => state.adjustments)
  const currentUserId = useAppStore((state) => state.currentUserId)

  const activeProducts = products.filter((product) => product.status === "ACTIVE")
  const lowStock = activeProducts
    .filter((product) => product.stock <= product.minStock)
    .sort((a, b) => a.stock - b.stock)
  const pendingSales = sales.filter((sale) => sale.status === "PENDING")
  const pendingAdjustments = adjustments.filter(
    (item) => item.status === "PENDING" && item.requestedBy === currentUserId,
  )

  const today = dateKey(renderedAt.toISOString())
  const todayLabel = renderedAt.toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
  const updatedAt = renderedAt.toISOString()
  const omzetToday = sales
    .filter(
      (sale) =>
        sale.status === "SUCCESS" &&
        sale.confirmedAt !== null &&
        dateKey(sale.confirmedAt) === today,
    )
    .reduce((total, sale) => total + sale.total, 0)

  const trend = useMemo(() => {
    const days = lastNDays(7)
    return days.map((day) => {
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

  const pendingQueue = [
    ...pendingSales.map((sale) => ({
      id: `sale-${sale.id}`,
      title: `Penjualan #${sale.id}`,
      detail: `${sale.items.length} item · ${rupiah(sale.total)}`,
      to: "/manager/sales",
      tone: "warning" as const,
      label: "Pending",
    })),
    ...pendingAdjustments.map((item) => {
      const product = products.find((candidate) => candidate.id === item.productId)
      return {
        id: `adjustment-${item.id}`,
        title: `Adjustment #${item.id}`,
        detail: `${product?.name ?? "Produk"} · ${item.qtyChange} unit`,
        to: "/manager/adjustments",
        tone: "info" as const,
        label: "Menunggu",
      }
    }),
  ].slice(0, 5)

  return (
    <div className="rise space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="Ringkasan operasional"
        description="Pantau stok, penjualan, dan pengajuan yang perlu ditindaklanjuti hari ini."
        actions={
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft">
            <CalendarDays size={14} />
            {todayLabel}
          </span>
        }
      />

      <section aria-label="Ringkasan angka" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Produk aktif"
          value={angka(activeProducts.length)}
          hint={`${products.length} produk terdaftar`}
          icon={Package}
          tone="accent"
        />
        <StatCard
          label="Stok rendah"
          value={angka(lowStock.length)}
          hint="Stok di bawah minimum"
          icon={CircleAlert}
          tone="amber"
        />
        <StatCard
          label="Penjualan pending"
          value={angka(pendingSales.length)}
          hint="Belum dikonfirmasi"
          icon={ShoppingCart}
          tone="sky"
        />
        <StatCard
          label="Omzet hari ini"
          value={rupiah(omzetToday)}
          hint="Penjualan sukses hari ini"
          icon={TrendingUp}
          tone="emerald"
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-ink">Tren omzet 7 hari</h2>
              <p className="mt-0.5 text-sm text-ink-soft">
                Berdasarkan penjualan yang sudah dikonfirmasi.
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
              <h2 className="text-base font-semibold text-ink">Perlu ditindaklanjuti</h2>
              <p className="mt-0.5 text-sm text-ink-soft">Antrean pending.</p>
            </div>
            <Wrench size={18} className="text-ink-soft" />
          </div>

          {pendingQueue.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-line px-4 py-8 text-center">
              <CircleCheck size={22} className="mx-auto text-emerald-600" />
              <p className="mt-2 text-sm font-semibold text-ink">Semua beres</p>
              <p className="mt-0.5 text-xs text-ink-soft">Tidak ada antrean pending.</p>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-line">
              {pendingQueue.map((item) => (
                <Link
                  key={item.id}
                  to={item.to}
                  className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink">{item.title}</span>
                    <span className="block truncate text-xs text-ink-soft">{item.detail}</span>
                  </span>
                  <Badge tone={item.tone}>{item.label}</Badge>
                  <ArrowRight
                    size={15}
                    className="shrink-0 text-ink-soft/60 transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                  />
                </Link>
              ))}
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
            to="/manager/stockin"
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

      <p className="text-xs text-ink-soft">
        Data masih memakai array lokal (mock). Terakhir diperbarui{" "}
        {tanggalWaktu(updatedAt)}.
      </p>
    </div>
  )
}
