import { Link, NavLink, useNavigate } from "react-router-dom"
import {
  ArrowLeftRight,
  Boxes,
  LayoutDashboard,
  LogOut,
  Package,
  PackagePlus,
  ShoppingCart,
  Wrench,
} from "lucide-react"
import { useAuth } from "../auth/useAuth"

const dataside = [
  { id: 1, nama: "Dashboard", link: "/owner/dashboard", icon: LayoutDashboard },
  { id: 2, nama: "Produk", link: "/owner/products", icon: Package },
  { id: 3, nama: "Barang Masuk", link: "/owner/stockin", icon: PackagePlus },
  { id: 4, nama: "Penjualan", link: "/owner/sales", icon: ShoppingCart },
  { id: 5, nama: "Adjustment", link: "/owner/adjustments", icon: Wrench },
  { id: 6, nama: "Movement", link: "/owner/movement", icon: ArrowLeftRight },
]

export default function SidebarOwner() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const onLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <aside className="sticky top-0 z-40 border-b border-white/10 bg-brand text-white md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-b-0 md:border-r">
      <div className="flex flex-col gap-2 px-4 py-3 md:h-full md:gap-0 md:px-4 md:py-6">

        <div className="flex items-center justify-between gap-3 md:block">
          <Link to="/owner/dashboard" className="flex shrink-0 items-center gap-2.5 md:px-1">
            <span className="grid size-9 place-items-center rounded-xl bg-accent text-brand">
              <Boxes size={18} strokeWidth={2.4} />
            </span>
            <span className="hidden sm:block">
              <span className="block text-sm font-semibold tracking-tight">Inventor</span>
              <span className="block text-[11px] text-white/50">Owner workspace</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 md:hidden">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/50">
              Owner
            </span>
            <button
              type="button"
              onClick={onLogout}
              aria-label="Keluar"
              className="grid size-8 place-items-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <nav
          aria-label="Navigasi owner"
          className="no-scrollbar flex items-center gap-0.5 overflow-x-auto sm:gap-1 md:mt-8 md:flex-col md:items-stretch md:overflow-visible"
        >
          {dataside.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.id}
                to={item.link}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold transition-colors sm:px-3 sm:text-sm ${
                    isActive
                      ? "bg-accent-soft text-brand"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={17} strokeWidth={2.2} />
                {item.nama}
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-auto hidden flex-col gap-2 md:flex">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-bold text-brand">
              {user?.name.charAt(0) ?? "O"}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{user?.name ?? "Owner"}</span>
              <span className="block truncate text-[11px] text-white/50">{user?.email ?? "Pantau usaha"}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut size={15} />
            Keluar
          </button>
        </div>

      </div>
    </aside>
  )
}
