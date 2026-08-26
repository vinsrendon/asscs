function TeacherScan(){    
    return(
        <>
            <div className='max-md:mt-10 mx-2 md:mx-6'>
                <div>
                <h2 className='text-2xl font-bold'>Scan Answer Sheet</h2>
                <p className='text-muted-foreground'>
                    Place the document under the camera and initialize scan.
                </p>
                </div>
            </div> 
            <div className='my-6 mx-2 md:mx-6 rounded-2xl flex justify-around gap-4 h-1/2 max-lg:flex-wrap'>
                <div className="flex flex-col flex-1 gap-3 p-5 rounded-2xl shadow-sm shadow-gray-300 max-lg:w-full">                       
                    <div className="flex gap-2 max-md:flex-col justify-between">
                        <h1 className='font-bold text-2xl leading-none'>Camera</h1>
                        <div className="flex justify-around gap-1">
                            <h1 className='font-bold text-2xl leading-none bg-yellow-300 p-1 rounded-md'>Start</h1>
                            <h1 className='font-bold text-2xl leading-none bg-red-300 p-1 rounded-md'>Stop</h1>
                            <h1 className='font-bold text-2xl leading-none bg-green-300 p-1 rounded-md'>Capture</h1>
                        </div>
                    </div> 
                    <div className='text-white p-2 text-lg md:text-2xl text-center rounded-2xl flex flex-row justify-around gap-4 h-full'>
                        <div className="flex flex-col justify-center items-center w-full bg-blue-50 rounded-2xl py-5">
                            
                        </div>
                    </div>    
                </div>
                <div className="flex flex-col w-1/3 gap-3 p-5 rounded-2xl shadow-sm shadow-gray-300 max-lg:w-full">                       
                    <div>
                        <h1 className='font-bold text-2xl leading-none'>Scan Results</h1>
                    </div> 
                    <div className='text-white p-2 text-lg md:text-2xl text-center rounded-2xl flex flex-row justify-around gap-4 h-full'>
                        <div className="flex flex-col justify-center items-center w-full bg-blue-50 rounded-2xl py-5">
                            
                        </div>
                    </div>    
                </div>
            </div> 
        </>
    )
}

export default TeacherScan