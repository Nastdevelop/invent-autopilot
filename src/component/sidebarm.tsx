import { Link, NavLink } from "react-router-dom"
import { ArrowLeftRight, Boxes, LayoutDashboard, Package } from "lucide-react"

const dataside = [
    { id: 1, nama: 'Dashboard', link: "/manager/dashboard", icon: LayoutDashboard },
    { id: 2, nama: 'Movement', link: "/manager/movement", icon: ArrowLeftRight },
    { id: 3, nama: 'Stock', link: "/manager/liststock", icon: Package },
]

export default function Sidebar() {
    return (
        <aside className="sticky top-0 z-40 border-b border-white/10 bg-brand text-white md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-b-0 md:border-r">
            <div className="flex flex-col gap-2 px-4 py-3 md:h-full md:gap-0 md:px-4 md:py-6">

                <div className="flex items-center justify-between gap-3 md:block">
                    <Link to="/" className="flex shrink-0 items-center gap-2.5 md:px-1">
                        <span className="grid size-9 place-items-center rounded-xl bg-accent text-brand">
                            <Boxes size={18} strokeWidth={2.4} />
                        </span>
                        <span className="hidden sm:block">
                            <span className="block text-sm font-semibold tracking-tight">Inventor</span>
                            <span className="block text-[11px] text-white/50">Inventory manager</span>
                        </span>
                    </Link>

                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/50 md:hidden">
                        Manager
                    </span>
                </div>

                <nav aria-label="Navigasi manager" className="no-scrollbar flex items-center gap-0.5 overflow-x-auto sm:gap-1 md:mt-8 md:flex-col md:items-stretch md:overflow-visible">
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

                <div className="mt-auto hidden items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 md:flex">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-bold text-brand">
                        M
                    </span>
                    <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">Manager</span>
                        <span className="block truncate text-[11px] text-white/50">Kelola stok & transaksi</span>
                    </span>
                </div>

            </div>
        </aside>
    )
}
