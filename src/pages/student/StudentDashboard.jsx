import StudentNav from './StudentNav'
import { useState} from 'react'
import medal from '../../assets/medal-alt.svg'
import book from '../../assets/book-open.svg'
import bullseye from '../../assets/bullseye.svg'

function StudentDashboard(){    

    const [name] = useState(() => {
        return (localStorage.getItem('name') || '').toUpperCase();
    })
    
    return(
        <main className="min-h-screen w-full flex">            
            <section className="absolute content-start md:static max-md:w-20 max-md:bg-[#111629]/0 bg-[#111629] p-5 z-999">
                <StudentNav/>
            </section>
            <section className="flex-1 bg-white p-5">  
                <div className='py-6 px-10 mx-6 bg-blue-500 rounded-2xl text-white shadow-sm shadow-gray-300'>
                    <h1 className='font-bold text-4xl mb-2'>Welcome, {name}!</h1>
                    <p className='text-md'>
                        Track your academic progress, view detailed exam breakdowns,<br/> 
                        and chat with your AI assistant to impove your scores.
                    </p>
                </div>
                <div className='my-6 mx-6 rounded-2xl flex justify-around gap-4'>
                    <div className="flex flex-1 items-center gap-3 p-5 rounded-2xl mb-10 shadow-sm shadow-gray-300">
                        <div className='text-white bg-green-100 p-2 rounded-2xl '>
                            <img className='' src={medal}/>
                        </div>   
                        <div>
                            <p className='text-xs'>Overall Average</p>
                            <h1 className='font-bold text-2xl leading-none'>0 %</h1>
                        </div>     
                    </div>
                    <div className="flex flex-1 items-center gap-3 p-5 rounded-2xl mb-10 shadow-sm shadow-gray-300">
                        <div className='text-white bg-blue-100 p-2 rounded-2xl '>
                            <img className='' src={book}/>
                        </div>   
                        <div>
                            <p className='text-xs'>Exams Taken</p>
                            <h1 className='font-bold text-2xl leading-none'>0</h1>
                        </div>     
                    </div>
                    <div className="flex flex-1 items-center gap-3 p-5 rounded-2xl mb-10 shadow-sm shadow-gray-300">
                        <div className='text-white bg-blue-100 p-2 rounded-2xl '>
                            <img className='' src={bullseye}/>
                        </div>   
                        <div>
                            <p className='text-xs'>Need Help?</p>
                            <h1 className='font-bold text-2xl text-blue-600 leading-none'>Ask AI Tutor</h1>
                        </div>     
                    </div>
                </div>
            </section>
        </main>
    )
}

export default StudentDashboard