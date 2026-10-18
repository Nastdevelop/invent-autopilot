import { useState } from "react" 

export default function Login() {
    const [email, setEmail] = useState("")
    const [pw, setPw] = useState("")

    // const onLog = () => {
    //     sk
    // }

    return (
        <div className="flex bg-zinc-50 min-h-full">
            <div className=" mx-auto min-h-[300px] rounded-[7px] w-[400px] mt-20 px-5 flex flex-col ">
                <p className="mx-auto mb-15 font-bold text-2xl">Login Page</p>
                <input onChange={(e) => setEmail(e.target.value)} type="text" name="" id="" placeholder="Email" className=" border-zinc-400 border my-2 px-3 py-1" />
                <input onChange={(e) => setPw(e.target.value)} type="password" name="" id="" placeholder="********" className="border-zinc-400 border my-2 px-3 py-1" />
                <button  className="bg-blue-600 text-white font-semibold mt-5 py-1 rounded-[7px] mb-5 hover:bg-blue-700 cursor-pointer">Masuk</button>
            </div>
        </div>
    ) 
}   