import { Filter, PackageOpen, Plus, Search } from "lucide-react"

export default function Liststockm() {
    return (
        <div className="rise space-y-6">

            <header>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-hover">Katalog</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">List Stock</h1>
                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-soft">
                    Tempat menambahkan barang agar terdaftar di laporan maupun transaksi.
                </p>
            </header>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/70" />
                    <input
                        type="search"
                        placeholder="Cari produk..."
                        aria-label="Cari produk"
                        className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-accent focus:ring-2 focus:ring-accent/15"
                    />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                    <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent-hover"
                    >
                        <Filter size={16} />
                        Filter
                    </button>
                    <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-soft"
                    >
                        <Plus size={16} />
                        Produk
                    </button>
                </div>
            </div>

            <section className="overflow-hidden rounded-2xl border border-line bg-surface">

                <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-6">
                    <div>
                        <h2 className="text-sm font-semibold text-ink">Daftar produk</h2>
                        <p className="mt-0.5 text-xs text-ink-soft">0 produk terdaftar</p>
                    </div>
                    <span className="rounded-full bg-paper px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
                        Semua
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left">
                        <thead>
                            <tr className="border-b border-line bg-surface-muted">
                                <th scope="col" className="px-4 py-2.5 text-xs font-semibold text-ink-soft sm:px-6">Nama produk</th>
                                <th scope="col" className="px-4 py-2.5 text-xs font-semibold text-ink-soft sm:px-6">Harga</th>
                                <th scope="col" className="px-4 py-2.5 text-xs font-semibold text-ink-soft sm:px-6">Kategori</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={3} className="px-4 py-14 text-center sm:px-6 sm:py-16">
                                    <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-paper text-ink-soft">
                                        <PackageOpen size={24} strokeWidth={1.9} />
                                    </span>
                                    <p className="mt-4 text-sm font-semibold text-ink">Belum ada produk</p>
                                    <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-ink-soft">
                                        Tambahkan produk pertama supaya stok dan transaksi bisa dicatat.
                                    </p>
                                    <button
                                        type="button"
                                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-soft"
                                    >
                                        <Plus size={15} />
                                        Tambah produk
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </section>

        </div>
    )
}
