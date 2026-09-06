import { useState, useEffect } from 'react'
import axios from "../../../axios-config"
import Swal from 'sweetalert2'

function AdminDashboard(){    
    const [userCount, setUserCount] = useState([])

    useEffect(() => {
        axios.get(`/usercount`)
        .then((res) => {
            setUserCount(res.data)
        })
        .catch((err) => {
            Swal.fire({
                title: "UNEXPECTED ERROR OCCURED",
                text:"check logs",
                icon:"error"
            })
            console.error(err)
        })
    }, [])

    return(
        <>
            <div className='max-md:mt-10 mx-2 md:mx-6'>
                <div>
                <h2 className='text-2xl font-bold'>Dashboard</h2>
                <p className='text-muted-foreground'>
                    Welcome back, Admin. Here's an overview of the system.
                </p>
                </div>
            </div>
            <div className='my-6 mx-2 md:mx-6 rounded-2xl flex justify-around gap-4 flex-wrap'>
                <div className="flex flex-1 min-w-44 items-center justify-around gap-3 p-5 rounded-2xl shadow-sm shadow-gray-300">                       
                    <div>
                        <p className='text-xs'>Total Accounts</p>
                        <h1 className='font-bold text-2xl leading-none'>
                            {userCount.map((count)=>(count.total_count))}
                        </h1>
                    </div> 
                    <div className='text-white bg-blue-50 p-2 rounded-2xl '>
                        <svg className='fill-blue-500' width="24" height="24" fill="none" viewBox="0 0 24 24" transform="" id="injected-svg" xmlns="http://www.w3.org/2000/svg"><path d="M10 13H8c-2.76 0-5 2.24-5 5v1c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-1c0-2.76-2.24-5-5-5m-5 5c0-1.65 1.35-3 3-3h2c1.65 0 3 1.35 3 3zm7.73-11.49c-.08-.22-.19-.42-.3-.62v-.01c-.69-1.14-1.93-1.89-3.42-1.89-2.28 0-4 1.72-4 4s1.72 4 4 4c1.49 0 2.73-.74 3.42-1.89v-.01c.12-.2.22-.4.3-.62.02-.06.03-.12.05-.18.06-.17.11-.34.15-.52.05-.25.07-.51.07-.78s-.03-.53-.07-.78c-.03-.18-.09-.35-.15-.52-.02-.06-.03-.12-.05-.18M9 10c-1.18 0-2-.82-2-2s.82-2 2-2 2 .82 2 2-.82 2-2 2m6 0q-.165 0-.33-.03c-.22.66-.56 1.27-.98 1.81.41.13.84.22 1.31.22 2.28 0 4-1.72 4-4s-1.72-4-4-4c-.47 0-.9.09-1.31.22.43.53.76 1.14.98 1.81.11-.01.21-.03.33-.03 1.18 0 2 .82 2 2s-.82 2-2 2m1 3h-1.11c.6.58 1.08 1.27 1.44 2.03C17.83 15.2 19 16.46 19 18h-2v1c0 .35-.07.69-.18 1H20c.55 0 1-.45 1-1v-1c0-2.76-2.24-5-5-5"></path></svg>
                    </div>    
                </div>
                <div className="flex flex-1 min-w-44 items-center justify-around gap-3 p-5 rounded-2xl shadow-sm shadow-gray-300">                    
                    <div>
                        <p className='text-xs'>Student Accounts</p>
                        <h1 className='font-bold text-2xl leading-none'>{userCount.map((count)=>(count.student_count))}</h1>
                    </div>     
                    <div className='text-white bg-blue-50 p-2 rounded-2xl '>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path className="stroke-green-500" d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path>
                        <path className="stroke-green-500" d="M22 10v6"></path>
                        <path className="stroke-green-500" d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path>
                        </svg>
                    </div>   
                </div>
                <div className="flex flex-1 min-w-44 items-center justify-around gap-3 p-5 rounded-2xl shadow-sm shadow-gray-300">                    
                    <div>
                        <p className='text-xs'>Teacher Accounts</p>
                        <h1 className='font-bold text-2xl leading-none'>{userCount.map((count)=>(count.teacher_count))}</h1>
                    </div>     
                    <div className='text-white bg-green-50 p-2 rounded-2xl '>
                        <svg className="stroke-blue-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="8" r="5"></circle>
                            <path d="M20 21a8 8 0 0 0-16 0"></path>
                        </svg>
                    </div>   
                </div>
                <div className="flex flex-1 min-w-44 items-center justify-around gap-3 p-5 rounded-2xl shadow-sm shadow-gray-300">                    
                    <div>
                        <p className='text-xs'>Applicant Accounts</p>
                        <h1 className='font-bold text-2xl leading-none'>{userCount.map((count)=>(count.applicant_count))}</h1>
                    </div>     
                    <div className='text-white bg-orange-50 p-2 rounded-2xl '>
                        <svg  xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" >
                        <path className="fill-orange-500" d="M21 8c-.2 0-4.85.03-9 2.01C7.85 8.03 3.2 8 3 8c-.55 0-1 .45-1 1v9.88c0 .27.11.53.31.72.19.19.45.3.73.28.04 0 3.97-.11 8.54 2.02.02 0 .03 0 .05.01.12.05.24.08.37.08s.25-.03.37-.08c.02 0 .03 0 .05-.01 4.54-2.12 8.51-2.03 8.54-2.02.27.02.53-.09.73-.28.19-.19.31-.45.31-.72V9c0-.55-.45-1-1-1M4 10.05c1.49.11 4.38.48 7 1.69v7.74c-3.02-1.18-5.62-1.5-7-1.58v-7.86Zm16 7.86c-1.38.08-3.98.4-7 1.58v-7.74c2.62-1.21 5.51-1.58 7-1.69v7.86ZM12 2a3 3 0 1 0 0 6 3 3 0 1 0 0-6"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminDashboard