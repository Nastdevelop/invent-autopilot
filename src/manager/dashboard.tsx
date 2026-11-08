import { Link } from "react-router-dom"
import {
    ArrowLeftRight,
    CalendarDays,
    ChartColumn,
    ChevronRight,
    CircleCheck,
    Package,
    TrendingDown,
    TrendingUp,
    Wallet,
} from "lucide-react"

const metrik = [
    {
        label: "Operasional",
        nilai: "Rp 124.000.000",
        icon: Wallet,
        chip: "bg-sky-50 text-sky-600",
    },
    {
        label: "Omzet",
        nilai: "Rp 50.000.000",
        icon: TrendingUp,
        chip: "bg-blue-50 text-blue-600",
    },
    {
        label: "Profit",
        nilai: "Rp 40.000.000",
        icon: CircleCheck,
        chip: "bg-emerald-50 text-emerald-600",
    },
    {
        label: "Kerugian",
        nilai: "Rp 1.000.000",
        icon: TrendingDown,
        chip: "bg-red-50 text-red-600",
    },
]

const aksi = [
    {
        to: "/manager/liststock",
        label: "List Stock",
        teks: "Tambah dan kelola produk",
        icon: Package,
    },
    {
        to: "/manager/movement",
        label: "Movement",
        teks: "Catat barang masuk dan keluar",
        icon: ArrowLeftRight,
    },
]

export default function Mdashboard() {
    return (
        <div className="rise space-y-6">

            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-hover">Dashboard</p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                        Ringkasan usaha
                    </h1>
                    <p className="mt-1.5 text-sm text-ink-soft">
                        Laporan bulanan stok, transaksi, dan keuangan.
                    </p>
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft">
                    <CalendarDays size={14} />
                    Data contoh
                </span>
            </header>

            <section aria-label="Ringkasan angka" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {metrik.map((item) => {
                    const Icon = item.icon
                    return (
                        <article
                            key={item.label}
                            className="rounded-2xl border border-line bg-surface p-4 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-ink/5 sm:p-5"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs font-semibold text-ink-soft">{item.label}</p>
                                <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${item.chip}`}>
                                    <Icon size={17} strokeWidth={2.1} />
                                </span>
                            </div>
                            <p className="mt-3 text-xl font-semibold tracking-tight text-ink tabular-nums sm:text-2xl">
                                {item.nilai}
                            </p>
                        </article>
                    )
                })}
            </section>

            <div className="grid gap-4 lg:grid-cols-3">

                <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6 lg:col-span-2">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h2 className="text-base font-semibold text-ink">Tren omzet</h2>
                            <p className="mt-0.5 text-sm text-ink-soft">Grafik akan terisi setelah transaksi tercatat.</p>
                        </div>
                        <span className="rounded-full bg-paper px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
                            Ilustrasi
                        </span>
                    </div>

                    <div className="relative mt-5 h-56 overflow-hidden rounded-xl border border-line/70 bg-surface-muted sm:h-64">
                        <div className="absolute inset-0 flex flex-col justify-between py-6">
                            {[0, 1, 2, 3].map((line) => (
                                <div key={line} className="h-px w-full bg-line/60" />
                            ))}
                        </div>

                        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
                            <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent-hover">
                                <ChartColumn size={22} strokeWidth={2.1} />
                            </span>
                            <p className="mt-3 text-sm font-semibold text-ink">Belum ada grafik</p>
                            <p className="mt-1 max-w-xs text-xs leading-relaxed text-ink-soft">
                                Tambahkan produk dan catat transaksi agar tren omzet bisa ditampilkan.
                            </p>
                        </div>
                    </div>
                </section>

                <aside className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
                    <h2 className="text-base font-semibold text-ink">Aksi cepat</h2>
                    <p className="mt-0.5 text-sm text-ink-soft">Lanjutkan pekerjaan harian.</p>

                    <div className="mt-4 divide-y divide-line">
                        {aksi.map((item) => {
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className="group flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"
                                >
                                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-paper text-ink-soft transition-colors group-hover:bg-accent-soft group-hover:text-accent-hover">
                                        <Icon size={18} strokeWidth={2.1} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-semibold text-ink">{item.label}</span>
                                        <span className="block truncate text-xs text-ink-soft">{item.teks}</span>
                                    </span>
                                    <ChevronRight
                                        size={16}
                                        className="shrink-0 text-ink-soft/60 transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                                    />
                                </Link>
                            )
                        })}
                    </div>
                </aside>

            </div>

        </div>
    )
}
