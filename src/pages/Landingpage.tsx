import { Link } from "react-router";


export default function Landing() {
    return(
        <div className="bg-green-200 bottom-0 absolute top-0 w-full text-center pt-40 flex flex-col">
                <h1 className="text-5xl font-bold mb-5">Cashier <span className="text-blue-700">Inventory</span></h1>
                <p className="">Sebuah  platform untuk memanage usaha secara autopilot, mulai dari stock gudang, transaksi dan laporan keuangan</p>
                <Link to='/login' className="bg-green-500 text-white font-semibold text-xl mt-5 w-[400px] hover:bg-green-700 mx-auto py-2 rounded-[15px] items-center">Login</Link>
        </div>
    )
}