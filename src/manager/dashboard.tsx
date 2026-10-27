// disini isinya semua stock    

export default function Mdashboard() {
    return (
        <div className="pt-10 flex flex-col">
            <div className="">
                <h1 className="text-2xl font-medium">Dashboard Manager</h1>
                <p className="">page untuk melihat semua laporan bulanan</p>
            </div>
            {/* CARD  */}
            <div className="mt-5 grid grid-cols-4 gap-2">

                <div className="bg-white px-3 border border-black-400 py-2 rounded-[7px] transition-all hover:-translate-y-1 hover:shadow-lg">
                    <p className="text-sm font-medium">Operasional</p>
                    <p className="text-2xl font-bold">Rp. 124.000.000</p>
                </div>

                <div className="bg-white px-3 py-2 border border-blue-400 rounded-[7px] transition-all hover:-translate-y-1 hover:shadow-lg">
                    <p className="text-sm font-medium">Omzet</p>
                    <p className="text-2xl font-bold text-blue-600">Rp. 50.000.000</p>
                </div>


                <div className="bg-white px-3 border border-green-400 py-2 rounded-[7px] transition-all hover:-translate-y-1 hover:shadow-lg">
                    <p className="text-sm font-medium">Profit</p>
                    <p className="text-2xl font-bold text-green-600">Rp. 40.000.000</p>
                </div>

                <div className="bg-white border border-red-400 px-3 py-2 rounded-[7px] transition-all hover:-translate-y-1 hover:shadow-lg">
                    <p className="text-sm font-medium">Kerugian</p>
                    <p className="text-2xl font-bold text-red-600">Rp. 1.000.000</p>
                </div>


            </div>

            <div className="w-full flex bg-white h-[300px] mt-5 rounded-[15px] border border-blue-500 items-center"><p className="bg-blue-700 mx-auto text-white">RECHART</p></div>

        </div>
    )
}