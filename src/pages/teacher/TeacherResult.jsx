import { useState, useEffect } from 'react'
import axios from '../../../axios-config'
import Modal from '../modal.jsx'
import Swal from 'sweetalert2'

function TeacherResult(){    
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [students, setStudents] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false) 
    const [selectedStudent, setSelectedStudent] = useState(null) 
    const [studentResults, setStudentResults] = useState([]) 
    const [loadingResults, setLoadingResults] = useState(false)
    const [selected, setSelected] = useState('students')

    const options = [
        { value: 'students', label: 'Students' },
        { value: 'applicants', label: 'Applicants' }
    ]

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPage(1)
    }, [search, selected, limit])

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

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setSearch(e.target.value)
        }
    }

    const viewResults = async (student) => { 
        setSelectedStudent(student) 
        setStudentResults([]) 
        setIsModalOpen(true) 
        setLoadingResults(true) 
        try { 
            const res = await axios.get( `/student/${student.student_id || student.applicant_id }/results` ) 
            setStudentResults(res.data.data || []) 
        } 
        catch (err) { 
            console.error(err) 
            Swal.fire({ title: 'Error', text: err.response?.data?.message || 'Failed to load student exam results.', icon: 'error' }) 
        } 
        finally { setLoadingResults(false) } 
    }

    const closeResultsModal = () => { 
        setIsModalOpen(false) 
        setSelectedStudent(null) 
        setStudentResults([]) 
    }

    return(
        <>            
            {/* SHOW RESULT MODAL */}
            <Modal isOpen={isModalOpen} onClose={closeResultsModal}>
                <div className="w-full max-w-4xl">

                    {/* Modal Header */}
                    <div className="mb-5">
                        <h2 className="text-xl font-bold">
                            Exam Results
                        </h2>

                        {selectedStudent && (
                            <div className="mt-2 text-sm text-gray-500">
                                <p>
                                    <span className="font-semibold text-gray-700">
                                        Student:
                                    </span>{" "}
                                    {selectedStudent.fname}{" "}
                                    {selectedStudent.lname}
                                </p>

                                <p>
                                    <span className="font-semibold text-gray-700">
                                        {selectedStudent.student_id ? `Student ID:`: `Applicant ID:`}
                                    </span>{" "}
                                    {selectedStudent.student_id || selectedStudent.applicant_id ||"-"}
                                </p>

                                <p>
                                    <span className="font-semibold text-gray-700">
                                        {selectedStudent.student_id ? `Course:`: `Enrolling for:`}
                                    </span>{" "}
                                    {selectedStudent.course || "-"}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Loading */}
                    {loadingResults ? (
                        <div className="flex justify-center items-center py-10">
                            <div className="text-gray-500">
                                Loading exam results...
                            </div>
                        </div>
                    ) : studentResults.length === 0 ? (
                        /* No Results */
                        <div className="py-10 text-center text-gray-500">
                            This student has not taken any exams yet.
                        </div>
                    ) : (
                        /* Results Table */
                        <div className="w-full overflow-x-auto rounded-xl border border-gray-200">
                            <table className="w-full text-left text-sm">

                                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                                    <tr>
                                        <th className="px-4 py-3">
                                            EXAM
                                        </th>

                                        <th className="px-4 py-3">
                                            SUBJECT
                                        </th>

                                        <th className="px-4 py-3 text-center">
                                            SCORE
                                        </th>

                                        <th className="px-4 py-3 text-center">
                                            PERCENTAGE
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {studentResults.map((result) => {

                                        const score = Number(result.score) || 0
                                        const totalItems =
                                            Number(result.total_items) || 0

                                        const correct =
                                            totalItems > 0
                                                ? Math.round(
                                                    (score / 100) *
                                                    totalItems
                                                )
                                                : 0

                                        return (
                                            <tr
                                                key={result.result_id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-4 py-4">
                                                    <div className="font-semibold text-gray-900">
                                                        {result.exam_title || "-"}
                                                    </div>

                                                    <div className="text-xs text-gray-400">
                                                        {result.exam_code || "-"}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4">
                                                    {result.subject || "-"}
                                                </td>

                                                <td className="px-4 py-4 text-center font-semibold">
                                                    {correct} / {totalItems}
                                                </td>

                                                <td className="px-4 py-4 text-center">
                                                    <span className="font-semibold">
                                                        {score}%
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>

                            </table>
                        </div>
                    )}
                </div>
            </Modal>

            <div className='flex justify-between mx-2 md:mx-6 max-md:mt-10 max-sm:flex-col-reverse'>
                <div>
                    <h2 className='text-2xl font-bold'>Exam Results</h2>
                    <p className='text-muted-foreground'>Review all scanned sheet results and scores.</p>
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
                            'bg-slate-50 text-slate-700 border-slate-200 hover:border-primary/50hover:rounded-md transition-all duration-200 ease-linear'}`}>
                            {opt.label} 
                        </span>
                        </label>
                    ))}
                </div>
            </div>          

            {/* BOTTOM PAGINATION CONTROLS */}
            <div className="flex justify-center items-center text-sm gap-4 my-2 flex-wrap">
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
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                        <tr>
                            <th className="px-6 py-4 font-extrabold text-left">
                                STUDENT
                            </th>

                            <th className="px-6 py-4 font-extrabold text-left">
                                CONTACT
                            </th>

                            <th className="px-6 py-4 font-extrabold text-center">
                                COURSE
                            </th>

                            <th className="px-6 py-4 font-extrabold text-center">
                                ID NUMBER
                            </th>

                            <th className="px-6 py-4 font-extrabold text-center">
                                ACTIONS
                            </th>
                        </tr>
                    </thead>

                    <tbody key={selected} className="divide-y divide-gray-200 text-center animate-table-body">
                        {students.length > 0 ? (
                            students.map((student) => (
                                <tr
                                    key={student.uid}
                                    className={
                                        student.status === 'PENDING'
                                            ? "bg-red-300 hover:bg-red-200 transition-colors"
                                            : "hover:bg-gray-100 transition-colors"
                                    }
                                >
                                    {/* Student */}
                                    <td className="px-6 py-4 font-medium text-gray-900 text-left">
                                        {student.fname} {student.lname}
                                    </td>

                                    {/* Contact */}
                                    <td className="px-6 py-4 text-left">
                                        <div>
                                            {student.email}
                                        </div>

                                        <div className="text-xs text-gray-400">
                                            {student.phone}
                                        </div>
                                    </td>

                                    {/* Course */}
                                    <td className="px-6 py-4">
                                        {student.course || "-"}
                                    </td>

                                    {/* Student ID */}
                                    <td className="px-6 py-4">
                                        {student.student_id || student.applicant_id || "-"}
                                    </td>

                                    {/* Action */}
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center items-center gap-2">

                                            {/* View Results */}
                                            <svg
                                                onClick={() => viewResults(student)}
                                                className="cursor-pointer fill-muted-foreground hover:fill-blue-500 hover:scale-110 transition-all duration-200 ease-linear"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5Zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3Z" />
                                            </svg>

                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="px-6 py-10 text-center text-gray-400"
                                >
                                    No students found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>            
        </>
    )
}

export default TeacherResult