import { useState, useEffect } from 'react'
import axios from "../../../axios-config"
import Modal from '../modal.jsx'
import Swal from 'sweetalert2'

function AdminAccounts(){
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [selected, setSelected] = useState('all')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [users, setUsers] = useState([])

    const [firstname, setFirstname] = useState('')
    const [middlename, setMiddlename] = useState('')
    const [lastname, setLastname] = useState('')
    const [course, setCourse] = useState('')
    const [role, setRole] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const options = [
        { value: 'all', label: 'All' },
        { value: 'teachers', label: 'Teachers' },
        { value: 'students', label: 'Students' },
        { value: 'applicants', label: 'Applicants' },
        { value: 'pendings', label: 'Pendings' },
        { value: 'inactive', label: 'Inactives' }
    ]    

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPage(1)
    }, [search, selected, limit])

    useEffect(() => {
        axios.get(`/users`, {
            params: {
            page,
            limit,
            search,
            filter: selected
            }
        })
        .then((res) => {
            setUsers(res.data.data)
            setTotalPages(res.data.pagination.totalPages)
        })
        .catch((err) => {
            console.error(err)
        })
    }, [page, limit, search, selected])

    const [selectedUser, setSelectedUser] = useState(null)
    const [originalUser, setOriginalUser] = useState(null)

    const editUser = (user) => {
        setSelectedUser(user)
        setOriginalUser(user)
        setIsModalOpen(true)
    }

    const closeEditModal = () => {
        setSelectedUser(null)
        setIsModalOpen(false)        
    }

    const closeAddModal = () => {
        setIsAddModalOpen(false)   
        clearForm()     
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
            console.log("No changes")
            closeEditModal()
            return
        }
        
        await axios.patch(
            `/user/${selectedUser.uid}`,
            changedFields
        ).then((res)=>{            
            axios.get("/users", {
                params: {
                    page,
                    limit,
                    search,
                    filter: selected
                }
                })
                .then((res) => {
                setUsers(res.data.data)
                setTotalPages(res.data.pagination.totalPages)
                })
                .catch((err) => {
                    Swal.fire({
                        text: err,
                        icon:"error"
                    })
                })
            Swal.fire({
                title: "Updated",
                text: res.data.message,
                icon:"success"
            })
            closeEditModal()
        }).catch((err) => {
            console.error("Update failed:", err)
        })
    }

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setSearch(e.target.value)
        }
    }

    const clearForm = () =>{
        setFirstname('')
        setMiddlename('')
        setLastname('')
        setCourse('')
        setPhone('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setRole('')
    }

    const registerUser = async (e) =>{
        e.preventDefault()

        setLoading(true)

        if(password != confirmPassword){
            Swal.fire({
                text:"Password Doesn't match",
                icon:"warning"
            })
            return
        }

        if(course === "NULL")
            setCourse('')

        await axios.post(
            '/register',
            {
                firstname: firstname,
                middlename: middlename,
                lastname: lastname,
                course: course,
                role: role,
                phone: phone,
                email: email,
                password: password,
                status : 'ACTIVE'
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
            clearForm()
        }).catch((err)=>{
            console.log(err)
            clearForm()
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

                case 409:
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
        }).finally(()=>{
            setLoading(false)
        })
    }

    return(
        <>
            {/* MODAL FOR EDIT USER */}
            <Modal isOpen={isModalOpen} onClose={() => closeEditModal()} >
                <h2 className="text-4xl font-bold text-center pb-4">Edit User Info</h2>
                {selectedUser && (
                    <form onSubmit={submitEdit} className='flex gap-2 flex-col'>
                        <div className='flex justify-between flex-wrap text-2xl'>
                            <label className="font-bold">Firstname</label>
                            <input type='text' disabled value={selectedUser.fname}></input>
                        </div>
                        <div className='flex justify-between flex-wrap text-2xl'>
                            <label className="font-bold">Middlename</label>
                            <input type='text' disabled value={selectedUser.mname}></input>
                        </div>
                        <div className='flex justify-between flex-wrap text-2xl'>
                            <label className="font-bold">Lastname</label>
                            <input type='text' disabled value={selectedUser.lname}></input>
                        </div>
                        <div className='flex justify-between flex-wrap text-2xl'>
                            <label className="font-bold">Course</label>
                            <input type='text' disabled value={selectedUser.course}></input>
                        </div>
                        <div className='flex justify-between flex-wrap text-2xl'>
                            <label className="font-bold">Role</label>
                            <input type='text' disabled value={selectedUser.role}></input>
                        </div>
                        <div className='flex justify-between flex-wrap text-2xl'>
                            <label className="font-bold">Phone</label>
                            <input className='w-full' required minLength='11' maxLength='11' type="numeric" pattern="[0-9]*" value={selectedUser.phone} 
                                onChange={(e) =>
                                    setSelectedUser({
                                        ...selectedUser,
                                        phone: e.target.value
                                    })
                                }>
                            </input>
                        </div>
                        <div className='flex justify-between flex-wrap text-2xl'>
                            <label className="font-bold">Email</label>
                            <input className="w-full" type='text' value={selectedUser.email}
                                onChange={(e) =>
                                    setSelectedUser({
                                        ...selectedUser,
                                        email: e.target.value
                                    })
                                }>                            
                            </input>
                        </div>
                        <div className='flex justify-between flex-wrap text-2xl'>
                            <label className="font-bold">Password</label>
                            <input className='w-full' type='password' value={selectedUser.password}
                                onChange={(e) =>
                                    setSelectedUser({
                                        ...selectedUser,
                                        password: e.target.value
                                    })
                                }>
                            </input>
                        </div>
                        <div className='flex justify-between flex-wrap text-2xl'>
                            <label className="font-bold">Status</label>
                            {/* <input type='text' disabled value={selectedUser.status}></input> */}
                            <select required name="course" id="course" className='w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm' value={selectedUser.status} 
                                onChange={(e) => 
                                    setSelectedUser({
                                        ...selectedUser,
                                        status: e.target.value
                                    })
                                }>
                                <option value="PENDING">PENDING</option>
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </div>
                        <button type='submit' className="cursor-pointer rounded bg-gray-800 hover:bg-gray-700 px-4 py-2 text-white" >
                            Save
                        </button>
                    </form>           
                )}
            </Modal>

            <Modal isOpen={isAddModalOpen} onClose={() => closeAddModal()}>
                <h2 className="text-4xl font-bold text-center pb-4">Add User</h2>
                <form className="space-y-1" onSubmit={registerUser}>
                    <div className="grid grid-cols-2 gap-3">
                        <div className='space-y-1.5'>
                            <label className="text-sm font-semibold text-foreground">First Name</label>
                            <input required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm" placeholder="Juan" type="text" value={firstname} onChange={(e) => setFirstname(e.target.value)}></input>
                        </div>
                        <div className='space-y-1.5'>
                            <label className="text-sm font-semibold text-foreground">
                                Middle Name 
                                <span className='text-muted-foreground font-normal'> (Optional)</span>
                            </label>
                            <input className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm" placeholder="Santos" type="text" value={middlename} onChange={(e) => setMiddlename(e.target.value)}></input>
                        </div>                                
                    </div>
                    <div className='space-y-1.5'>
                        <label className="text-sm font-semibold text-foreground">Last Name</label>
                        <input required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm" placeholder="Dela Cruz" type="text" value={lastname} onChange={(e) => setLastname(e.target.value)}></input>                                
                    </div>
                    <div className='space-y-1.5'>
                        <label className="text-sm font-semibold text-foreground">Course</label>
                        <select required name="course" id="course" className='w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm' value={course} onChange={(e) => setCourse(e.target.value)}>
                            <option value="">--Select User Course--</option>
                            <option value="BSED">BSED</option>
                            <option value="BSEE">BSEE</option>
                            <option value="BSHM">BSHM</option>
                            <option value="BSIT">BSIT</option>
                            <option value="NULL">N/A</option>
                        </select>
                    </div>
                    <div className='space-y-1.5'>
                        <label className="text-sm font-semibold text-foreground">Phone Number</label>
                        <input required minLength='11' maxLength='11' className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm" placeholder="09123456789" type="numeric" pattern="[0-9]*"  value={phone} onChange={(e) => setPhone(e.target.value)}></input>
                    </div>
                    <div className='space-y-1.5'>
                        <label className="text-sm font-semibold text-foreground">Email Address</label>
                        <input required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm" placeholder="you@school.edu" type="email" value={email} onChange={(e) => setEmail(e.target.value)}></input>
                    </div>
                    <div className='space-y-1.5'>
                        <label className="text-sm font-semibold text-foreground">Password</label>
                        <input required minLength="6" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm" placeholder="Min. 6 characters" type="password" value={password} onChange={(e) => setPassword(e.target.value)}></input>
                    </div>
                    <div className='space-y-1.5'>
                        <label className="text-sm font-semibold text-foreground">Confirm Password</label>
                        <input required minLength="6" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm" placeholder="Min. 6 characters" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}></input>
                    </div>
                    <div className='space-y-1.5'>
                        <label className="text-sm font-semibold text-foreground">User Role</label>
                        <select required name="course" id="course" className='w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm' value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="">--Select The Role--</option>
                            <option value="APPLICANT">APPLICANT</option>
                            <option value="STUDENT">STUDENT</option>
                            <option value="TEACHER">TEACHER</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                    </div>
                    <button disabled={loading} className="w-full group flex items-center justify-center gap-2 px-6 py-3.5 mt-2 rounded-xl font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200" type="submit">
                    {loading ? 'Registering...' : 'Submit Registration'} 
                    {/* <img src={arrow} alt="right arrow" /> */}
                    </button>
                </form>
            </Modal>

            <div className='flex max-md:flex-col-reverse justify-between max-md:mt-10'>
                <div>
                    <h2 className='text-2xl font-bold'>Account Management</h2>
                    <p className='text-muted-foreground'>Manage Teacher and student accounts</p>
                </div>
                <div className='max-md:self-end'>
                    <button onClick={() => setIsAddModalOpen(true)} className='cursor-pointer px-3 py-2 text-white rounded-2xl bg-blue-500 hover:bg-blue-400 font-semibold hover:rounded-md transition-all duration-200 ease-linear'>+ Add Account</button>
                </div>
            </div>
            <div className='mt-5 flex flex-wrap max-md:flex-col justify-between gap-1'>
                <input className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 focus:rounded-md transition-all duration-200 ease-linear text-sm" required placeholder="Search by name, email, or student ID..." type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={handleSearch}/>

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
            <div className="mt-5 w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex justify-center items-center gap-4 my-4 text-sm flex-wrap">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>

                    <span className="font-medium">
                        Page {page} of {totalPages}
                    </span>

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
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700 text-center">
                    <tr>
                        <th className="px-1 py-4 font-semibold">First Name</th>
                        <th className="px-1 py-4 font-semibold">Last Name</th>
                        <th className="px-1 py-4 font-semibold">Email</th>
                        <th className="px-1 py-4 font-semibold">Role</th>
                        <th className="px-1 py-4 font-semibold">Student ID</th>
                        <th className="px-1 py-4 font-semibold">Applicant ID</th>
                        <th className="px-1 py-4 font-semibold">Course</th>
                        <th className="px-1 py-4 text-center font-semibold">Action</th>
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 text-center  transition-all duration-1000 ease-linear">
                    {
                        users.map((user) => (
                            <tr key={user.uid} className={
                                user.status === 'PENDING' ? "bg-red-300 hover:bg-red-200 transition-colors" : "hover:bg-current/5 transition-colors"}>
                                <td className="px-6 py-4 font-medium text-left text-gray-900">
                                    {user.fname}
                                </td>
                                <td className="px-6 py-4 font-medium text-left text-gray-900">
                                    {user.lname}
                                </td>

                                <td className="px-6 py-4 text-left">
                                    {user.email}
                                </td>

                                <td className="px-6 py-4">
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:cursor-default">
                                    {user.role}
                                </span>
                                </td>

                                <td className="px-6 py-4">
                                    {user.student_id? user.student_id:"-"}
                                </td>

                                <td className="px-6 py-4">
                                    {user.applicant_id? user.applicant_id:"-"}
                                </td>

                                <td className="px-6 py-4">
                                    {user.course? user.course:"-"}
                                </td>

                                <td className="px-6 py-4">
                                <div className="flex justify-center gap-2">
                                    <svg onClick={() => {editUser(user)}} className='cursor-pointer fill-muted-foreground hover:fill-blue-500 hover:scale-110 transition-all duration-200 ease-linear'  xmlns="http://www.w3.org/2000/svg" width="24" height="24"  
                                    fill="none" viewBox="0 0 24 24" >
                                    <path d="M19.67 2.61c-.81-.81-2.14-.81-2.95 0L3.38 15.95c-.13.13-.22.29-.26.46l-1.09 4.34c-.08.34.01.7.26.95.19.19.45.29.71.29.08 0 .16 0 .24-.03l4.34-1.09c.18-.04.34-.13.46-.26L21.38 7.27c.81-.81.81-2.14 0-2.95L19.66 2.6ZM6.83 19.01l-2.46.61.61-2.46 9.96-9.94 1.84 1.84zM19.98 5.86 18.2 7.64 16.36 5.8l1.78-1.78s.09-.03.12 0l1.72 1.72s.03.09 0 .12"></path>
                                    </svg>
                                </div>
                                </td>
                            </tr>
                        ))
                    }
                    </tbody>
                </table>
                <div className="flex justify-center items-center text-sm gap-4 my-4 flex-wrap">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>

                    <span className="font-medium">
                        Page {page} of {totalPages}
                    </span>

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
            </div>
        </>        
    )
}

export default AdminAccounts