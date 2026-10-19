import { useState, useEffect } from 'react'
import axios from '../../../axios-config'
import Modal from '../modal.jsx'
import Swal from 'sweetalert2'

function TeacherStudents(){    
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [students, setStudents] = useState([])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [originalUser, setOriginalUser] = useState(null)
    const [selected, setSelected] = useState('students')

    const options = [
        { value: 'students', label: 'Students' },
        { value: 'applicants', label: 'Applicants' }
    ]

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPage(1)
    }, [search,selected, limit])

    const fetchStudents = () => {
        axios.get('/users', {
            params: {
                page,
                limit,
                search,
                filter: selected
            }
        })
        .then((res) => {
            setStudents(res.data.data)
            setTotalPages(res.data.pagination.totalPages)
        })
        .catch((err) => {
            console.error(err)
        })
    }

    useEffect(() => {
        fetchStudents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit, search, selected])

    const editUser = (user) => {
        setSelectedUser(user)
        setOriginalUser(user)
        setIsModalOpen(true)
    }

    const closeEditModal = () => {
        setSelectedUser(null)
        setIsModalOpen(false)
    }

    const submitEdit = async (e) => {
        e.preventDefault()

        const changedFields = {}

        Object.keys(selectedUser).forEach((key) => {
            if (selectedUser[key] !== originalUser[key]) {
                changedFields[key] = selectedUser[key]
            }
        })

        if (Object.keys(changedFields).length === 0) {
            closeEditModal()
            return
        }

        try {
            const res = await axios.patch(`/user/${selectedUser.uid}`, changedFields)
            fetchStudents()
            Swal.fire({
                title: "Updated",
                text: res.data.message,
                icon: "success"
            })
            closeEditModal()
        } catch (err) {
            console.error("Update failed:", err)
            Swal.fire({
                text: err.response?.data?.message || err.message,
                icon: "error"
            })
        }
    }

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setSearch(e.target.value)
        }
    }


    return(
        <>
            {/* EDIT STUDENT MODAL */}
            <Modal isOpen={isModalOpen} onClose={closeEditModal}>
                <h2 className="text-4xl font-bold text-center pb-4">Edit Student Info</h2>
                {selectedUser && (
                    <form onSubmit={submitEdit} className="flex gap-2 flex-col">
                        <div className="flex justify-between flex-wrap text-2xl">
                            <label className="font-bold">Firstname</label>
                            <input type="text" disabled value={selectedUser.fname || ''} />
                        </div>
                        <div className="flex justify-between flex-wrap text-2xl">
                            <label className="font-bold">Middlename</label>
                            <input type="text" disabled value={selectedUser.mname || ''} />
                        </div>
                        <div className="flex justify-between flex-wrap text-2xl">
                            <label className="font-bold">Lastname</label>
                            <input type="text" disabled value={selectedUser.lname || ''} />
                        </div>
                        <div className="flex justify-between flex-wrap text-2xl">
                            <label className="font-bold">Course</label>
                            <input type="text" disabled value={selectedUser.course || ''} />
                        </div>
                        <div className="flex justify-between flex-wrap text-2xl">
                            <label className="font-bold">Phone</label>
                            <input 
                                className="w-full" 
                                required 
                                minLength="11" 
                                maxLength="11" 
                                type="numeric" 
                                pattern="[0-9]*" 
                                value={selectedUser.phone || ''} 
                                onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-between flex-wrap text-2xl">
                            <label className="font-bold">Email</label>
                            <input 
                                className="w-full" 
                                type="text" 
                                value={selectedUser.email || ''}
                                onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-between flex-wrap text-2xl">
                            <label className="font-bold">Status</label>
                            <select 
                                required 
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm" 
                                value={selectedUser.status || ''} 
                                onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })}
                            >
                                <option value="PENDING">PENDING</option>
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </div>
                        <button type="submit" className="cursor-pointer rounded bg-gray-800 hover:bg-gray-700 px-4 py-2 text-white mt-4">
                            Save
                        </button>
                    </form>
                )}
            </Modal>

            <div className='flex justify-between mx-2 md:mx-6 max-md:mt-10'>
                <div>
                <h2 className='text-2xl font-bold'>Students Directory</h2>
                <p className='text-muted-foreground'>Manage enrolled students and their access.</p>
                </div>
            </div>            

            <div className='mt-5 flex flex-wrap max-md:flex-col justify-between gap-1'>
                <input 
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm focus:rounded-md transition-all duration-200 ease-linear" 
                    placeholder="Search by name, email, or student ID..." 
                    type="text" 
                    value={searchInput} 
                    onChange={(e) => setSearchInput(e.target.value)} 
                    onKeyDown={handleSearch}
                />
                <div className="flex gap-2 flex-wrap">
                    {options.map((opt) => (
                        <label key={opt.value} className="cursor-pointer">
                        <input type="radio" name="option" value={opt.value} checked={selected === opt.value} onChange={() => setSelected(opt.value)} className="sr-only"/>
                        <span className={`inline-block px-4 py-2.5 rounded-xl border-2 font-medium transition-all 
                            ${selected === opt.value? 
                            'bg-primary text-white border-primary shadow-lg shadow-primary/25' : 
                            'bg-slate-50 text-slate-700 border-slate-200 hover:border-primary/50 hover:rounded-md transition-all duration-200 ease-linear'}`}>
                            {opt.label} 
                        </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* PAGINATION CONTROLS */}
            <div className="flex justify-center items-center text-sm gap-4 by-2 flex-wrap">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <span className="font-medium">Page {page} of {totalPages}</span>
                <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Show</span>
                    <select
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-600">entries</span>
                </div>
            </div>

            <div className="mt-2 w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                {/* DATA TABLE */}
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                        <tr>
                            <th className="px-6 py-4 font-extrabold text-left">STUDENT</th>
                            <th className="px-6 py-4 font-extrabold text-left">CONTACT</th>
                            <th className="px-6 py-4 font-extrabold text-center">COURSE</th>
                            <th className="px-6 py-4 font-extrabold text-center">ID NUMBER</th>
                            <th className="px-6 py-4 font-extrabold text-center">ACTIONS</th>
                        </tr>
                    </thead>

                    <tbody key={selected} className="divide-y divide-gray-200 text-center animate-table-body">
                        {students.map((student) => (
                            <tr key={student.uid} className={student.status === 'PENDING' ? "bg-red-300 hover:bg-red-200 transition-colors" : "hover:bg-gray-100 transition-colors"}>
                                {/* STUDENT NAME */}
                                <td className="px-6 py-4 font-medium text-gray-900 text-left">
                                    {student.fname} {student.lname}
                                </td>

                                {/* CONTACT */}
                                <td className="px-6 py-4 text-left">
                                    <div>{student.email}</div>
                                    <div className="text-xs text-gray-400">{student.phone}</div>
                                </td>

                                {/* COURSE */}
                                <td className="px-6 py-4">
                                    {student.course || "-"}
                                </td>

                                {/* ID NUMBER */}
                                <td className="px-6 py-4">
                                    {student.student_id || student.applicant_id || "-"}
                                </td>

                                {/* ACTIONS */}
                                <td className="px-6 py-4">
                                    <div className="flex justify-center items-center gap-2">
                                        <svg 
                                            onClick={() => editUser(student)} 
                                            className="cursor-pointer fill-muted-foreground hover:fill-blue-500 hover:scale-110 transition-all duration-200 ease-linear"  
                                            xmlns="http://www.w3.org/2000/svg" 
                                            width="24" 
                                            height="24"  
                                            fill="none" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M19.67 2.61c-.81-.81-2.14-.81-2.95 0L3.38 15.95c-.13.13-.22.29-.26.46l-1.09 4.34c-.08.34.01.7.26.95.19.19.45.29.71.29.08 0 .16 0 .24-.03l4.34-1.09c.18-.04.34-.13.46-.26L21.38 7.27c.81-.81.81-2.14 0-2.95L19.66 2.6ZM6.83 19.01l-2.46.61.61-2.46 9.96-9.94 1.84 1.84zM19.98 5.86 18.2 7.64 16.36 5.8l1.78-1.78s.09-.03.12 0l1.72 1.72s.03.09 0 .12"></path>
                                        </svg>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>            
        </>
    )
}

export default TeacherStudents