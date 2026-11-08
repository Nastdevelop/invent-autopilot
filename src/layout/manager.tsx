import { Outlet } from "react-router-dom"
import Sidebar from "../component/sidebarm"

export default function Managerlay() {
    return (
        <div className="min-h-dvh bg-paper">
            <Sidebar />
            <main className="px-4 pb-14 pt-6 sm:px-6 md:ml-64 md:px-8 md:pt-10 lg:px-10">
                <div className="mx-auto w-full max-w-6xl">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
