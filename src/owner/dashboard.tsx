import { useNavigate } from "react-router-dom"
import { ArrowRight, CircleCheck, LogOut, ShieldCheck, Store, Wrench } from "lucide-react"
import PageHeader from "../components/PageHeader"
import Badge from "../components/Badge"
import { useAuth } from "../auth/useAuth"
import { primaryButton } from "../lib/ui"

const rencana = [
  "Dashboard summary: omzet, HPP, laba kotor, kerugian barang rusak.",
  "Grafik tren penjualan harian dan daftar stok rendah.",
  "Persetujuan produk baru dari manager.",
  "Persetujuan adjustment barang rusak dan koreksi stok.",
  "Melihat semua penjualan dan membatalkan penjualan sukses.",
]

export default function OwnerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const onLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <div className="min-h-dvh bg-paper px-4 py-8 sm:px-6 md:px-10">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <PageHeader
          eyebrow="Owner"
          title="Dashboard owner"
          description="Halaman owner masih tahap berikutnya. Untuk sekarang, gunakan akun manager untuk mencoba alur operasional."
          actions={
            <button type="button" onClick={onLogout} className={primaryButton}>
              <LogOut size={16} />
              Keluar
            </button>
          }
        />

        <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-hover">
                <ShieldCheck size={21} strokeWidth={2.1} />
              </span>
              <div>
                <h2 className="text-base font-semibold text-ink">Halo, {user?.name ?? "Owner"}</h2>
                <p className="mt-0.5 text-sm text-ink-soft">
                  Role owner sudah terhubung ke mock store. UI penuh menyusul.
                </p>
              </div>
            </div>
            <Badge tone="warning">Fase 2</Badge>
          </div>

          <ul className="mt-5 space-y-2.5">
            {rencana.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-ink-soft">
                <CircleCheck size={16} className="mt-0.5 shrink-0 text-accent" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <article className="rounded-2xl border border-line bg-surface p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-paper text-ink-soft">
              <Store size={18} strokeWidth={2.1} />
            </span>
            <h3 className="mt-3 text-sm font-semibold text-ink">Coba sebagai manager</h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">
              Logout lalu masuk dengan <span className="font-semibold text-ink">manager@demo.com</span>{" "}
              untuk mencoba produk, barang masuk, penjualan, dan adjustment.
            </p>
          </article>

          <article className="rounded-2xl border border-line bg-surface p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-paper text-ink-soft">
              <Wrench size={18} strokeWidth={2.1} />
            </span>
            <h3 className="mt-3 text-sm font-semibold text-ink">Data mock interaktif</h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">
              Semua perubahan disimpan di state zustand, bukan ke API. Refresh halaman
              mengembalikan data seed.
            </p>
            <button
              type="button"
              onClick={onLogout}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-hover hover:underline"
            >
              Ke halaman login
              <ArrowRight size={14} />
            </button>
          </article>
        </section>
      </div>
    </div>
  )
}
