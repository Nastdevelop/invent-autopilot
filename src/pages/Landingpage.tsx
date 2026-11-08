import { Link } from "react-router-dom"
import { ArrowRight, Boxes, ChartColumn, ClipboardList, Warehouse } from "lucide-react"

const fitur = [
    {
        icon: Warehouse,
        judul: "Stok gudang",
        teks: "Catat barang masuk dan keluar supaya jumlah stok selalu akurat.",
    },
    {
        icon: ClipboardList,
        judul: "Transaksi kasir",
        teks: "Proses penjualan harian tanpa perlu mencatat ulang di buku terpisah.",
    },
    {
        icon: ChartColumn,
        judul: "Laporan usaha",
        teks: "Pantau omzet, profit, dan kerugian dalam satu tampilan ringkas.",
    },
]

export default function Landing() {
    return (
        <div className="relative flex min-h-dvh flex-col overflow-hidden bg-paper">

            {/* Dekorasi latar */}
            <div className="pointer-events-none absolute -top-32 right-[-10%] size-[420px] rounded-full bg-accent/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-[-15%] left-[-10%] size-[360px] rounded-full bg-brand/5 blur-3xl" />

            <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
                <Link to="/" className="flex items-center gap-2.5">
                    <span className="grid size-9 place-items-center rounded-xl bg-brand text-accent">
                        <Boxes size={18} strokeWidth={2.4} />
                    </span>
                    <span className="text-sm font-semibold tracking-tight text-ink">Inventor</span>
                </Link>

                <Link
                    to="/login"
                    className="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent-hover"
                >
                    Masuk
                </Link>
            </header>

            <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14">

                <div className="rise max-w-3xl">
                    <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-hover">
                        <span className="size-1.5 rounded-full bg-accent" />
                        Platform inventori & kasir
                    </span>

                    <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
                        Kelola stok, transaksi, dan laporan{" "}
                        <span className="text-accent">dalam satu tempat.</span>
                    </h1>

                    <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
                        Sebuah platform untuk memanage usaha secara autopilot, mulai dari stock gudang,
                        transaksi, sampai laporan keuangan.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Link
                            to="/login"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-soft sm:w-auto"
                        >
                            Masuk ke dashboard
                            <ArrowRight size={16} />
                        </Link>
                        <a
                            href="#fitur"
                            className="inline-flex w-full items-center justify-center rounded-xl border border-line bg-surface px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent-hover sm:w-auto"
                        >
                            Lihat fitur
                        </a>
                    </div>
                </div>

                <section id="fitur" className="rise rise-1 mt-14 grid gap-4 sm:mt-20 sm:grid-cols-2 lg:grid-cols-3">
                    {fitur.map((item) => {
                        const Icon = item.icon
                        return (
                            <article
                                key={item.judul}
                                className="rounded-2xl border border-line bg-surface p-5 transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg hover:shadow-ink/5 sm:p-6"
                            >
                                <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent-hover">
                                    <Icon size={20} strokeWidth={2.2} />
                                </span>
                                <h2 className="mt-4 text-base font-semibold text-ink">{item.judul}</h2>
                                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{item.teks}</p>
                            </article>
                        )
                    })}
                </section>

            </main>

            <footer className="relative z-10 border-t border-line/70 px-5 py-5 sm:px-8">
                <p className="mx-auto w-full max-w-6xl text-xs text-ink-soft">
                    © 2026 Inventor — dibuat untuk usaha yang rapi.
                </p>
            </footer>

        </div>
    )
}
