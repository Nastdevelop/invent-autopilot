import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Boxes, CircleCheck, Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react"

const poin = [
    "Stok gudang tercatat otomatis",
    "Transaksi kasir lebih cepat",
    "Laporan keuangan siap dilihat",
]

export default function Login() {
    const [email, setEmail] = useState("")
    const [pw, setPw] = useState("")
    const [lihatPw, setLihatPw] = useState(false)

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
    }

    return (
        <div className="grid min-h-dvh bg-paper lg:grid-cols-[1.05fr_1fr]">

            {/* Panel branding — desktop */}
            <aside className="relative hidden overflow-hidden bg-brand p-12 text-white lg:flex lg:flex-col">
                <div className="bg-grid pointer-events-none absolute inset-0 opacity-70" />
                <div className="pointer-events-none absolute -right-24 top-1/4 size-72 rounded-full bg-accent/20 blur-3xl" />

                <Link to="/" className="relative flex items-center gap-2.5">
                    <span className="grid size-9 place-items-center rounded-xl bg-accent text-brand">
                        <Boxes size={18} strokeWidth={2.4} />
                    </span>
                    <span className="text-sm font-semibold tracking-tight">Inventor</span>
                </Link>

                <div className="relative my-auto max-w-md py-16">
                    <h2 className="text-4xl font-semibold leading-tight tracking-tight">
                        Semua stok dan transaksi, dalam satu catatan yang rapi.
                    </h2>
                    <p className="mt-4 text-sm leading-relaxed text-white/60">
                        Masuk untuk melanjutkan pekerjaan harian: kelola produk, catat pergerakan
                        barang, dan pantau laporan usaha.
                    </p>

                    <ul className="mt-8 space-y-3">
                        {poin.map((item) => (
                            <li key={item} className="flex items-center gap-3 text-sm text-white/80">
                                <CircleCheck size={18} className="shrink-0 text-accent" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="relative text-xs text-white/60">© 2026 Inventor</p>
            </aside>

            {/* Panel form */}
            <main className="flex items-center justify-center px-5 py-10 sm:px-8">
                <div className="w-full max-w-sm">

                    <div className="mb-8 flex items-center justify-between lg:hidden">
                        <Link to="/" className="flex items-center gap-2.5">
                            <span className="grid size-9 place-items-center rounded-xl bg-brand text-accent">
                                <Boxes size={18} strokeWidth={2.4} />
                            </span>
                            <span className="text-sm font-semibold tracking-tight text-ink">Inventor</span>
                        </Link>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft transition-colors hover:text-accent-hover"
                        >
                            <ArrowLeft size={14} />
                            Beranda
                        </Link>
                    </div>

                    <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm shadow-ink/5 sm:p-8">
                        <h1 className="text-2xl font-semibold tracking-tight text-ink">Masuk ke akun</h1>
                        <p className="mt-1.5 text-sm text-ink-soft">
                            Gunakan email dan kata sandi yang terdaftar.
                        </p>

                        <form onSubmit={onSubmit} className="mt-7 space-y-4">

                            <div>
                                <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-ink">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/70" />
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="nama@usaha.com"
                                        className="w-full rounded-xl border border-line bg-surface-muted py-2.5 pl-10 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent/15"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-ink">
                                    Kata sandi
                                </label>
                                <div className="relative">
                                    <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/70" />
                                    <input
                                        id="password"
                                        type={lihatPw ? "text" : "password"}
                                        autoComplete="current-password"
                                        value={pw}
                                        onChange={(e) => setPw(e.target.value)}
                                        placeholder="********"
                                        className="w-full rounded-xl border border-line bg-surface-muted py-2.5 pl-10 pr-11 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent/15"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setLihatPw((lihat) => !lihat)}
                                        aria-label={lihatPw ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                                        className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-paper hover:text-ink"
                                    >
                                        {lihatPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-soft"
                            >
                                <LogIn size={16} />
                                Masuk
                            </button>
                        </form>

                        <p className="mt-5 border-t border-line pt-5 text-center text-xs text-ink-soft">
                            Belum punya akun? Hubungi admin usaha untuk dibuatkan akses.
                        </p>
                    </div>

                    <p className="mt-6 text-center text-xs text-ink-soft">
                        <Link to="/" className="font-semibold text-accent-hover hover:underline">
                            Kembali ke beranda
                        </Link>
                    </p>

                </div>
            </main>

        </div>
    )
}
