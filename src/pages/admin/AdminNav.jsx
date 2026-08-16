import {NavLink } from 'react-router'
import scan from '../../assets/scan.svg'

function AdminNav(){
    return(
    <>
        <aside className="hidden md:block w-50 text-white h-full">
            <div className="flex items-center gap-3 mb-10">
                <div className='text-white bg-[#12264F] p-2 rounded-2xl'>
                    <img src={scan} alt="scan icon"/>
                </div>   
                <div>
                    <h1 className='font-bold text-2xl leading-none'>AutoCheck</h1>
                    <p className='text-xs'>Shading Sheet Checker</p>
                </div>     
            </div>
            
            <NavLink to="/admindash" className={({ isActive }) => isActive ? " text-left bg-blue-600 py-2 px-10 rounded-2xl w-full text-2xl" : "text-4xl"} end>Accounts</NavLink>
        </aside>
        <button className="md:hidden flex items-center text-white focus:outline-none">
            <svg className="w-7 h-7" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            <path stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
            </svg>
        </button>
        
        <aside id="mobileMenu" className="absolute hidden w-full bg-nav text-white">
        <ul className="space-y-2 text-center">
            
        </ul>
        </aside>
    </>
    )
}

export default AdminNav