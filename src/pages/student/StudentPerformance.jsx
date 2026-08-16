function StudentPerformance(){    
    return(
        <>
            <div className='max-md:mt-10'>
                <div>
                <h2 className='text-2xl font-bold'>Performance Analytics</h2>
                <p className='text-muted-foreground'>
                    Visualize your strengths and areas for improvement.
                </p>
                </div>
            </div> 
            <div className='mt-6 rounded-lg flex justify-around flex-wrap gap-4'>
                <div className="flex md:flex-1 max-md:w-full items-center gap-3 p-5 rounded-2xl mb-10 shadow-sm shadow-gray-300">  
                    <div>
                        <h1 className='font-bold text-2xl leading-none'>Subject Strengths (Latest Exam)</h1>
                        <div className="h-50"></div>
                    </div>     
                </div>
                <div className="flex md:flex-1 max-md:w-full items-center gap-3 p-5 rounded-2xl mb-10 shadow-sm shadow-gray-300">
                    <div>
                        <h1 className='font-bold text-2xl leading-none'>Overall Grade Trend</h1>
                        <div className="h-50"></div>
                    </div>     
                </div>
            </div>
        </>
    )
}

export default StudentPerformance