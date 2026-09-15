function TeacherAnswerKeys(){    
    return(
        <>
            <div className='flex justify-between mx-2 md:mx-6 max-md:mt-10'>
                <div>
                <h2 className='text-2xl font-bold'>Answer Keys</h2>
                <p className='text-muted-foreground'>Manage exam master sheets and configurations.</p>
                </div>
                <div>
                    <button className='px-3 py-2 text-white rounded-2xl bg-blue-500 hover:bg-blue-400 font-semibold'>+ Upload Answer Key</button>
                </div>
            </div>
            <div className="mt-5 w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                    <tr>
                        <th className="px-6 py-4 font-extrabold text-center">EXAM TITLE</th>
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