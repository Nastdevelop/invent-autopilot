import { NavLink } from "react-router-dom"


export default function Sidebar() {
    const dataside = [
        {id:2 , nama:'Dashboard' , link:"/manager/dashboard" },
        {id:1 , nama:'Movement' , link:"/manager/movement" },
        {id:3 , nama:'Stock' , link:"/manager/liststock" },
        // {id:4 , nama:'' , link:"/manager/dashboard" }, 
    ]

    return (
        <div className="bg-blue-200 absolute z-10 flex flex-col min-h-screen pt-10 px-2 w-[250px] gap-1">
            {dataside.map((list) => ( 
                <NavLink to={list.link} key={list.id} className={({ isActive }) =>
                        `text-lg font-semibold py-1 px-2 rounded-[7px] transition-colors ${
                            isActive
                                ? "bg-teal-600 text-white"
                                : "text-black hover:bg-teal-500"
                        }`
                    }>{list.nama}</NavLink>
            ))}
        </div>
    )
}