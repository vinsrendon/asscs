function TeacherResult(){    
    return(
        <>
            <div className='flex justify-between mx-2 md:mx-6 max-md:mt-10 max-sm:flex-col-reverse'>
                <div>
                    <h2 className='text-2xl font-bold'>Exam Results</h2>
                    <p className='text-muted-foreground'>Review all scanned sheet results and scores.</p>
                </div>
                <div className="self-end">
                    <button className='flex items-center px-3 py-2 rounded-2xl font-semibold shadow-sm shadow-gray-300 text-muted-foreground hover:bg-gray-100'>
                        <svg className="fill-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24"  
                        fill="none" viewBox="0 0 24 24" >
                        <path d="m10.04 11.29-3.2 3.21 3.2 3.21 1.42-1.42-1.8-1.79 1.8-1.79zm2.5 1.42 1.8 1.79-1.8 1.79 1.42 1.42 3.2-3.21-3.2-3.21z"></path><path d="m19.94 7.68-.03-.09a.8.8 0 0 0-.2-.29l-5-5c-.09-.09-.19-.15-.29-.2l-.09-.03a.8.8 0 0 0-.26-.05c-.02 0-.04-.01-.06-.01H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-12s-.01-.04-.01-.06c0-.09-.02-.17-.05-.26ZM6 20V4h7v4c0 .55.45 1 1 1h4v11z"></path>
                        </svg>
                        Export CSV
                    </button>
                </div>
            </div>
            <div className="mt-5 w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                    <tr>
                        <th className="px-6 py-4 font-semibold text-center">STUDENT</th>
                        <th className="px-6 py-4 font-semibold text-center">EXAM</th>
                        <th className="px-6 py-4 font-semibold text-center">SCORE</th>
                        <th className="px-6 py-4 font-semibold text-center">PERCENTAGE</th>
                        <th className="px-6 py-4 font-semibold text-center">DATE SCANNED</th>
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
                    </tr>
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default TeacherResult