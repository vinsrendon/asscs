import { useRef, useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { PaddleOcrService } from 'ppu-paddle-ocr/web'


function TeacherScan(){  
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const resultCanvasRef = useRef(null)
    const fileInputRef = useRef(null)
    const [showResultImage, setShowResultImage] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isCameraOn, setIsCameraOn] = useState(false)
    const [answers, setAnswers] = useState([])

    const ocrRef = useRef(null)
    // eslint-disable-next-line no-unused-vars
    const [isOcrReady, setIsOcrReady] = useState(false)    

    const intervalRef = useRef(null)
    const scannerRef = useRef(null)
    const resultImageRef = useRef(null)

    const stopCamera = () => {
        setIsCameraOn(false)
        setIsUploading(false)
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null
        }

        if (canvasRef.current) {
            canvasRef.current.width = 0
            canvasRef.current.height = 0
        }

        if (resultCanvasRef.current) {
            resultCanvasRef.current.width = 0
            resultCanvasRef.current.height = 0
        }

        if (resultImageRef.current) {
            resultImageRef.current.srcObject = null
        }
    }

    const clearResult = () => {
        setIsCameraOn(false)
        setIsUploading(false)
        setAnswers([])
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null
        }

        if (canvasRef.current) {
            canvasRef.current.width = 0
            canvasRef.current.height = 0
        }

        if (resultCanvasRef.current) {
            resultCanvasRef.current.width = 0
            resultCanvasRef.current.height = 0
        }

        if (resultImageRef.current) {
            resultImageRef.current.srcObject = null
            setShowResultImage(false)
        }
    }

    useEffect(() => {
        if (window.jscanify) {
        scannerRef.current = new window.jscanify()
        } else {
            console.error('jscanify is not loaded')
        }

        const ocr = new PaddleOcrService()
        ocr.initialize()
            .then(() => {
                ocrRef.current = ocr
                setIsOcrReady(true)
            })
            .catch((err) => console.error('PaddleOCR failed to initialize:', err))

        return () => {
            stopCamera()
            if (ocrRef.current) {
                ocrRef.current.destroy()
            }
        }
    }, [])

    const startCamera = async () => {
        setIsCameraOn(true)
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 },
                },
                audio: false,
            })

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream

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
        } 
        catch (err) {
            setIsCameraOn(false)
            console.error('Camera error:', err)
            Swal.fire({
                text:"Could not access camera. Please allow camera permissions.",
                icon:"error"
            }); 
        }
    }    

    const uploadImage = (e) => {        
        const file = e.target.files?.[0]
        if (!file || !scannerRef.current) return

        setIsUploading(true)

        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
        if (resultCanvasRef.current) {
            resultCanvasRef.current.width = 0
            resultCanvasRef.current.height = 0
        }
        
        const reader = new FileReader()
        reader.onload = (event) => {            
            const img = new Image()
            img.onload = () => {
                processShadedSheet(img)
                setIsUploading(false)
            }
            img.onerror = () => {
                setIsUploading(false)
                Swal.fire({
                    text:"Failed to load the selected image.",
                    icon:"error"
                }); 
            }
            img.src = event.target.result
        }
        reader.onerror = () => {
            setIsUploading(false)
            Swal.fire({
                text:"Failed to read the file.",
                icon:"error"
            }); 
        }
        reader.readAsDataURL(file)        
    }

    const capturePaper = () => {
        setIsCameraOn(false)
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

            if (extracted) {
                processShadedSheet(extracted)
            }
        }

        if (resultCanvasRef.current) {
            resultCanvasRef.current.width = 0
            resultCanvasRef.current.height = 0
        }
    }

    const extractStudentIdNumber = async (src, cv) => {
        if (!ocrRef.current) {
            console.warn("PaddleOCR service is not initialized yet.")
            return ""
        }

        const gray = new cv.Mat()
        const thresh = new cv.Mat()
        
        // 1. Convert to Grayscale & Adaptive Threshold to locate ID bounding box
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY)
        cv.adaptiveThreshold(
            gray,
            thresh,
            255,
            cv.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv.THRESH_BINARY_INV,
            15,
            8
        )

        const contours = new cv.MatVector()
        const hierarchy = new cv.Mat()
        cv.findContours(thresh, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)

        let topRect = null
        const maxYThreshold = src.rows * 0.35 // Look within the top 35% of the paper

        for (let i = 0; i < contours.size(); i++) {
            const rect = cv.boundingRect(contours.get(i))
            const aspect = rect.width / rect.height

            if (rect.y < maxYThreshold && rect.width > 80 && rect.height > 20 && aspect > 1.8) {
                if (!topRect || rect.width > topRect.width) {
                    topRect = rect
                }
            }
        }

        thresh.delete()
        contours.delete()
        hierarchy.delete()

        let croppedMat
        if (topRect) {
            const rect = new cv.Rect(topRect.x, topRect.y, topRect.width, topRect.height)
            croppedMat = src.roi(rect)
        } else {
            // Fallback: Default crop top 20% area
            const fallbackRect = new cv.Rect(0, 0, src.cols, Math.floor(src.rows * 0.20))
            croppedMat = src.roi(fallbackRect)
        }

        // 2. Prepare canvas for PaddleOCR
        const cropCanvas = document.createElement('canvas')
        const scaleFactor = 2 
        cropCanvas.width = croppedMat.cols * scaleFactor
        cropCanvas.height = croppedMat.rows * scaleFactor

        const tempCanvas = document.createElement('canvas')
        cv.imshow(tempCanvas, croppedMat)
        
        const ctx = cropCanvas.getContext('2d')
        ctx.imageSmoothingEnabled = true
        ctx.drawImage(tempCanvas, 0, 0, cropCanvas.width, cropCanvas.height)

        gray.delete()
        croppedMat.delete()

        // 3. Perform local OCR using PaddleOCR
        try {
            const ocrResult = await ocrRef.current.recognize(cropCanvas)
            const rawText = ocrResult?.text || ""
            
            return rawText.replace(/\D/g, '') // Strip non-digits
        } catch (err) {
            console.error("PaddleOCR Extraction Error:", err)
            return ""
        }
    }

    const processShadedSheet = async(extractedCanvas) => {
        const cv = window.cv
        if (!cv || !extractedCanvas) {
            Swal.fire({
                text:"OpenCV not ready or no canvas",
                icon:"error"
            }); 
            return
        }

        const src = cv.imread(extractedCanvas)

        // Extract Student ID
        const studentId = await extractStudentIdNumber(src, cv)
        console.log("Extracted Student ID:", studentId)

        const display = src.clone()
        const gray = new cv.Mat()
        const blurred = new cv.Mat()
        const thresh = new cv.Mat()

        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY)
        cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0)

        cv.adaptiveThreshold(
            blurred,
            thresh,
            255,
            cv.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv.THRESH_BINARY_INV,
            15,
            8
        )

        const contours = new cv.MatVector()
        const hierarchy = new cv.Mat()
        cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

        const candidates = []
        for (let i = 0; i < contours.size(); i++) {
            const c = contours.get(i)
            const rect = cv.boundingRect(c)
            const area = cv.contourArea(c)
            const aspect = rect.width / (rect.height || 1)

            if (
            rect.width >= 10 && rect.height >= 10 &&
            aspect > 0.55 && aspect < 1.8 &&
            area > 80
            ) {
            candidates.push({
                contour: c,
                x: rect.x + rect.width / 2,
                y: rect.y + rect.height / 2,
                rect,
                area,
                size: (rect.width + rect.height) / 2
            })
            }
        }

        if (candidates.length < 10) {
            Swal.fire({
                text:"Too few candidates found",
                icon:"warning"
            }); 
            return
        }

        const sizes = candidates.map(c => c.size).sort((a, b) => a - b)
        const medianSize = sizes[Math.floor(sizes.length / 2)]

        const areas = candidates.map(c => c.area).sort((a, b) => a - b)
        const medianArea = areas[Math.floor(areas.length / 2)]

        const MIN_SIZE = medianSize * 0.55
        const MAX_SIZE = medianSize * 1.55
        const MIN_AREA = medianArea * 0.40
        const MAX_AREA = medianArea * 2.20

        const bubbles = candidates.filter(c =>
            c.size >= MIN_SIZE &&
            c.size <= MAX_SIZE &&
            c.area >= MIN_AREA &&
            c.area <= MAX_AREA &&
            (c.rect.width / c.rect.height) > 0.70 &&
            (c.rect.width / c.rect.height) < 1.40
        )

        const sortedByX = [...bubbles].sort((a, b) => a.x - b.x)

        const xGaps = []

        for (let i = 1; i < sortedByX.length; i++) {
            xGaps.push({
                gap: sortedByX[i].x - sortedByX[i - 1].x,
                index: i
            })
        }

        const columnGap = medianSize * 5

        const splitPoints = xGaps
            .filter(g => g.gap > columnGap)
            .map(g => g.index)

        const columns = []

        let start = 0

        for (const split of splitPoints) {
            const column = sortedByX
                .slice(start, split)
                .sort((a, b) => a.y - b.y)

            if (column.length >= 4) {
                columns.push(column)
            }

            start = split
        }

        const lastColumn = sortedByX
            .slice(start)
            .sort((a, b) => a.y - b.y)

        if (lastColumn.length >= 4) {
            columns.push(lastColumn)
        }

        columns.sort((a, b) => {
            const ax = a.reduce((sum, bubble) => sum + bubble.x, 0) / a.length
            const bx = b.reduce((sum, bubble) => sum + bubble.x, 0) / b.length

            return ax - bx
        })

        const processColumn = (columnBubbles, startQ = 1) => {
            const OPTIONS = 4
            const labels = ['A', 'B', 'C', 'D']
            const results = []
            const green = new cv.Scalar(0, 255, 0, 255)
            const red   = new cv.Scalar(0, 0, 255, 255)
            const blue  = new cv.Scalar(255, 120, 0, 255)

            for (let i = 0; i < columnBubbles.length; i += OPTIONS) {
            const group = columnBubbles.slice(i, i + OPTIONS)
            if (group.length < OPTIONS) break

            const avgY = group.reduce((s, b) => s + b.y, 0) / group.length
            if (!group.every(b => Math.abs(b.y - avgY) < medianSize * 1.1)) continue

            group.sort((a, b) => a.x - b.x)

            const fills = []

            group.forEach((bubble) => {
                const mask = cv.Mat.zeros(gray.rows, gray.cols, cv.CV_8UC1)
                const cntVec = new cv.MatVector()
                cntVec.push_back(bubble.contour)
                cv.drawContours(mask, cntVec, -1, new cv.Scalar(255), -1)

                const mean = cv.mean(gray, mask)[0]
                fills.push(mean)

                const r = bubble.rect
                cv.rectangle(display,
                new cv.Point(r.x, r.y),
                new cv.Point(r.x + r.width, r.y + r.height),
                green, 2)

                cv.putText(display, Math.round(mean).toString(),
                new cv.Point(r.x, r.y - 4),
                cv.FONT_HERSHEY_SIMPLEX, 0.38, blue, 1)

                mask.delete()
                cntVec.delete()
            })

            const minDark = Math.min(...fills)
            const secondDark = [...fills].sort((a, b) => a - b)[1]
            const avgDark = fills.reduce((a, b) => a + b, 0) / fills.length
            const selected = fills.indexOf(minDark)

            const isClear = minDark < avgDark * 0.82 && minDark < secondDark - 12

            const answer = isClear ? labels[selected] : '?'
            const qNum = startQ + results.length

            results.push({ question: qNum, answer, fills })

            if (isClear) {
                const r = group[selected].rect
                cv.rectangle(display,
                new cv.Point(r.x - 3, r.y - 3),
                new cv.Point(r.x + r.width + 3, r.y + r.height + 3),
                red, 3)
            }

            const first = group[0].rect
            cv.putText(display, `Q${qNum}:${answer}`,
                new cv.Point(Math.max(4, first.x - 80), first.y + first.height / 2 + 5),
                cv.FONT_HERSHEY_SIMPLEX, 0.48,
                isClear ? green : red, 2)
            }
            return results
        }

        const allResults = []

        let questionNumber = 1

        for (const column of columns) {
            const results = processColumn(column, questionNumber)

            allResults.push(...results)

            questionNumber += results.length
        }   

        const debugCanvas = document.createElement('canvas')
        cv.imshow(debugCanvas, display)

        const imageSrc = debugCanvas.toDataURL('image/png')

        if (resultImageRef.current) {
            resultImageRef.current.src = imageSrc
            setShowResultImage(true)
        }

        src.delete()
        display.delete()
        gray.delete()
        blurred.delete()
        thresh.delete()
        contours.delete()
        hierarchy.delete()

        setAnswers(allResults)

        return allResults
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
            <div className='my-6 mx-2 md:mx-6 rounded-2xl flex justify-around gap-4 h-fit max-xl:flex-wrap'>
                <div className="flex flex-col flex-1 gap-3 p-5 rounded-2xl h-full shadow-sm shadow-gray-300 max-lg:w-full">                       
                    <div className="flex gap-2 max-md:flex-col justify-between">
                        <h1 className='font-bold text-2xl leading-none'>Camera</h1>                        
                    </div> 
                    <div className="flex justify-center gap-2 flex-wrap">
                        <button onClick={startCamera} className='cursor-pointer font-bold text-2xl leading-none bg-yellow-300 hover:bg-yellow-400 p-1 rounded-md'>Start</button>
                        <button onClick={stopCamera} className='cursor-pointer font-bold text-2xl leading-none bg-red-300 hover:bg-red-400 p-1 rounded-md'>Stop</button>
                        <button onClick={capturePaper} className='cursor-pointer font-bold text-2xl leading-none bg-green-300 hover:bg-green-400 p-1 rounded-md'>Capture</button>
                        <button 
                            onClick={() => fileInputRef.current?.click()} 
                            className='cursor-pointer font-bold text-2xl leading-none bg-blue-300 hover:bg-blue-400 p-1 rounded-md'
                        >
                            {isUploading ? 'Uploading...' : 'Upload'}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={uploadImage}
                            className="hidden"
                        />
                    </div>
                    <div className='text-white p-2 text-lg md:text-2xl text-center rounded-2xl flex flex-row justify-around gap-4 h-fit md:h-full'>
                        <div className="relative w-full rounded-2xl overflow-hidden">
                            <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-0"/>

                            <canvas ref={resultCanvasRef} className={`${isCameraOn ? 'w-full h-full': 'w-0 h-0'} object-contain`} />

                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                    </div>    
                </div>
            </div>
            <div className='my-6 mx-2 md:mx-6 rounded-2xl flex justify-around gap-4 h-fit max-xl:flex-wrap'>
                <div className="flex flex-col w-full gap-3 p-5 rounded-2xl shadow-sm shadow-gray-300 max-lg:w-full">                       
                    <div>
                        <h1 className='font-bold text-2xl leading-none'>Scan Results</h1>
                        <div className="flex justify-around gap-1">
                            <button onClick={clearResult} className='cursor-pointer font-bold text-2xl leading-none bg-yellow-300 hover:bg-yellow-400 p-1 rounded-md'>Clear</button>
                        </div>
                    </div> 
                    <div className='text-white p-2 text-lg md:text-2xl text-center rounded-2xl flex md:flex-row flex-wrap justify-around gap-4 h-fit md:h-full'>                        
                        <div className={`justify-center items-center bg-blue-50 rounded-2xl py-5 w-full ${showResultImage ? 'flex':'hidden'}`}>
                            {answers.length > 0 ? (
                                <div className="w-full overflow-auto max-h-125">
                                    <table className="w-full border-collapse text-gray-800">
                                        <thead className="sticky top-0 bg-blue-200">
                                            <tr>
                                                <th className="border border-gray-300 px-4 py-2 text-center">
                                                    Question
                                                </th>
                                                <th className="border border-gray-300 px-4 py-2 text-center">
                                                    Answer
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {answers.map((item) => (
                                                <tr
                                                    key={item.question}
                                                    className="hover:bg-blue-100"
                                                >
                                                    <td className="border border-gray-300 px-4 py-2">
                                                        {item.question}
                                                    </td>

                                                    <td className={`border border-gray-300 px-4 py-2 font-bold ${
                                                        item.answer === '?'
                                                            ? 'text-red-500'
                                                            : 'text-green-600'
                                                    }`}>
                                                        {item.answer}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className={`flex items-center justify-center h-full text-gray-500 ${showResultImage ? 'block object-contain':'hidden object-contain'}`}>
                                    No answers detected
                                </div>
                            )}
                        </div>
                        <div className={`justify-center items-center bg-blue-50 rounded-2xl py-5 w-full ${showResultImage ? 'flex':'hidden'}`}>
                            <img ref={resultImageRef} alt="scanned page result"  
                            onClick={() => {
                                if (resultImageRef.current?.src) {
                                    window.open(resultImageRef.current.src, '_blank')
                                }
                            }}
                            className={`w-full h-full ${showResultImage ? 'block object-contain cursor-pointer':'hidden object-contain'}`} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default TeacherScan