import { useState, useEffect} from 'react'
import { NavLink} from 'react-router'
import medal from '../../assets/medal-alt.svg'
import book from '../../assets/book-open.svg'
import bullseye from '../../assets/bullseye.svg'
import axios from "../../../axios-config"
import Swal from 'sweetalert2'

function StudentDashboard(){    
    const [overallAverage, setOverallAverage] = useState('')
    const [examTaken, setExamTaken] = useState('')

    const [name] = useState(() => {
        return (localStorage.getItem('name') || '').toUpperCase();
    })

    const [role] = useState(() => {
        return (localStorage.getItem('role') || '').toUpperCase();
    })

    useEffect(() => {
        axios.get(`/student/stats`, {})
        .then((res) => {           
            setOverallAverage(res.data.stats.average_score)
            setExamTaken(res.data.stats.exam_count)
        })
        .catch((err) => {
            console.error(err)
            Swal.fire({
                text: err,
                icon:"error"
            })
        })
    }, [])
    
    return(
        <>
        <div className='py-6 px-10 md:mx-6 bg-blue-500 rounded-2xl text-white shadow-sm shadow-gray-300 max-md:mt-10 animate-fade-in [animation-delay:0ms]!'>
            <h1 className='font-bold text-4xl mb-2'>Welcome, {name}!</h1>
            {role === "STUDENT" ?
                <p className='text-md'>
                    Track your academic progress, view detailed exam breakdowns,<br/> 
                    and chat with your AI assistant to impove your scores.
                </p>:
                <p className='text-md'>
                    Track your entrance exam scores and view detailed breakdowns
                </p>
            }
        </div>
        <div className='my-6 mx-6 rounded-2xl flex justify-around flex-wrap gap-4'>
            <div className="flex flex-1 min-w-48 items-center gap-3 p-5 rounded-2xl shadow-sm shadow-gray-300 animate-fade-in [animation-delay:100ms]!">
                <div className='text-white bg-green-100 p-2 rounded-2xl '>
                    <img className='' src={medal}/>
                </div>   
                <div>
                    <p className='text-xs'>Overall Average</p>
                    <h1 className='font-bold text-2xl leading-none'>{overallAverage} %</h1>
                </div>     
            </div>
            <div className="flex flex-1 min-w-48 items-center gap-3 p-5 rounded-2xl shadow-sm shadow-gray-300 animate-fade-in [animation-delay:200ms]!">
                <div className='text-white bg-blue-100 p-2 rounded-2xl '>
                    <img className='' src={book}/>
                </div>   
                <div>
                    <p className='text-xs'>Exams Taken</p>
                    <h1 className='font-bold text-2xl leading-none'>{examTaken}</h1>
                </div>     
            </div>
            {role === "STUDENT" && 
                <div className="flex flex-1 min-w-48 items-center gap-3 p-5 rounded-2xl shadow-sm shadow-gray-300 animate-fade-in [animation-delay:300ms]!">
                    <div className='text-white bg-blue-100 p-2 rounded-2xl '>
                        <img className='' src={bullseye}/>
                    </div>
                    <div>
                        <p className='text-xs'>Need Help?</p>
                        <NavLink to="/student/assistant" className="" end><h1 className='font-bold text-2xl text-blue-600 leading-none cursor-pointer'>Ask AI Tutor</h1></NavLink>
                    </div>
                </div>
            }
        </div>
        </>
    )
}

export default StudentDashboard