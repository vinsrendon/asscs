import { useState, useEffect } from 'react'
import { NavLink } from 'react-router'
import axios from '../../../axios-config.js'
import Swal from 'sweetalert2'

function TeacherDashboard(){   
    const [isOnline, setIsOnline] = useState(true)
    const [loading, setLoading] = useState(true)
    const [userCount, setUserCount] = useState([])
    useEffect(()=>{
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

        const aiCheck = async() =>{
            try {
                const response = await axios.get('/api/chat/health', { timeout: 5000 });
                setIsOnline(response.data.status === 'online');
            // eslint-disable-next-line no-unused-vars
            } catch (err) {
                setIsOnline(false);
            } finally{
                setLoading(false);
            }        
        }
        aiCheck()
    },[])


    return(
        <>
            <div className='max-md:mt-10 mx-2 md:mx-6'>
                <div>
                <h2 className='text-2xl font-bold'>Dashboard</h2>
                <p className='text-muted-foreground'>
                    Welcome back, Teacher. Here's an overview of your classes.
                </p>
                </div>
            </div>
            <div className='my-6 mx-2 md:mx-6 rounded-2xl flex justify-around gap-4 flex-wrap'>
                <div className="flex flex-1 min-w-44 items-center justify-around gap-3 p-5 rounded-2xl shadow-sm shadow-gray-300">                       
                    <div>
                        <p className='text-xs'>Total Students</p>
                        <h1 className='font-bold text-2xl leading-none'>{userCount?.[0]?.student_count ?? 0}</h1>
                    </div> 
                    <div className='text-white bg-blue-50 p-2 rounded-2xl '>
                        <svg className='fill-blue-500' width="24" height="24" fill="none" viewBox="0 0 24 24" transform="" id="injected-svg" xmlns="http://www.w3.org/2000/svg"><path d="M10 13H8c-2.76 0-5 2.24-5 5v1c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-1c0-2.76-2.24-5-5-5m-5 5c0-1.65 1.35-3 3-3h2c1.65 0 3 1.35 3 3zm7.73-11.49c-.08-.22-.19-.42-.3-.62v-.01c-.69-1.14-1.93-1.89-3.42-1.89-2.28 0-4 1.72-4 4s1.72 4 4 4c1.49 0 2.73-.74 3.42-1.89v-.01c.12-.2.22-.4.3-.62.02-.06.03-.12.05-.18.06-.17.11-.34.15-.52.05-.25.07-.51.07-.78s-.03-.53-.07-.78c-.03-.18-.09-.35-.15-.52-.02-.06-.03-.12-.05-.18M9 10c-1.18 0-2-.82-2-2s.82-2 2-2 2 .82 2 2-.82 2-2 2m6 0q-.165 0-.33-.03c-.22.66-.56 1.27-.98 1.81.41.13.84.22 1.31.22 2.28 0 4-1.72 4-4s-1.72-4-4-4c-.47 0-.9.09-1.31.22.43.53.76 1.14.98 1.81.11-.01.21-.03.33-.03 1.18 0 2 .82 2 2s-.82 2-2 2m1 3h-1.11c.6.58 1.08 1.27 1.44 2.03C17.83 15.2 19 16.46 19 18h-2v1c0 .35-.07.69-.18 1H20c.55 0 1-.45 1-1v-1c0-2.76-2.24-5-5-5"></path></svg>
                    </div>
                </div>
                <div className="flex flex-1 min-w-44 items-center justify-around gap-3 p-5 rounded-2xl shadow-sm shadow-gray-300">                    
                    <div>
                        <p className='text-xs'>Active Exams</p>
                        <h1 className='font-bold text-2xl leading-none'>0</h1>
                    </div>
                    <div className='text-white bg-blue-50 p-2 rounded-2xl '>
                        <svg className='fill-blue-500' width="24" height="24" fill="none" viewBox="0 0 24 24" transform="" id="injected-svg" xmlns="http://www.w3.org/2000/svg"><path d="m19.94 7.68-.03-.09a.8.8 0 0 0-.2-.29l-5-5c-.09-.09-.19-.15-.29-.2l-.09-.03a.8.8 0 0 0-.26-.05c-.02 0-.04-.01-.06-.01H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-12s-.01-.04-.01-.06c0-.09-.02-.17-.05-.26ZM6 20V4h7v4c0 .55.45 1 1 1h4v11z"></path><path d="M8 11h8v2H8zm0 4h8v2H8zm0-8h3v2H8z"></path></svg>
                    </div>
                </div>
                <div className="flex flex-1 min-w-44 items-center justify-around gap-3 p-5 rounded-2xl shadow-sm shadow-gray-300">                    
                    <div>
                        <p className='text-xs'>Average Score</p>
                        <h1 className='font-bold text-2xl leading-none'>0 %</h1>
                    </div>     
                    <div className='text-white bg-green-50 p-2 rounded-2xl '>
                        <svg className='fill-green-500' width="24" height="24" fill="none" viewBox="0 0 24 24" transform="" id="injected-svg" xmlns="http://www.w3.org/2000/svg"><path d="M4 2H2v19c0 .55.45 1 1 1h19v-2H4z"></path><path d="M15.4 12.8c.4.3.96.26 1.31-.09l5-5L20.3 6.3l-4.39 4.39-3.31-2.48c-.4-.3-.96-.26-1.31.09l-6 6 1.41 1.41 5.39-5.39z"></path></svg>
                    </div>   
                </div>
            </div>
            <div className='my-6 mx-2 md:mx-6 rounded-2xl flex justify-around gap-4 max-lg:flex-wrap'>
                <div className="flex flex-col w-1/2 gap-3 p-5 rounded-2xl shadow-sm shadow-gray-300 max-lg:w-full">                               
                    <div>
                        <h1 className='font-bold text-2xl leading-none'>Quick Actions</h1>
                    </div> 
                    <div className='text-white p-2 text-lg md:text-2xl text-center rounded-2xl flex flex-row justify-around gap-4'>
                        <NavLink className="flex flex-col justify-center items-center w-1/2 bg-blue-50 rounded-3xl py-5 hover:bg-blue-200 hover:rounded-md transition-all duration-100 ease-linear" to="/teacher/scan">           
                        <div className="flex flex-col justify-center items-center w-1/2 rounded-2xl py-5">                            
                            <svg className='fill-blue-500' width="32" height="32" fill="currentColor" viewBox="0 0 24 24" transform="" id="injected-svg" xmlns="http://www.w3.org/2000/svg"><path d="M9 5V3H3v6h2V5zm12 4V3h-6v2h4v4zm-2 10h-4v2h6v-6h-2zM5 15H3v6h6v-2H5zm-3-4h20v2H2z"></path></svg>
                            <h1 className='font-bold leading-none text-black'>Scan Sheet</h1>                            
                        </div>
                        </NavLink>
                        
                        <NavLink className="flex flex-col justify-center items-center w-1/2 bg-blue-50 rounded-3xl py-5 hover:bg-blue-200 hover:rounded-md transition-all duration-200 ease-linear" to="/teacher/keys">  
                        <div className="flex flex-col justify-center items-center w-1/2 rounded-2xl py-5">
                            <svg className='fill-blue-500' width="32" height="32" fill="currentColor" viewBox="0 0 24 24" transform="" id="injected-svg" xmlns="http://www.w3.org/2000/svg"><path d="m19.94 7.68-.03-.09a.8.8 0 0 0-.2-.29l-5-5c-.09-.09-.19-.15-.29-.2l-.09-.03a.8.8 0 0 0-.26-.05c-.02 0-.04-.01-.06-.01H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-12s-.01-.04-.01-.06c0-.09-.02-.17-.05-.26ZM6 20V4h7v4c0 .55.45 1 1 1h4v11z"></path><path d="M8 11h8v2H8zm0 4h8v2H8zm0-8h3v2H8z"></path></svg>
                            <h1 className='font-bold leading-none text-black'>New Exam</h1>
                        </div>
                        </NavLink>
                    </div>  
                </div>
                <div className="flex flex-col w-1/2 gap-3 p-5 rounded-2xl shadow-sm shadow-gray-300 max-lg:w-full">                       
                    <div>
                        <h1 className='font-bold text-2xl leading-none'>System Status</h1>
                    </div> 
                    <div className='text-white p-2 text-md md:text-lg text-center rounded-2xl flex flex-col justify-around gap-4 font-bold'>
                        <div className="bg-blue-50 text-blue-500 rounded-2xl p-2">
                            <div>
                                <ul className="flex flex-row justify-between items-center">
                                    <li className="list-disc ml-6">Chatbot Status</li>
                                    <li>
                                        <span>
                                            {loading ? 'Checking...' : isOnline ? 'Online' : 'Offline'}
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>    
                </div>
            </div> 
        </>
    )
}

export default TeacherDashboard