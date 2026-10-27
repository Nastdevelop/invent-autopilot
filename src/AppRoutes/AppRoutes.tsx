import {BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from '../pages/login'
import Landing from '../pages/Landingpage'
import NotFoundPage from '../pages/notfound'
import Managerlay from '../layout/manager'
import Mdashboard from '../manager/dashboard'
import Movement from '../manager/movement'
import Liststockm from '../manager/liststock'


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
         <Route element={<Managerlay />}>
            <Route path='/manager/dashboard' element={<Mdashboard/>} />
            <Route path='/manager/liststock' element={<Liststockm />} />
            <Route path='/manager/movement' element={<Movement />} />
        </Route>
 
        {/* OWNER ROLE  */}
        {/* <Route>
            <Route path='/owner/akun' element={} />
            <Route path='/owner/stocklist' element={} />
            <Route path='/owner/outstock' element={} />
            <Route path='/owner/instock' element={} />
            <Route path='/owner/akun' element={} />
        </Route> */}

        </Routes>
        </BrowserRouter>
    )
}