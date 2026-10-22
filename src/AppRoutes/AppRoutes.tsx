import {BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from '../pages/login'
import Landing from '../pages/Landingpage'
import NotFoundPage from '../pages/notfound'

export default function AppRoutes() {
    return (
        <BrowserRouter>
        <Routes>
            {/* one page */}
        <Route >
            <Route path='/login' element={ <Login/> }/>
            <Route path='/' element={ <Landing/> }/>
            <Route path='*' element={ <NotFoundPage/> }/>
        </Route>

        {/* MANAGER ROLE */}
        <Route>
            <Route path='/manager/dashboard' element={} />
            <Route path='/manager/stocklist' element={} />
            <Route path='/manager/outstock' element={} />
            <Route path='/manager/instock' element={} />
        </Route>

        {/* OWNER ROLE */}
        <Route>
            <Route path='/owner/akun' element={} />
            <Route path='/owner/stocklist' element={} />
            <Route path='/owner/outstock' element={} />
            <Route path='/owner/instock' element={} />
            <Route path='/owner/akun' element={} />
        </Route>

        </Routes>
        </BrowserRouter>
    )
}