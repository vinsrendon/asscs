import { useState, useEffect } from 'react'
import axios from "../../../axios-config"
import Swal from 'sweetalert2'

function StudentPerformance() {
    const [subjectStrengths, setSubjectStrengths] = useState([])
    const [gradeTrends, setGradeTrends] = useState([])

    useEffect(() => {
        axios.get(`/student/subjectstrengths`)
            .then((res) => {
                setSubjectStrengths(res.data.stats || [])
            })
            .catch((err) => {
                console.error(err)

                Swal.fire({
                    text: err.response?.data?.message || 'Failed to load subject strengths',
                    icon: "error"
                })
            })
    }, [])

    useEffect(() => {
        axios.get(`/student/gradetrends`)
            .then((res) => {
                setGradeTrends(res.data.trends || [])
            })
            .catch((err) => {
                console.error(err)

                Swal.fire({
                    text: err.response?.data?.message || 'Failed to load grade trends',
                    icon: "error"
                })
            })
    }, [])

    const formatDate = (date) => {
        if (!date) return ''

        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    return (
        <>
            <div className='max-md:mt-10'>
                <div>
                    <h2 className='text-2xl font-bold'>
                        Performance Analytics
                    </h2>

                    <p className='text-muted-foreground'>
                        Visualize your strengths and areas for improvement.
                    </p>
                </div>
            </div>

            <div className='mt-6 grid md:grid-cols-2 gap-4'>

                {/* SUBJECT STRENGTHS */}
                <div className="w-full p-5 rounded-2xl shadow-sm shadow-gray-300">
                    <h1 className='font-bold text-2xl text-center'>
                        Subject Strengths
                    </h1>

                    <p className='text-center text-sm text-muted-foreground mt-2'>
                        Based on your latest 3 exams
                    </p>

                    {subjectStrengths.length === 0 ? (

                        <div className="h-50 flex justify-center items-center">
                            <p className="text-muted-foreground">
                                NO SUBJECT/S TO DISPLAY YET
                            </p>
                        </div>

                    ) : (

                        <div className='mt-6 space-y-5'>

                            {subjectStrengths.map((item, index) => {

                                const score = Number(
                                    item.average_score ?? item.score ?? 0
                                )

                                return (
                                    <div key={`${item.subject}-${index}`}>

                                        <div className='flex justify-between mb-2'>
                                            <p className='font-semibold'>
                                                {item.subject}
                                            </p>

                                            <p className='font-bold'>
                                                {score}%
                                            </p>
                                        </div>

                                        <div className='w-full h-3 bg-gray-200 rounded-full overflow-hidden'>

                                            <div
                                                className='h-full bg-blue-500 rounded-full'
                                                style={{
                                                    width: `${Math.min(score, 100)}%`
                                                }}
                                            />

                                        </div>

                                    </div>
                                )
                            })}

                        </div>
                    )}
                </div>


                {/* GRADE TREND */}
                <div className="w-full p-5 rounded-2xl shadow-sm shadow-gray-300">

                    <h1 className='font-bold text-2xl text-center'>
                        Overall Grade Trend
                    </h1>

                    <p className='text-center text-sm text-muted-foreground mt-2'>
                        Your performance across exams
                    </p>

                    {gradeTrends.length === 0 ? (

                        <div className="h-50 flex justify-center items-center">
                            <p className="text-muted-foreground">
                                NO GRADE DATA TO DISPLAY YET
                            </p>
                        </div>

                    ) : (

                        <div className='mt-6 space-y-4'>

                            {gradeTrends.map((item, index) => {

                                const score = Number(item.score) || 0

                                return (
                                    <div
                                        key={`${item.exam_id}-${index}`}
                                        className='flex items-center gap-3'
                                    >

                                        <div className='w-12 text-right'>
                                            <p className='font-bold'>
                                                {score}%
                                            </p>
                                        </div>

                                        <div className='flex-1'>

                                            <div className='flex justify-between mb-1'>

                                                <p className='text-sm font-medium truncate'>
                                                    {item.exam_title}
                                                </p>

                                                <p className='text-xs text-muted-foreground ml-2'>
                                                    {formatDate(item.exam_date)}
                                                </p>

                                            </div>

                                            <div className='w-full h-2.5 bg-gray-200 rounded-full overflow-hidden'>

                                                <div
                                                    className='h-full bg-green-500 rounded-full'
                                                    style={{
                                                        width: `${Math.min(score, 100)}%`
                                                    }}
                                                />

                                            </div>

                                        </div>

                                    </div>
                                )
                            })}

                        </div>
                    )}
                </div>

            </div>
        </>
    )
}

export default StudentPerformance