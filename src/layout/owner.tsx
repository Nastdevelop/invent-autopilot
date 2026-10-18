import { Outlet } from "react-router-dom"



export default function Ownerlay() {
    return (
        <div className="min-h-screen">

            <main className="">
                <Outlet />
            </main>
            
        </div>
    )
}