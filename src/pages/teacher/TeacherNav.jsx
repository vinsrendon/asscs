import {NavLink,useNavigate} from 'react-router'
import scan from '../../assets/scan.svg'
import paper from '../../assets/file-detail.svg'
import students from '../../assets/group.svg'
import key from '../../assets/car-key.svg'
import dashboard from '../../assets/dashboard.svg'
import axios from '../../../axios-config.js'
import { useState, useEffect} from 'react'
import Swal from 'sweetalert2'

function TeacherNav(){
    const [name, setName] = useState('')
    const [role, setRole] = useState('')

    const navigate = useNavigate()

    useEffect(() => {
        const getUserInfo = async()=>{  
            if (localStorage.getItem('name') !== null) {
                setName(localStorage.getItem('name').toUpperCase())
                setRole(localStorage.getItem('role'))
            } 
            else {
                axios.get('/verify',{}).then((res)=>{
                    
                localStorage.setItem('name',res.data.user.name)  
                localStorage.setItem('role',res.data.user.role)  
                
                setName(localStorage.getItem('name').toUpperCase())  
                setRole(localStorage.getItem('role').toUpperCase())
                }).catch((err)=>{  
                    Swal.fire({
                        title:"UNEXPECTED ERROR OCCURED, CHECK LOGS FOR MORE INFO",
                        text:err,
                        icon:"error"
                    })
                    console.log(err)
                })
            }
        }
        getUserInfo()
    }, [])

    const logout = async()=>{  
        await axios.post("/logout").then((res)=>{    
            if(res.status === 200){
            navigate('/')
            localStorage.removeItem('role');
            localStorage.removeItem('name');
            }
        }).catch((error)=>{
            console.log(error);
            
            Swal.fire({
                text:"UNEXPECTED ERROR OCCURED, CHECK LOGS FOR MORE INFO",
                icon:"error"
            }); 
            console.log(error);
        });    
    }

    return(
    <>
        <aside className="hidden md:flex md:flex-col w-50 text-white h-full">
            <div className="flex items-center gap-3 mb-10">
                <div className='text-white bg-[#12264F] p-2 rounded-2xl'>
                    <img src={scan} alt="scan icon"/>
                </div>   
                <div>
                    <h1 className='font-bold text-2xl leading-none'>AutoCheck</h1>
                    <p className='text-xs'>Shading Sheet Checker</p>
                </div>     
            </div>
            <div className='flex flex-col gap-3'>
                <NavLink to="/teacher" className={({ isActive }) => isActive ? "flex flex-nowrap bg-blue-600 py-2 px-6 rounded-xl w-full text-md gap-2" : "flex flex-nowrap hover:bg-blue-600 py-2 px-6 rounded-xl w-full text-md gap-2"} end><img className='invert' src={dashboard}/>Dashboard</NavLink>
                <NavLink to="/teacher/scan" className={({ isActive }) => isActive ? "flex flex-nowrap bg-blue-600 py-2 px-6 rounded-xl w-full text-md gap-2" : "flex flex-nowrap hover:bg-blue-600 py-2 px-6 rounded-xl w-full text-md gap-2"} end><img src={scan}/>Scan Sheet</NavLink>
                <NavLink to="/teacher/keys" className={({ isActive }) => isActive ? "flex flex-nowrap bg-blue-600 py-2 px-6 rounded-xl w-full text-md gap-2" : "flex flex-nowrap hover:bg-blue-600 py-2 px-6 rounded-xl w-full text-md gap-2"} end><img className='invert' src={key}/>Answer Keys</NavLink>
                <NavLink to="/teacher/students" className={({ isActive }) => isActive ? "flex flex-nowrap bg-blue-600 py-2 px-6 rounded-xl w-full text-md gap-2" : "flex flex-nowrap hover:bg-blue-600 py-2 px-6 rounded-xl w-full text-md gap-2"} end><img className='invert' src={students}/>Students</NavLink>
                <NavLink to="/teacher/results" className={({ isActive }) => isActive ? "flex flex-nowrap bg-blue-600 py-2 px-6 rounded-xl w-full text-md gap-2" : "flex flex-nowrap hover:bg-blue-600 py-2 px-6 rounded-xl w-full text-md gap-2"} end><img className='invert' src={paper}/>Result</NavLink>
            </div>
            
            <div className="mt-auto space-y-2">
                <hr className='text-gray-500'/>
                <div className='bg-[#12264F] rounded-2xl p-2'>
                    <div className="flex items-center gap-3">
                        <div className='text-white p-2 rounded-2xl'>
                            {/* <img src={user} alt="user icon" className='fill-white stroke-white'/> */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path></svg>
                        </div>   
                        <div className='break-all'>
                            <h1 className='font-bold text-lg leading-none'>{name}</h1>
                            <p className='text-xs'>{role}</p>
                        </div>     
                    </div>
                </div>
                <NavLink to="#" onClick={logout} className="text-left py-2 px-13 rounded-2xl w-full text-2xl font-bold bg-[#12264F]">Sign out</NavLink>
            </div>
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

export default TeacherNav