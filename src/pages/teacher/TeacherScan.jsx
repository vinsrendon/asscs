import { useRef, useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { PaddleOcrService } from 'ppu-paddle-ocr/web'
// import axios from '../../../axios-config'


function TeacherScan(){  
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const resultCanvasRef = useRef(null)
    const fileInputRef = useRef(null)
    const [showResultImage, setShowResultImage] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isCameraOn, setIsCameraOn] = useState(false)
    const [answers, setAnswers] = useState([])
    const [examId, setExamId] = useState('')
    const [studentId, setStudentId] = useState('')

    const [isEditing, setIsEditing] = useState(false)
    const [editExamId, setEditExamId] = useState('')
    const [editStudentId, setEditStudentId] = useState('')
    const [editAnswers, setEditAnswers] = useState([])
    const [numQuestions, setNumQuestions] = useState('')

    // const [isChecking, setIsChecking] = useState(false)
    const [checkResult, setCheckResult] = useState(null)

    const ocrRef = useRef(null)

    const intervalRef = useRef(null)
    const scannerRef = useRef(null)
    const resultImageRef = useRef(null)

    const stopMediaStream = (stream) => {
    if (stream) {
        stream.getTracks().forEach(track => {
        track.stop()
        })
    }
    }

    const stopCamera = () => {
        setIsCameraOn(false)
        setIsUploading(false)
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }

        if (videoRef.current?.srcObject) {
            stopMediaStream(videoRef.current.srcObject)
            videoRef.current.srcObject = null
        }

        if (videoRef.current) {
            videoRef.current.pause()
            videoRef.current.removeAttribute('src')
            videoRef.current.load()
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
            if (resultImageRef.current.src?.startsWith('blob:')) {
            URL.revokeObjectURL(resultImageRef.current.src)
            }
            resultImageRef.current.src = ''
            resultImageRef.current.removeAttribute('src')
            setShowResultImage(false)
        }
    }

    const clearResult = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }

        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop())
            videoRef.current.srcObject = null
        }
        if (videoRef.current) {
            videoRef.current.pause()
            videoRef.current.removeAttribute('src')
            videoRef.current.load()
        }

        ;[canvasRef, resultCanvasRef].forEach(ref => {
            if (ref.current) {
            const ctx = ref.current.getContext('2d')
            if (ctx) ctx.clearRect(0, 0, ref.current.width, ref.current.height)
            ref.current.width = 0
            ref.current.height = 0
            }
        })

        if (resultImageRef.current) {
            if (resultImageRef.current.src?.startsWith('blob:')) {
            URL.revokeObjectURL(resultImageRef.current.src)
            }
            resultImageRef.current.src = ''
            resultImageRef.current.removeAttribute('src')
        }

        setExamId('')
        setStudentId('')
        setAnswers([])
        setShowResultImage(false)
        setIsUploading(false)
        setIsCameraOn(false)
        setCheckResult(null)

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }

        //force a GC hint (Chrome only)
        if (window.gc) window.gc()
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
            })
            .catch((err) => console.error('PaddleOCR failed to initialize:', err))

        return () => {
            stopCamera()
            if (ocrRef.current) {
                ocrRef.current.destroy()
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const extractHeaderData = async (src, cv) => {
        if (!ocrRef.current) {
            console.warn("PaddleOCR service is not initialized yet.")
            return { examId: "", studentId: "" }
        }

        const gray = new cv.Mat()
        const thresh = new cv.Mat()

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

        const boundingBoxes = []
        const maxYThreshold = src.rows * 0.35 // Restrict to top 35% of paper

        for (let i = 0; i < contours.size(); i++) {
            const rect = cv.boundingRect(contours.get(i))
            const aspect = rect.width / rect.height

            // Filter for input box outlines
            if (rect.y < maxYThreshold && rect.width > 120 && rect.height > 20 && aspect > 1.8) {
                boundingBoxes.push(rect)
            }
        }

        // Sort bounding boxes vertically (top to bottom: EXAM ID is first, STUDENT ID is second)
        boundingBoxes.sort((a, b) => a.y - b.y)

        // Deduplicate overlapping bounding boxes
        const filteredBoxes = boundingBoxes.filter((box, idx, self) => 
            idx === 0 || Math.abs(box.y - self[idx - 1].y) > 15
        )

        const runOcrOnRegion = async (rect) => {
            const roi = src.roi(rect)
            const cropCanvas = document.createElement('canvas')
            const scaleFactor = 2 

            cropCanvas.width = roi.cols * scaleFactor
            cropCanvas.height = roi.rows * scaleFactor

            const tempCanvas = document.createElement('canvas')
            cv.imshow(tempCanvas, roi)

            const ctx = cropCanvas.getContext('2d')
            ctx.imageSmoothingEnabled = true
            ctx.drawImage(tempCanvas, 0, 0, cropCanvas.width, cropCanvas.height)

            roi.delete()

            try {
                const ocrResult = await ocrRef.current.recognize(cropCanvas)
                return ocrResult?.text?.trim() || ""
            } catch (err) {
                console.error("PaddleOCR Region Error:", err)
                return ""
            }
        }

        let extractedExamId = ""
        let extractedStudentId = ""

        if (filteredBoxes.length >= 2) {
            // Box 0 = EXAM ID, Box 1 = STUDENT ID
            const rawExam = await runOcrOnRegion(new cv.Rect(filteredBoxes[0].x, filteredBoxes[0].y, filteredBoxes[0].width, filteredBoxes[0].height))
            const rawStudent = await runOcrOnRegion(new cv.Rect(filteredBoxes[1].x, filteredBoxes[1].y, filteredBoxes[1].width, filteredBoxes[1].height))

            extractedExamId = rawExam
            extractedStudentId = rawStudent.replace(/\D/g, '') // Keep digits only for Student ID
        } else if (filteredBoxes.length === 1) {
            // Fallback if only 1 box is detected: treat as Student ID
            const rawStudent = await runOcrOnRegion(new cv.Rect(filteredBoxes[0].x, filteredBoxes[0].y, filteredBoxes[0].width, filteredBoxes[0].height))
            extractedStudentId = rawStudent.replace(/\D/g, '')
        }

        gray.delete()
        thresh.delete()
        contours.delete()
        hierarchy.delete()

        return { examId: extractedExamId, studentId: extractedStudentId }
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

        let src, display, gray, blurred, thresh, contours, hierarchy

        try {
            src = cv.imread(extractedCanvas)

            // Extract Exam ID and Student ID
            const { examId: parsedExamId, studentId: parsedStudentId } = await extractHeaderData(src, cv)

            setExamId(parsedExamId)
            setStudentId(parsedStudentId)

            display = src.clone()
            gray = new cv.Mat()
            blurred = new cv.Mat()
            thresh = new cv.Mat()

            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY)
            cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0)

            cv.adaptiveThreshold(
                blurred,
                thresh,
                255,
                cv.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv.THRESH_BINARY_INV,
                11,
                6
            )

            contours = new cv.MatVector()
            hierarchy = new cv.Mat()
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
                })
                return
            }

            const sizes = candidates.map(c => c.size).sort((a, b) => a - b)
            const medianSize = sizes[Math.floor(sizes.length / 2)]

            const areas = candidates.map(c => c.area).sort((a, b) => a - b)
            const medianArea = areas[Math.floor(areas.length / 2)]
            
            const MIN_SIZE = medianSize * 0.55
            const MAX_SIZE = medianSize * 1.45
            const MIN_AREA = medianArea * 0.50
            const MAX_AREA = medianArea * 1.80

            const bubbles = candidates.filter(c => {
                const ar = c.rect.width / c.rect.height
                return (
                    c.size >= MIN_SIZE && c.size <= MAX_SIZE &&
                    c.area >= MIN_AREA && c.area <= MAX_AREA &&
                    ar > 0.75 && ar < 1.30 &&                 // tighter circle
                    c.rect.width  >= medianSize * 0.6 &&
                    c.rect.height >= medianSize * 0.6
                )
            })

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

            debugCanvas.toBlob((blob) => {
            if (!blob || !resultImageRef.current) return

            // Revoke previous URL if exists
            if (resultImageRef.current.src?.startsWith('blob:')) {
                URL.revokeObjectURL(resultImageRef.current.src)
            }

            const url = URL.createObjectURL(blob)
            resultImageRef.current.src = url
            setShowResultImage(true)
            }, 'image/png', 0.92)

            setAnswers(allResults)
            setEditExamId(parsedExamId || '')
            setEditStudentId(parsedStudentId || '')
            setEditAnswers(allResults.map(a => ({ ...a })))
            setNumQuestions(allResults.length.toString())
            setIsEditing(false)
        } catch (err) {
            console.error('processShadedSheet error:', err)
            Swal.fire({ 
                text: 'Processing failed', 
                icon: 'error' 
            })
        }finally{
            src?.delete()
            display?.delete()
            gray?.delete()
            blurred?.delete()
            thresh?.delete()
            contours?.delete()
            hierarchy?.delete()
        }        
    }

    // const startEditing = () => {
    //     setEditExamId(examId)
    //     setEditStudentId(studentId)
    //     setEditAnswers(answers.map(a => ({ ...a })))
    //     setNumQuestions(answers.length.toString())
    //     setIsEditing(true)
    // }

    // const cancelEditing = () => {
    //     setIsEditing(false)
    // }

    // const applyCorrections = () => {
    //     setExamId(editExamId.trim())
    //     setStudentId(editStudentId.trim())
    //     setAnswers(editAnswers)
    //     setIsEditing(false)

    //     Swal.fire({
    //         icon: 'success',
    //         title: 'Corrections applied',
    //         timer: 1500,
    //         showConfirmButton: false
    //     })
    // }

    const updateAnswer = (questionNumber, newAnswer) => {
        setEditAnswers(prev =>
            prev.map(item =>
            item.question === questionNumber
                ? { ...item, answer: newAnswer }
                : item
            )
        )
    }

    const applyNumQuestions = () => {
        const n = parseInt(numQuestions, 10)
        if (isNaN(n) || n < 1) return

        setEditAnswers(prev => {
            const current = [...prev]
            if (current.length < n) {
            for (let i = current.length + 1; i <= n; i++) {
                current.push({ question: i, answer: '?', fills: [] })
            }
            } else if (current.length > n) {
            return current.slice(0, n)
            }
            return current
        })
    }

    // const checkAnswers = async () => {
    //     if (!examId || !studentId || answers.length === 0) {
    //         Swal.fire({
    //         text: 'Exam ID, Student ID and answers are required',
    //         icon: 'warning'
    //         })
    //         return
    //     }

    //     setIsChecking(true)
    //     setCheckResult(null)

    //     try {
    //         const res = await axios.post('/exam/check', {
    //             examCode: examId.trim(),
    //             studentId: studentId.trim(),
    //             studentAnswers: answers
    //         })

    //         setCheckResult(res.data.result)

    //         Swal.fire({
    //         title: `Score: ${res.data.result.score}%`,
    //         html: `
    //             <p><b>${res.data.result.correct}</b> correct out of <b>${res.data.result.total}</b></p>
    //             <p>${res.data.result.exam.title}</p>
    //             <p class="text-sm text-gray-500 mt-2">Result saved successfully</p>
    //         `,
    //         icon: res.data.result.score >= 75 ? 'success' : 'info'
    //         })
    //     } catch (err) {
    //         console.error(err)
    //         Swal.fire({
    //         text: err.response?.data?.message || 'Failed to check answers',
    //         icon: 'error'
    //         })
    //     } finally {
    //         setIsChecking(false)
    //     }
    // }
  
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
                        <button onClick={startCamera} className='cursor-pointer font-bold text-2xl leading-none bg-yellow-300 hover:bg-yellow-400 p-2 rounded-xl hover:rounded-sm duration-200 transition-all animate-fade-in [animation-delay:0ms]!'>Start</button>
                        <button onClick={stopCamera} className='cursor-pointer font-bold text-2xl leading-none bg-red-300 hover:bg-red-400 p-2 rounded-xl hover:rounded-sm duration-200 transition-all animate-fade-in [animation-delay:100ms]!'>Stop</button>
                        <button onClick={capturePaper} className='cursor-pointer font-bold text-2xl leading-none bg-green-300 hover:bg-green-400 p-2 rounded-xl hover:rounded-sm duration-200 transition-all animate-fade-in [animation-delay:200ms]!'>Capture</button>
                        <button 
                            onClick={() => fileInputRef.current?.click()} 
                            className='cursor-pointer font-bold text-2xl leading-none bg-blue-300 hover:bg-blue-400 p-1 rounded-xl hover:rounded-sm duration-200 transition-all animate-fade-in [animation-delay:300ms]!'
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
                            <button onClick={clearResult} className='cursor-pointer font-bold text-2xl leading-none bg-yellow-300 hover:bg-yellow-400 p-2 rounded-xl hover:rounded-sm duration-200 transition-all animate-fade-in'>Clear</button>
                            {/* {!isEditing ? (
                                <button
                                    onClick={startEditing}
                                    disabled={answers.length === 0 && !examId && !studentId}
                                    className='cursor-pointer font-bold text-lg bg-blue-300 hover:bg-blue-400 px-3 py-1 rounded-md disabled:opacity-50'
                                >
                                    Correct / Edit
                                </button>
                            ) : (
                                <>
                                    <button
                                    onClick={applyCorrections}
                                    className='cursor-pointer font-bold text-lg bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md'
                                    >
                                    Apply Corrections
                                    </button>
                                    <button
                                    onClick={cancelEditing}
                                    className='cursor-pointer font-bold text-lg bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded-md'
                                    >
                                    Cancel
                                    </button>
                                </>
                            )}
                            <button
                            onClick={checkAnswers}
                            disabled={isChecking || answers.length === 0 || !examId}
                            className="cursor-pointer font-bold text-lg bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-md disabled:opacity-50"
                            >
                            {isChecking ? 'Checking...' : 'Check Score'}
                            </button> */}
                        </div>
                    </div> 
                    <div className="flex flex-col gap-3 mb-4 text-gray-800 w-full text-left bg-white p-4 rounded-xl shadow-inner">
                        <div className="flex flex-wrap items-center gap-3">
                            <label className="font-bold text-lg min-w-27.5">Exam ID:</label>
                            {isEditing ? (
                            <input
                                type="text"
                                value={editExamId}
                                onChange={(e) => setEditExamId(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-1.5 flex-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter Exam Code"
                            />
                            ) : (
                            <span className="text-blue-600 font-semibold text-lg">
                                {isUploading ? 'Reading...' : (examId || 'Not Detected')}
                            </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <label className="font-bold text-lg min-w-27.5">Student ID:</label>
                            {isEditing ? (
                            <input
                                type="text"
                                value={editStudentId}
                                onChange={(e) => setEditStudentId(e.target.value.replace(/\D/g, ''))}
                                className="border border-gray-300 rounded-md px-3 py-1.5 flex-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Digits only"
                            />
                            ) : (
                            <span className="text-blue-600 font-semibold text-lg">
                                {isUploading ? 'Reading...' : (studentId || 'Not Detected')}
                            </span>
                            )}
                        </div>

                        {/* Optional: Number of Questions */}
                        {isEditing && (
                            <div className="flex flex-wrap items-center gap-3 mt-1">
                            <label className="font-bold text-lg min-w-27.5"># Questions:</label>
                            <input
                                type="number"
                                min="1"
                                value={numQuestions}
                                onChange={(e) => setNumQuestions(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-1.5 w-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <button
                                onClick={applyNumQuestions}
                                className="text-sm bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded"
                            >
                                Apply
                            </button>
                            </div>
                        )}
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
                                            {(isEditing ? editAnswers : answers).map((item) => (
                                                <tr
                                                    key={item.question}
                                                    className="hover:bg-blue-100"
                                                >
                                                    <td className="border border-gray-300 px-4 py-2">
                                                        {item.question}
                                                    </td>

                                                    <td className="border border-gray-300 px-4 py-2 text-center">
                                                        {isEditing ? (
                                                            <select
                                                            value={item.answer}
                                                            onChange={(e) => updateAnswer(item.question, e.target.value)}
                                                            className={`font-bold rounded px-2 py-1 border ${
                                                                item.answer === '?' ? 'text-red-500 border-red-300' : 'text-green-600 border-green-300'
                                                            }`}
                                                            >
                                                            <option value="A">A</option>
                                                            <option value="B">B</option>
                                                            <option value="C">C</option>
                                                            <option value="D">D</option>
                                                            <option value="?">?</option>
                                                            </select>
                                                        ) : (
                                                            <span className={`font-bold ${item.answer === '?' ? 'text-red-500' : 'text-green-600'}`}>
                                                            {item.answer}
                                                            </span>
                                                        )}
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
                        {checkResult && (
                            <div className="mt-6 p-4 bg-blue-300 rounded-xl">
                                <h3 className="text-xl font-bold mb-2">
                                Score: {checkResult.score}% ({checkResult.correct}/{checkResult.total})
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                {checkResult.details.map((item) => (
                                    <div
                                    key={item.question}
                                    className={`p-2 rounded ${item.isCorrect ? 'bg-green-400' : 'bg-red-400'}`}
                                    >
                                    Q{item.question}: {item.studentAnswer} 
                                    {!item.isCorrect && ` (Correct: ${item.correctAnswer})`}
                                    </div>
                                ))}
                                </div>
                            </div>
                        )}
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