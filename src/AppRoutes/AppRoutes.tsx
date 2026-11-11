import type { ReactNode } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import Login from "../pages/login"
import Landing from "../pages/Landingpage"
import NotFoundPage from "../pages/notfound"
import Managerlay from "../layout/manager"
import Mdashboard from "../manager/dashboard"
import Movement from "../manager/movement"
import Products from "../manager/products"
import Stockin from "../manager/stockin"
import Sales from "../manager/sales"
import Adjustments from "../manager/adjustments"
import OwnerDashboard from "../owner/dashboard"
import { useAppStore } from "../store/useAppStore"
import type { Role } from "../types/api"

function RequireAuth({ role, children }: { role: Role; children: ReactNode }) {
    const user = useAppStore(
        (state) => state.users.find((candidate) => candidate.id === state.currentUserId) ?? null,
    )

    if (!user) return <Navigate to="/login" replace />
    if (user.role !== role) {
        return (
            <Navigate
                to={user.role === "OWNER" ? "/owner/dashboard" : "/manager/dashboard"}
                replace
            />
        )
    }
    return children
}

export default function AppRoutes() {
    return (
        <BrowserRouter>
        <Routes>
            {/* one page */}
        <Route>
            <Route path='/login' element={ <Login/> }/>
            <Route path='/' element={ <Landing/> }/>
            <Route path='*' element={ <NotFoundPage/> }/>
        </Route>

        {/* MANAGER ROLE  */}
         <Route
            element={
                <RequireAuth role="MANAGER">
                    <Managerlay />
                </RequireAuth>
            }
         >
            <Route path='/manager/dashboard' element={<Mdashboard/>} />
            <Route path='/manager/products' element={<Products />} />
            <Route path='/manager/liststock' element={<Navigate to="/manager/products" replace />} />
            <Route path='/manager/stockin' element={<Stockin />} />
            <Route path='/manager/sales' element={<Sales />} />
            <Route path='/manager/adjustments' element={<Adjustments />} />
            <Route path='/manager/movement' element={<Movement />} />
        </Route>

        {/* OWNER ROLE  */}
        <Route
            path='/owner/dashboard'
            element={
                <RequireAuth role="OWNER">
                    <OwnerDashboard />
                </RequireAuth>
            }
        />

        </Routes>
        </BrowserRouter>
    )
}
