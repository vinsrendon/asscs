import { useRef, useState, useEffect } from 'react'

function TeacherScan(){  
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const resultCanvasRef = useRef(null)
    const resultContainerRef = useRef(null)

    const [stream, setStream] = useState(null)
    const intervalRef = useRef(null)
    const scannerRef = useRef(null)

    const stopCamera = () => {
        if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        }

        if (stream) {
        stream.getTracks().forEach((track) => track.stop())
        setStream(null)
        }

        if (videoRef.current) {
        videoRef.current.srcObject = null
        }

        // Clear canvases
        if (canvasRef.current) {
        canvasRef.current.width = 0
        canvasRef.current.height = 0
        }
        if (resultCanvasRef.current) {
        resultCanvasRef.current.width = 0
        resultCanvasRef.current.height = 0
        }

        // Clear extracted papers
        if (resultContainerRef.current) {
        resultContainerRef.current.replaceChildren()
        }
    }

    useEffect(() => {
        if (window.jscanify) {
        scannerRef.current = new window.jscanify()
        } else {
        console.error('jscanify is not loaded. Please include the library.')
        }

        return () => {
        stopCamera()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const startCamera = async () => {
        try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
            facingMode: 'environment', // prefer rear camera
            width: { ideal: 1280 },
            height: { ideal: 720 },
            },
            audio: false,
        })

        if (videoRef.current) {
            videoRef.current.srcObject = mediaStream
            setStream(mediaStream)

            videoRef.current.onloadedmetadata = () => {
            const video = videoRef.current
            const canvas = canvasRef.current
            const resultCanvas = resultCanvasRef.current

            const w = video.videoWidth
            const h = video.videoHeight

            canvas.width = w
            canvas.height = h
            resultCanvas.width = w
            resultCanvas.height = h

            video.play()

            // Continuous paper highlighting
            intervalRef.current = setInterval(() => {
                if (!scannerRef.current || !video || video.readyState < 2) return

                const canvasCtx = canvas.getContext('2d')
                const resultCtx = resultCanvas.getContext('2d')

                canvasCtx.drawImage(video, 0, 0, w, h)

                const highlighted = scannerRef.current.highlightPaper(canvas, {
                color: '#89CFF0',
                thickness: 5,
                })

                resultCtx.drawImage(highlighted, 0, 0, w, h)
            }, 30)
            }
        }
        } catch (err) {
        console.error('Camera error:', err)
        alert('Could not access camera. Please allow camera permissions.')
        }
    }    

    const capturePaper = () => {
        if (!videoRef.current || !scannerRef.current) return

        const video = videoRef.current
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = video.videoWidth
        tempCanvas.height = video.videoHeight

        const ctx = tempCanvas.getContext('2d')
        ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height)

        const dataURL = tempCanvas.toDataURL('image/jpeg', 0.9)

        const newImg = new Image()
        newImg.src = dataURL

        newImg.onload = () => {
        const extracted = scannerRef.current.extractPaper(
            newImg,
            video.videoWidth,
            video.videoHeight
        )
        // Clear previous results and show the new one
        if (resultContainerRef.current) {
            resultContainerRef.current.replaceChildren()
            resultContainerRef.current.appendChild(extracted)
        }
        }
    }


  
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
                            <button onClick={startCamera} className='font-bold text-2xl leading-none bg-yellow-300 p-1 rounded-md'>Start</button>
                            <button onClick={stopCamera} className='font-bold text-2xl leading-none bg-red-300 p-1 rounded-md'>Stop</button>
                            <button onClick={capturePaper} className='font-bold text-2xl leading-none bg-green-300 p-1 rounded-md'>Capture</button>
                        </div>
                    </div> 
                    <div className='text-white p-2 text-lg md:text-2xl text-center rounded-2xl flex flex-row justify-around gap-4 h-fit md:h-full'>
                        {/* <div className="flex flex-col justify-center items-center w-full bg-blue-50 rounded-2xl py-5">
                            
                        </div> */}
                        <div className="relative w-full bg-blue-50 rounded-2xl overflow-hidden">
                            {/* Hidden video element */}
                            <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="absolute inset-0 w-full h-full object-cover opacity-0"
                            />

                            {/* Live highlighted paper view */}
                            <canvas
                            ref={resultCanvasRef}
                            className="w-full h-full object-contain"
                            />

                            {/* Hidden working canvas */}
                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                    </div>    
                </div>
                <div className="flex flex-col w-1/3 gap-3 p-5 rounded-2xl shadow-sm shadow-gray-300 max-lg:w-full">                       
                    <div>
                        <h1 className='font-bold text-2xl leading-none'>Scan Results</h1>
                    </div> 
                    <div className='text-white p-2 text-lg md:text-2xl text-center rounded-2xl flex flex-row justify-around gap-4 h-fit md:h-full'>
                        <div ref={resultContainerRef} className="[&>canvas]:w-full flex flex-col justify-center items-center bg-blue-50 rounded-2xl py-5">
                            
                        </div>
                    </div>    
                </div>
            </div> 
        </>
    )
}

export default TeacherScan