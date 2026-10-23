import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import axios from '../../../axios-config.js'

function StudentResults() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedResult, setSelectedResult] = useState(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchTakenExams()
  }, [])

  const fetchTakenExams = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/student/taken-exams', {})      
      setResults(res.data.results || [])
    } catch (err) {
        Swal.fire({
            text: err,
            icon:"error"
        })
        setError(err.message)
    } finally {
        setLoading(false)
    }
  }

  // Parse JSON string or return array object safely
  const parseData = (data) => {
    if (!data) return []
    if (typeof data === 'string') {
      try {
        return JSON.parse(data)
      } catch {
        return []
      }
    }
    return data
  }

  // Compare student answers with the exam answer key
  const formatAnswersComparison = (selected) => {
    const studentAns = parseData(selected.student_answers)
    const answerKey = parseData(selected.answer_key)

    return studentAns.map((item, index) => {
      const qNum = item.question || index + 1
      const studentVal = (item.studentAnswer || item.answer || '?').toString().toUpperCase().trim()
      const keyVal = (answerKey[index] || 'N/A').toString().toUpperCase().trim()
      const isCorrect = studentVal === keyVal

      return {
        question: qNum,
        studentAnswer: studentVal,
        correctAnswer: keyVal,
        isCorrect
      }
    })
  }

  return (
    <>
      <div className="max-md:mt-10 animate-fade-in [animation-delay:0ms]!">
        <div>
          <h2 className="text-2xl font-bold">My Results</h2>
          <p className="text-muted-foreground">
            Detailed history of all your scanned exam sheets.
          </p>
        </div>
      </div>

      <div className="mt-5 p-5 rounded-2xl mb-10 shadow-sm shadow-gray-300 border border-gray-100 bg-white animate-fade-in [animation-delay:100ms]!">
        {loading ? (
          <div className="h-50 flex justify-center items-center">
            <p className="text-muted-foreground animate-pulse">Loading exam results...</p>
          </div>
        ) : error ? (
          <div className="h-50 flex justify-center items-center text-red-500">
            <p>{error}</p>
          </div>
        ) : results.length === 0 ? (
          <div className="h-50 flex justify-center items-center">
            <p className="text-muted-foreground">No exams taken yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500">
                  <th className="py-3 px-4">Exam Code</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Date Taken</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {results.map((item) => (
                  <tr key={item.result_id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-gray-800">{item.exam_code}</td>
                    <td className="py-3 px-4">{item.subject}</td>
                    <td className="py-3 px-4">{item.exam_title || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-600 font-medium">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold">
                      <span className={item.score >= 75 ? 'text-green-600' : 'text-red-600'}>
                        {item.score}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(item.exam_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedResult(item)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                      >
                        View Answers
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Answer Key Details Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedResult.exam_title || selectedResult.subject}
                </h3>
                <p className="text-xs text-gray-500">
                  Code: {selectedResult.exam_code} | Total Items: {selectedResult.number_of_items}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-extrabold text-indigo-600">
                  {selectedResult.score}%
                </span>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {formatAnswersComparison(selectedResult).map((item) => (
                  <div
                    key={item.question}
                    className={`p-3 border rounded-xl flex items-center justify-between ${
                      item.isCorrect
                        ? 'bg-green-50/50 border-green-200'
                        : 'bg-red-50/50 border-red-200'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold text-gray-500">
                        Item #{item.question}
                      </p>
                      <p className="text-xs font-bold mt-1 text-gray-800">
                        Your Ans: <span className="uppercase">{item.studentAnswer}</span>
                      </p>
                      {!item.isCorrect && (
                        <p className="text-xs text-green-700 font-medium">
                          Correct: {item.correctAnswer}
                        </p>
                      )}
                    </div>

                    <span
                      className={`text-sm font-bold ${
                        item.isCorrect ? 'text-green-600' : 'text-red-500'
                      }`}
                    >
                      {item.isCorrect ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 text-right">
              <button
                onClick={() => setSelectedResult(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default StudentResults