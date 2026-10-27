export default function Liststockm() {
    return (
        <div className="pt-10">
                    <h1 className="text-3xl font-bold">List Stock</h1>
                    <p className="font-medium w-[500px] mt-3">Tempat menambahkan sebuah barang agar terdaftar di laporan maupun di transaksi</p>
            
                  
                    <div className="flex gap-3 mt-5">
                        <button className="bg-blue-700 px-3 py-1 text-md rounded-[5px] font-bold text-white">+ Product</button>
           <input type="text" name="" id="" className="border border-zinc-500 bg-white rounded-md px-2 py-1" placeholder="Search" />
            <button className="bg-white border border-zinc-400 text-md font-semibold px-3 py-1">Filter</button>
                    </div>

<div className="flex mt-5">

<div className="bg-white border border-zinc-300 px-2 py-1 rounded-md">
    <p className="text-lg">Nama</p>
    <p className="">Harga</p>
    <p className="">Category</p>
</div>

</div>




        </div>
    )
} 