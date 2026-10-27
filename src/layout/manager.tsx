import { Outlet } from "react-router-dom"
import Sidebar from "../component/sidebarm"

export default function Managerlay() {
    return (
        <div className="min-h-screen">
            <Sidebar />
            <main className="pl-[270px] pr-[20px]">
                <Outlet />
            </main>
            
        </div>
    )
}