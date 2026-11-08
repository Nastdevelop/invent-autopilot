import { Link } from 'react-router-dom'
import { ArrowLeft, Boxes, FileQuestion } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-paper px-5 py-12 text-center">

      <div className="pointer-events-none absolute -top-24 right-[-10%] size-[320px] rounded-full bg-accent/10 blur-3xl" />

      <div className="relative w-full max-w-md rounded-2xl border border-line bg-surface px-6 py-10 shadow-sm shadow-ink/5 sm:px-10">

        <div className="mx-auto flex w-fit items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-brand text-accent">
            <Boxes size={18} strokeWidth={2.4} />
          </span>
          <span className="text-sm font-semibold tracking-tight text-ink">Inventor</span>
        </div>

        <div className="mx-auto mt-8 flex size-16 items-center justify-center rounded-2xl bg-paper text-ink-soft">
          <FileQuestion size={28} />
        </div>

        <p className="mt-5 text-5xl font-semibold tracking-tight text-ink">404</p>
        <h1 className="mt-2 text-lg font-semibold text-ink">Halaman tidak ditemukan</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">
          Halaman yang Anda cari mungkin sudah dihapus, diubah namanya, atau alamatnya salah.
        </p>

        <Link
          to="/"
          className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-soft"
        >
          <ArrowLeft size={16} />
          Kembali ke beranda
        </Link>

      </div>
    </div>
  )
}
