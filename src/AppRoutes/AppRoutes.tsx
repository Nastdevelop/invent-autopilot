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
            <Route path='' element={} />
            <Route path='' element={} />
            <Route path='' element={} />
        </Route>

        {/* OWNER ROLE */}
        <Route></Route>

        </Routes>
        </BrowserRouter>
    )
}