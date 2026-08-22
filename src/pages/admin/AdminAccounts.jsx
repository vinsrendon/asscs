import { useState, useEffect } from 'react'
import axios from "../../../axios-config"
import Modal from '../modal.jsx'

function AdminAccounts(){
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState('all')
    const [isModalOpen, setIsModalOpen] = useState(false);

    const options = [
        { value: 'all', label: 'All' },
        { value: 'teachers', label: 'Teachers' },
        { value: 'students', label: 'Students' },
        { value: 'pendings', label: 'Pendings' },
    ]

    const [users, setUsers] = useState([])

    useEffect(() => {        
        axios.get("/users")
            .then((res) => {                
                setUsers(res.data)          
            })
            .catch((err) => {
                console.error(err)
            })
    }, [])

    const filteredUsers = users.filter((user) => {
        const matchesRole =
            selected === "all" || (selected === "teachers" && user.role?.toLowerCase() === "teacher") || 
            (selected === "students" && user.role?.toLowerCase() === "student") ||
            (selected === "pendings" && user.status?.toLowerCase() === "pending")

            const searchTerm = search.toLowerCase().trim()
            const matchesSearch = !searchTerm || user.name?.toLowerCase().includes(searchTerm) ||
            user.lname?.toLowerCase().includes(searchTerm) || `${user.name} ${user.lname}`.toLowerCase().includes(searchTerm) ||
            user.email?.toLowerCase().includes(searchTerm) || (user.studentId && String(user.studentId).toLowerCase().includes(searchTerm))

        return matchesRole && matchesSearch
    })
    return(
        <>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                <h2 className="text-xl font-bold">
                Hello!
                </h2>

                <p className="mt-2">
                This modal is rendered using a React Portal.
                </p>
            </Modal>

            <div className='flex max-md:flex-col-reverse justify-between max-md:mt-10'>
                <div>
                    <h2 className='text-2xl font-bold'>Account Management</h2>
                    <p className='text-muted-foreground'>Manage Teacher and student accounts</p>
                </div>
                <div className='max-md:self-end'>
                    <button className='px-3 py-2 text-white rounded-2xl bg-blue-500 hover:bg-blue-400 font-semibold'>+ Add Account</button>
                </div>
            </div>
            <div className='mt-5 flex flex-wrap max-md:flex-col justify-between gap-1'>
                <input className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm" required placeholder="Search by name, email, or student ID..." type="text" value={search} onChange={(e) => setSearch(e.target.value)}/>

                <div className="flex gap-2 flex-wrap">
                    {options.map((opt) => (
                        <label key={opt.value} className="cursor-pointer">
                        <input type="radio" name="option" value={opt.value} checked={selected === opt.value} onChange={() => setSelected(opt.value)} className="sr-only"/>
                        <span className={`inline-block px-4 py-2.5 rounded-xl border-2 font-medium transition-all 
                            ${selected === opt.value? 
                            'bg-primary text-white border-primary shadow-lg shadow-primary/25' : 
                            'bg-slate-50 text-slate-700 border-slate-200 hover:border-primary/50'}`}>
                            {opt.label} 
                        </span>
                        </label>
                    ))}
                </div>
            </div>
            <div className="mt-5 w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700 text-center">
                    <tr>
                        <th className="px-6 py-4 font-semibold">Name</th>
                        <th className="px-6 py-4 font-semibold">Email</th>
                        <th className="px-6 py-4 font-semibold">Role</th>
                        <th className="px-6 py-4 font-semibold">Student ID</th>
                        <th className="px-6 py-4 font-semibold">Course</th>
                        <th className="px-6 py-4 text-center font-semibold">Action</th>
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 text-center">
                    {
                        filteredUsers.map((user) => (
                            <tr key={user.uid} className={user.status === 'PENDING' ? "bg-red-300 hover:bg-red-200 transition-colors" : "hover:bg-current/5 transition-colors"}>
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {user.fname} {user.lname}
                                </td>

                                <td className="px-6 py-4">
                                    {user.email}
                                </td>

                                <td className="px-6 py-4">
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                                    {user.role}
                                </span>
                                </td>

                                <td className="px-6 py-4">
                                    {user.student_id? user.student_id:"-"}
                                </td>

                                <td className="px-6 py-4">
                                    {user.course? user.course:"-"}
                                </td>

                                <td className="px-6 py-4">
                                <div className="flex justify-center gap-2">
                                    <svg onClick={() => setIsModalOpen(true)} className='cursor-pointer fill-muted-foreground'  xmlns="http://www.w3.org/2000/svg" width="24" height="24"  
                                    fill="none" viewBox="0 0 24 24" >
                                    <path d="M19.67 2.61c-.81-.81-2.14-.81-2.95 0L3.38 15.95c-.13.13-.22.29-.26.46l-1.09 4.34c-.08.34.01.7.26.95.19.19.45.29.71.29.08 0 .16 0 .24-.03l4.34-1.09c.18-.04.34-.13.46-.26L21.38 7.27c.81-.81.81-2.14 0-2.95L19.66 2.6ZM6.83 19.01l-2.46.61.61-2.46 9.96-9.94 1.84 1.84zM19.98 5.86 18.2 7.64 16.36 5.8l1.78-1.78s.09-.03.12 0l1.72 1.72s.03.09 0 .12"></path>
                                    </svg>

                                    <svg className='fill-muted-foreground'  xmlns="http://www.w3.org/2000/svg" width="24" height="24"  
                                    fill="none" viewBox="0 0 24 24" >                            
                                    <path d="M17 6V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H2v2h2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8h2V6zM9 4h6v2H9zM6 20V8h12v12z"></path><path d="M9 10h2v8H9zm4 0h2v8h-2z"></path>
                                    </svg>
                                </div>
                                </td>
                            </tr>
                        ))
                    }
                    </tbody>
                </table>
            </div>
        </>        
    )
}

export default AdminAccounts