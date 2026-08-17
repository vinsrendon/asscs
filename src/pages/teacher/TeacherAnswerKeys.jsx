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
        </>
    )
}

export default TeacherAnswerKeys