function StudentResults(){    
    return(
        <>
            <div className='max-md:mt-10'>
                <div>
                <h2 className='text-2xl font-bold'>My Results</h2>
                <p className='text-muted-foreground'>
                    Detailed history of all your scanned exam sheets.
                </p>
                </div>
            </div>   
            <div className="mt-5 p-5 rounded-2xl mb-10 shadow-sm shadow-gray-300">  
                <div>
                    <div className="h-50 flex justify-center items-center">                        
                        <p className="text-muted-foreground">No exams taken yet.</p>
                    </div>
                </div>     
            </div>
        </>
    )
}

export default StudentResults