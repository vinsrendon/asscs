import { useState, useEffect } from 'react'
import axios from '../../../axios-config'
import Modal from '../modal.jsx'
import Swal from 'sweetalert2'

function TeacherAnswerKeys(){    
    const [subject, setSubject] = useState('')
    const [title, setTitle] = useState('')
    const [examType, setExamType] = useState('')
    const [numberOfItems, setNumberOfItems] = useState('')
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [exams, setExams] = useState([])
    
    const [isModalOpen, setIsModalOpen] = useState(false)

    const closeExamModal = () => {
        setIsModalOpen(false)
    }

    const submitExam = async (e) => {
        e.preventDefault()
        console.log(subject + ""+title+""+examType);
        

        if(!subject || !title || !examType){
            Swal.fire({
                text:"Missing Failed",
                icon:"warning"
            })
            return
        }

        await axios.post(
            '/exam',
            {
                subject:subject,
                title:title,
                type:examType,
                numberOfItems:numberOfItems
            }
        ).then((res)=>{        
            if(res.status === 200){             
                Swal.fire({
                text:res.data.message,
                icon:"success"
                })
            }
            else{
                Swal.fire({
                text:res.data.message,
                icon:"info"
                })
            }
        }).catch((err)=>{
            console.log(err)
            switch (err.status) {
                case 403:
                    Swal.fire({
                        text:err.response.data.message,
                        icon:"warning"
                    })
                return

                case 404:
                    Swal.fire({
                        text:err.response.data.message,
                        icon:"warning"
                    })
                return

                case 500:
                    Swal.fire({
                        text:err.response.data.message,
                        icon:"error"
                    })
                return

                default:
                    Swal.fire({
                        text:"UNEXPECTED ERROR OCCURED CHECK CONSOLE FOR MORE INFO",
                        icon:"error"
                    })
                return
            }
        })
    }
    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setSearch(e.target.value)
        }
    }
    const fetchStudents = () => {
        axios.get('/exams', {
            params: {
                page,
                limit,
                search
            }
        })
        .then((res) => {
            setExams(res.data.data)
            setTotalPages(res.data.pagination.totalPages)
        })
        .catch((err) => {
            console.error(err)
        })
    }

    useEffect(() => {
        fetchStudents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit, search])

    return(
        <>
            {/* EDIT STUDENT MODAL */}
            <Modal isOpen={isModalOpen} onClose={closeExamModal}>
                <h2 className="text-4xl font-bold text-center pb-4">Create Exam</h2>                
                <form onSubmit={submitExam} className="flex gap-2 flex-col">
                    <div className="flex justify-between flex-wrap text-2xl">
                        <label className="font-bold">Subject</label>
                        <input required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm" type="text"  value={subject} onChange={(e) => setSubject(e.target.value)}/>
                    </div>
                    <div className="flex justify-between flex-wrap text-2xl">
                        <label className="font-bold">Title</label>
                        <input required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="flex justify-between flex-wrap text-2xl">
                        <label className="font-bold">Number of Items</label>
                        <input required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm" type="number" pattern='' value={numberOfItems} onChange={(e) => setNumberOfItems(e.target.value)} />
                    </div>
                    <div className="flex justify-between flex-wrap text-2xl">
                        <label className="font-bold">Exam Type</label>
                        <select 
                            required name="examType" id="examType"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm" 
                            value={examType} 
                            onChange={(e) => setExamType(e.target.value)}
                        >
                            <option value="">--Select Exam Type--</option>
                            <option value="SUBJECT">SUBJECT</option>
                            <option value="ENTRANCE">ENTRANCE</option>
                        </select>
                    </div>
                    <button type="submit" className="cursor-pointer rounded bg-gray-800 hover:bg-gray-700 px-4 py-2 text-white mt-4">
                        Create
                    </button>
                </form>
            </Modal>
            <div className='flex justify-between mx-2 md:mx-6 max-md:mt-10'>
                <div>
                <h2 className='text-2xl font-bold'>Answer Keys</h2>
                <p className='text-muted-foreground'>Manage exam master sheets and configurations.</p>
                </div>
                <div>
                    <button onClick={() => setIsModalOpen(true)}  className='cursor-pointer px-3 py-2 text-white rounded-2xl bg-blue-500 hover:bg-blue-400 font-semibold'> + Create Exam</button>
                </div>
            </div>
            {/* SEARCH & FILTERS */}
            <div className="mt-5">
                <input 
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm" 
                    placeholder="Search by name, email, or student ID..." 
                    type="text" 
                    value={searchInput} 
                    onChange={(e) => setSearchInput(e.target.value)} 
                    onKeyDown={handleSearch}
                />
            </div>
            <div className="mt-5 w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                    <tr>
                        <th className="px-6 py-4 font-extrabold text-center">EXAM TITLE</th>
                        <th className="px-6 py-4 font-extrabold text-center">EXAM CODE</th>
                        <th className="px-6 py-4 font-extrabold text-center">SUBJECT</th>
                        <th className="px-6 py-4 font-extrabold text-center">ITEMS</th>
                        <th className="px-6 py-4 font-extrabold text-center">STATUS</th>
                        <th className="px-6 py-4 font-extrabold text-center">CREATED DATE</th>
                        <th className="px-6 py-4 font-extrabold text-center">ACTIONS</th>
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-200 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">
                        
                        </td>

                        <td className="px-6 py-4">
                        
                        </td>

                        <td className="px-6 py-4">
                        
                        </td>

                        <td className="px-6 py-4">
                        
                        </td>

                        <td className="px-6 py-4">
                        
                        </td>

                        <td className="px-6 py-4">
                        
                        </td>

                        <td className="px-6 py-4">
                            <div className="flex justify-center items-center">
                                <svg className='fill-muted-foreground'  xmlns="http://www.w3.org/2000/svg" width="24" height="24"  
                                fill="none" viewBox="0 0 24 24" >                            
                                <path d="M17 6V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H2v2h2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8h2V6zM9 4h6v2H9zM6 20V8h12v12z"></path><path d="M9 10h2v8H9zm4 0h2v8h-2z"></path>
                                </svg>
                            </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default TeacherAnswerKeys