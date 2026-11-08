import { Link } from "react-router-dom"
import { ArrowLeftRight, ArrowRight, ClipboardList, Package } from "lucide-react"

const ringkasan = [
    { label: "Barang masuk", icon: Package, chip: "bg-emerald-50 text-emerald-600" },
    { label: "Barang keluar", icon: ClipboardList, chip: "bg-amber-50 text-amber-600" },
]

export default function Movement() {
    return (
        <div className="rise space-y-6">

            <header>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-hover">Pergerakan</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Movement</h1>
                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-soft">
                    Catatan barang masuk dan keluar agar jumlah stok selalu sesuai.
                </p>
            </header>

            <section aria-label="Ringkasan pergerakan" className="grid gap-3 sm:grid-cols-2">
                {ringkasan.map((item) => {
                    const Icon = item.icon
                    return (
                        <article key={item.label} className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs font-semibold text-ink-soft">{item.label}</p>
                                <span className={`grid size-9 place-items-center rounded-xl ${item.chip}`}>
                                    <Icon size={17} strokeWidth={2.1} />
                                </span>
                            </div>
                            <p className="mt-3 text-xl font-semibold tracking-tight text-ink sm:text-2xl">—</p>
                            <p className="mt-1 text-xs text-ink-soft">Belum ada catatan</p>
                        </article>
                    )
                })}
            </section>

            <section className="rounded-2xl border border-line bg-surface px-5 py-14 text-center sm:px-8 sm:py-16">
                <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-paper text-ink-soft">
                    <ArrowLeftRight size={24} strokeWidth={1.9} />
                </span>
                <h2 className="mt-4 text-sm font-semibold text-ink">Belum ada pergerakan stok</h2>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-soft">
                    Setelah produk ditambahkan, barang masuk dan keluar akan tercatat di halaman ini.
                </p>
                <Link
                    to="/manager/liststock"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-soft"
                >
                    Ke daftar produk
                    <ArrowRight size={15} />
                </Link>
            </section>

        </div>
    )
}
