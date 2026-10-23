import { useState, useEffect } from 'react'
import axios from '../../../axios-config'
import Modal from '../modal.jsx'
import Swal from 'sweetalert2'
import { jsPDF } from 'jspdf'

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
    const [loading, setLoading] = useState(false)

    const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false)
    const [selectedExam, setSelectedExam] = useState(null)
    const [answers, setAnswers] = useState([])
    
    const [isModalOpen, setIsModalOpen] = useState(false)

    const closeExamModal = () => {
        setIsModalOpen(false)
        setSubject('')
        setTitle('')
        setExamType('')
        setNumberOfItems('')
    }

    const submitExam = async (e) => {
        e.preventDefault()

        if (!subject || !title || !examType || !numberOfItems) {
            Swal.fire({
            text: 'Please fill in all required fields',
            icon: 'warning'
            })
            return
        }

        try {
            const res = await axios.post('/exam', {
            subject,
            title,
            type: examType,
            numberOfItems: numberOfItems,
            status:"INACTIVE",
            })

            if (res.status === 200 || res.status === 201) {
            Swal.fire({
                text: res.data.message || 'Exam created successfully',
                icon: 'success'
            })
            closeExamModal()
            fetchExams()
            }
        } catch (err) {
            console.error(err)
            const message = err.response?.data?.message || 'Unexpected error occurred'
            Swal.fire({
            text: message,
            icon: 'error'
            })
        }
    }

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setPage(1)
            setSearch(searchInput.trim())
        }
    }

    const fetchExams = async () => {
        setLoading(true)
        try {
            const res = await axios.get('/exams', {
                params: { page, limit, search }
            })            
            // console.log(res.data);
            
            setExams(res.data.data || [])
            setTotalPages(res.data.pagination?.totalPages || 1)
        } catch (err) {
            console.error(err)
            setExams([])
        } finally {
            setLoading(false)
        }
    }

    const deleteExam = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This exam will be permanently deleted!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        })

        if (!result.isConfirmed) return

        try {
            const res = await axios.delete(`/exam/${id}`)

            if (res.status === 200 || res.status === 204) {
            Swal.fire({
                text: res.data?.message || 'Exam deleted successfully',
                icon: 'success'
            })
            fetchExams()
            }
        } catch (err) {
            console.error(err)
            const message = err.response?.data?.message || 'Failed to delete exam'
            Swal.fire({
            text: message,
            icon: 'error'
            })
        }
    }

    const openAnswerKeyModal = (exam) => {
        setSelectedExam(exam)

        let initialAnswers

        // If the exam already has an answer key, use the existing answers
        if (exam.answers && Array.isArray(exam.answers) && exam.answers.length > 0) {
            initialAnswers = [...exam.answers]
        } else {
            // Otherwise create empty answers based on total_items
            initialAnswers = Array(exam.total_items).fill('')
        }

        setAnswers(initialAnswers)
        setIsAnswerModalOpen(true)
    }

    const closeAnswerKeyModal = () => {
        setIsAnswerModalOpen(false)
        setSelectedExam(null)
        setAnswers([])
    }

    const submitAnswerKey = async (e) => {
        e.preventDefault()

        // Validation
        if (answers.some(ans => !ans.trim())) {
            Swal.fire({
            text: 'Please fill in all answers',
            icon: 'warning'
            })
            return
        }

        try {
            const res = await axios.post(`/exam/${selectedExam.id}/answer-key`, {
            answers: answers
            })

            if (res.status === 200) {
            Swal.fire({
                text: res.data.message || 'Answer key saved successfully',
                icon: 'success'
            })
            closeAnswerKeyModal()
            fetchExams() // refresh list so status updates
            }
        } catch (err) {
            console.error(err)
            const message = err.response?.data?.message || 'Failed to save answer key'
            Swal.fire({
            text: message,
            icon: 'error'
            })
        }
    }

    useEffect(() => {
        fetchExams()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit, search])

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    
    const printAnswerSheet = (exam) => {
        console.log(exam);
        
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'letter'
        })

        const pageWidth = doc.internal.pageSize.getWidth()
        const pageHeight = doc.internal.pageSize.getHeight()

        const totalItems = Number(exam.total_items)

        if (!Number.isInteger(totalItems) || totalItems < 1) {
            Swal.fire({
                icon: 'error',
                text: 'Invalid number of exam items.'
            })
            return
        }

        const margin = 15
        const headerY = 15
        const questionTop = 30
        const questionSpacing = 10
        const bottomMargin = 15

        // Three columns, similar to your reference image
        const columns = 3
        const columnGap = 5
        const columnWidth =
            (pageWidth - margin * 2 - columnGap * (columns - 1)) /
            columns

        const rowsPerColumn = Math.floor(
            (pageHeight - questionTop - bottomMargin) /
            questionSpacing
        )

        const questionsPerPage = rowsPerColumn * columns
        const totalPages = Math.ceil(totalItems / questionsPerPage)

        // Use the actual exam code length.
        const examCodeLength = Math.max(
            1,
            String(exam.code || '').length
        )

        // Adjust this if your student IDs have a different length.
        let studentIdLength = 8
        if(exam.type === "ENTRANCE") studentIdLength = 9

        const drawBoxes = (label, length, x, y) => {
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(12)
            doc.text(label, x, y + 4)

            const labelWidth = doc.getTextWidth(label)
            const boxStartX = x + labelWidth + 2
            const boxWidth = 6
            const boxHeight = 6
            const boxGap = 1

            for (let i = 0; i < length; i++) {
                doc.setLineWidth(0.3)

                doc.rect(
                    boxStartX + i * (boxWidth + boxGap),
                    y,
                    boxWidth,
                    boxHeight
                )
            }
        }

        const drawRegistrationMarkers = () => {
        const markerSize = 7 // mm
        const offset = 5 // mm from page edges

        const positions = [
            // Top-left
            { x: offset, y: offset },

            // Top-right
            {
                x: pageWidth - offset - markerSize,
                y: offset
            },

            // Bottom-left
            {
                x: offset,
                y: pageHeight - offset - markerSize
            },

            // Bottom-right
            {
                x: pageWidth - offset - markerSize,
                y: pageHeight - offset - markerSize
            }
        ]

            doc.setFillColor(0, 0, 0)
            doc.setDrawColor(0, 0, 0)

            positions.forEach(({ x, y }) => {
                doc.rect(x, y, markerSize, markerSize, 'F')
        })
    }

        const drawQuestion = (number, x, y) => {
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(14)

            doc.text(`${number}.`, x, y + 2.5)

            const choices = ['A', 'B', 'C', 'D']
            const bubbleStartX = x + 10
            const bubbleGap = 6
            const radius = 2.5

            choices.forEach((choice, index) => {
                const cx = bubbleStartX + index * bubbleGap

                doc.setLineWidth(0.3)
                doc.circle(cx, y, radius, 'S')

                doc.setFontSize(10)
                doc.text(choice, cx, y + 1.1, {
                    align: 'center'
                })
            })
        }

        for (let page = 0; page < totalPages; page++) {
            if (page > 0) {
                doc.addPage()
            }

            drawRegistrationMarkers()

            // Header
            drawBoxes(
                'EXAM CODE',
                examCodeLength,
                margin,
                headerY
            )

            if (exam.type === "ENTRANCE") {
                drawBoxes(
                    'APPLICANT ID',
                    studentIdLength,
                    pageWidth / 2,
                    headerY
                )
            } else {
                drawBoxes(
                    'STUDENT ID',
                    studentIdLength,
                    pageWidth / 2,
                    headerY
                )
            }
            

            // Questions
            const firstQuestion = page * questionsPerPage + 1
            const lastQuestion = Math.min(
                totalItems,
                firstQuestion + questionsPerPage - 1
            )

            for (
                let question = firstQuestion;
                question <= lastQuestion;
                question++
            ) {
                const index = question - firstQuestion

                // Fill each column from top to bottom.
                const column = Math.floor(index / rowsPerColumn)
                const row = index % rowsPerColumn

                const x =
                    margin + column * (columnWidth + columnGap)

                const y = questionTop + row * questionSpacing

                drawQuestion(question, x, y)
            }

            // Footer
            // doc.setFontSize(7)
            // doc.text(
            //     `Page ${page + 1} of ${totalPages}`,
            //     pageWidth / 2,
            //     pageHeight - 5,
            //     { align: 'center' }
            // )
        }

        const safeTitle = String(exam.title || 'Exam')
            // eslint-disable-next-line no-control-regex
            .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
            .trim()

        // doc.save(`${safeTitle}-Answer-Sheet.pdf`)
        const pdfBlob = doc.output('blob')
        const pdfUrl = URL.createObjectURL(pdfBlob)

        // Open PDF preview in a new tab
        // const previewWindow = window.open(pdfUrl, '_blank')

        // if (!previewWindow) {
        //     URL.revokeObjectURL(pdfUrl)

        //     Swal.fire({
        //         icon: 'warning',
        //         title: 'Preview blocked',
        //         text: 'Please allow pop-ups in your browser to preview the PDF.'
        //     })
        //     return
        // }
        setPdfPreview({
            url: pdfUrl,
            filename: `${safeTitle}-Answer-Sheet.pdf`
        })
    }
    const [pdfPreview, setPdfPreview] = useState(null)

    return(
        <>
            {/* PDF PREVIEW AND DOWNLOAD MODAL */}
            {pdfPreview && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-5xl h-[90vh] rounded-xl shadow-xl flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="font-semibold text-lg">
                                Answer Sheet Preview
                            </h2>

                            <button
                                onClick={() => {
                                    URL.revokeObjectURL(pdfPreview.url)
                                    setPdfPreview(null)
                                }}
                                className="cursor-pointer rounded-2xl bg-gray-800 hover:bg-gray-700 px-4 py-2 text-white hover:rounded-md duration-200 transition-all"
                            >
                                Close
                            </button>
                        </div>

                        <iframe
                            src={pdfPreview.url}
                            title="Answer Sheet PDF Preview"
                            className="flex-1 w-full"
                        />

                        <div className="flex justify-end gap-3 p-4 border-t">
                            <button
                                onClick={() => {
                                    const link = document.createElement('a')
                                    link.href = pdfPreview.url
                                    link.download = pdfPreview.filename
                                    link.click()
                                }}
                                className="px-5 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 cursor-pointer hover:rounded-md duration-200 transition-all"
                            >
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE EXAM MODAL */}
            <Modal isOpen={isModalOpen} onClose={closeExamModal}>
                <h2 className="text-4xl font-bold text-center pb-4">Create Exam</h2>                
                <form onSubmit={submitExam} className="flex gap-2 flex-col">
                    <div className="flex justify-between flex-wrap text-2xl">
                        <label className="font-bold">Subject</label>
                        <input required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm focus:rounded-md duration-200" type="text"  value={subject} onChange={(e) => setSubject(e.target.value)}/>
                    </div>
                    <div className="flex justify-between flex-wrap text-2xl">
                        <label className="font-bold">Title</label>
                        <input required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm focus:rounded-md duration-200" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="flex justify-between flex-wrap text-2xl">
                        <label className="font-bold">Number of Items</label>
                        <input required min="10" max="50" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm focus:rounded-md duration-200" type="number" pattern='' value={numberOfItems} onChange={(e) => setNumberOfItems(e.target.value)} />
                    </div>
                    <div className="flex justify-between flex-wrap text-2xl">
                        <label className="font-bold">Exam Type</label>
                        <select 
                            required name="examType" id="examType"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm focus:rounded-md duration-200" 
                            value={examType} 
                            onChange={(e) => setExamType(e.target.value)}
                        >
                            <option value="">--Select Exam Type--</option>
                            <option value="SUBJECT">SUBJECT</option>
                            <option value="ENTRANCE">ENTRANCE</option>
                        </select>
                    </div>
                    <button type="submit" className="cursor-pointer rounded-2xl bg-gray-800 hover:bg-gray-700 px-4 py-2 text-white mt-4 hover:rounded-md duration-200 transition-all">
                        Create
                    </button>
                </form>
            </Modal>

            {/* CREATE EXAM ANSWER KEY MODAL */}
            <Modal isOpen={isAnswerModalOpen} onClose={closeAnswerKeyModal}>
                <h2 className="text-3xl font-bold text-center pb-2">
                    Upload Answer Key
                </h2>
                <p className="text-center text-gray-500 mb-6">
                    {selectedExam?.title} ({selectedExam?.total_items} items)
                </p>

                <form onSubmit={submitAnswerKey} className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2">
                    {answers.map((answer, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <label className="w-16 font-medium text-gray-700">
                        Q {index + 1}
                        </label>
                        <input
                        required
                        type="text"
                        className="flex-1 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm focus:rounded-md transition-all duration-200"
                        placeholder="Enter correct answer"
                        maxLength="1"
                        value={answer}
                        onChange={(e) => {
                            const newAnswers = [...answers]
                            newAnswers[index] = e.target.value
                            setAnswers(newAnswers)
                        }}
                        />
                    </div>
                    ))}

                    <div className="flex gap-3 mt-4 sticky bottom-0 bg-white pt-3">
                    <button
                        type="button"
                        onClick={closeAnswerKeyModal}
                        className="flex-1 px-4 py-2 rounded-2xl border border-gray-300 hover:bg-gray-200 cursor-pointer hover:rounded-md duration-200 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-medium cursor-pointer hover:rounded-md duration-200 transition-all"
                    >
                        Save Answer Key
                    </button>
                    </div>
                </form>
            </Modal>
            
            <div className='flex justify-between mx-2 md:mx-6 max-md:mt-10'>
                <div>
                <h2 className='text-2xl font-bold'>Answer Keys</h2>
                <p className='text-muted-foreground'>Manage exam master sheets and configurations.</p>
                </div>
                <div>
                    <button onClick={() => setIsModalOpen(true)}  className='cursor-pointer px-3 py-2 text-white rounded-2xl bg-blue-500 hover:bg-blue-400 font-semibold hover:rounded-md transition-all duration-200 ease-linear'> + Create Exam</button>
                </div>
            </div>

            {/* SEARCH & FILTERS */}
            <div className="mt-5">
                <input 
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm focus:rounded-md transition-all duration-200 ease-linear" 
                    placeholder="Search by name, email, or student ID..." 
                    type="text" 
                    value={searchInput} 
                    onChange={(e) => setSearchInput(e.target.value)} 
                    onKeyDown={handleSearch}
                />
            </div>

            {/* PAGINATION CONTROLS */}
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
                        onChange={(e) => {
                            setLimit(Number(e.target.value))
                            setPage(1)
                        }}
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
                        <th className="px-6 py-4 font-extrabold text-center">EXAM TITLE</th>
                        <th className="px-6 py-4 font-extrabold text-center">EXAM CODE</th>
                        <th className="px-6 py-4 font-extrabold text-center">SUBJECT</th>
                        <th className="px-6 py-4 font-extrabold text-center">ITEMS</th>
                        <th className="px-6 py-4 font-extrabold text-center">KEY</th>
                        <th className="px-6 py-4 font-extrabold text-center">STATUS</th>
                        <th className="px-6 py-4 font-extrabold text-center">CREATED DATE</th>
                        <th className="px-6 py-4 font-extrabold text-center">ACTIONS</th>
                    </tr>
                    </thead>

                    <tbody key={exams} className="divide-y divide-gray-200 animate-table-body">
                        {loading ? (
                            <tr>
                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                Loading...
                            </td>
                            </tr>
                        ) : exams.length === 0 ? (
                            <tr>
                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                No exams found
                            </td>
                            </tr>
                        ) : (
                            exams.map((exam) => (
                            <tr key={exam.id} className="hover:bg-gray-50 cursor-default">
                                <td className="px-6 py-4 font-medium text-gray-900 text-center">
                                {exam.title}
                                </td>
                                <td className="px-6 py-4 text-center">
                                {exam.code}
                                </td>
                                <td className="px-6 py-4 text-center">
                                {exam.subject}
                                </td>
                                <td className="px-6 py-4 text-center">
                                {exam.total_items}
                                </td>
                                <td className="px-6 py-4 text-center">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    exam.key === 'has answer key'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}
                                >
                                    {exam.key === 'has answer key' ? 'Has Answer Key' : 'No Answer Key'}
                                </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                {exam.status}
                                </td>
                                <td className="px-6 py-4 text-center">
                                {formatDate(exam.created_at)}
                                </td>
                                <td className="px-6 py-4">
                                <div className="flex justify-center items-center gap-3">
                                    <button
                                        type="button"
                                        title="Print Answer Sheet"
                                        onClick={() => printAnswerSheet(exam)}
                                        className="text-gray-500 hover:text-blue-600 hover:-translate-y-1 duration-200 transition-all ease-linear cursor-pointer"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M19 7h-1V2H6v5H5c-1.65 0-3 1.35-3 3v7c0 1.1.9 2 2 2h2v3h12v-3h2c1.1 0 2-.9 2-2v-7c0-1.65-1.35-3-3-3M8 4h8v3H8zm8 16H8v-4h8zm4-3h-2v-3H6v3H4v-7c0-.55.45-1 1-1h14c.55 0 1 .45 1 1z" />
                                            <path d="M14 11h4v1h-4z" />
                                        </svg>
                                    </button>
                                    {/* <button title="Print Answer Sheet"
                                    className="text-gray-500 hover:text-blue-600 hover:-translate-y-1 duration-200 transition-all ease-linear">
                                        <svg  xmlns="http://www.w3.org/2000/svg" width="24" height="24"  
                                            fill="currentColor" viewBox="0 0 24 24" >
                                            <path d="M19 7h-1V2H6v5H5c-1.65 0-3 1.35-3 3v7c0 1.1.9 2 2 2h2v3h12v-3h2c1.1 0 2-.9 2-2v-7c0-1.65-1.35-3-3-3M8 4h8v3H8zm8 16H8v-4h8zm4-3h-2v-3H6v3H4v-7c0-.55.45-1 1-1h14c.55 0 1 .45 1 1z"></path><path d="M14 11h4v1h-4z"></path>
                                        </svg>
                                    </button> */}
                                    <button
                                    title="Upload Answer Key"
                                    className="text-gray-500 hover:text-blue-600 hover:-translate-y-1 duration-200 transition-all ease-linear"
                                    onClick={() => openAnswerKeyModal(exam)}
                                    >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="m12 8-5 6h4v7h2v-7h4z"></path>
                                        <path d="M19 3H5c-1.1 0-2 .9-2 2v7h2V5h14v7h2V5c0-1.1-.9-2-2-2"></path>
                                    </svg>
                                    </button>
                                    <button
                                    title="Delete"
                                    className="text-gray-500 hover:text-red-600 hover:scale-120 duration-200 transition-all ease-linear"
                                    onClick={() => deleteExam(exam.id)}
                                    >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                        d="M17 6V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H2v2h2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8h2V6zM9 4h6v2H9zM6 20V8h12v12z"
                                        fill="currentColor"
                                        />
                                        <path d="M9 10h2v8H9zm4 0h2v8h-2z" fill="currentColor" />
                                    </svg>
                                    </button>
                                </div>
                                </td>
                            </tr>
                            ))
                        )}
                    </tbody>                    
                </table>
            </div>            
        </>
    )
}

export default TeacherAnswerKeys