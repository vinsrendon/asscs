import { useRef, useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { PaddleOcrService } from 'ppu-paddle-ocr/web'
import axios from '../../../axios-config'
import ExcelJS from 'exceljs'
import Modal from '../modal.jsx'

function TeacherScan(){  
    const [showStudentsModal, setShowStudentsModal] = useState(false)
    const [examStudents, setExamStudents] = useState([])
    const [loadingStudents, setLoadingStudents] = useState(false)
    const [selectedExamCode, setSelectedExamCode] = useState('')
    const [isExporting, setIsExporting] = useState(false)

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

    // eslint-disable-next-line no-unused-vars
    const [isChecking, setIsChecking] = useState(false)
    const [checkResult, setCheckResult] = useState(null)

    const ocrRef = useRef(null)

    const intervalRef = useRef(null)
    const scannerRef = useRef(null)
    const resultImageRef = useRef(null)

    const [bulkProgress, setBulkProgress] = useState({
        current: 0,
        total: 0
    })

    const [bulkResults, setBulkResults] = useState([])
    const [isBulkUploading, setIsBulkUploading] = useState(false)

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
        setShowStudentsModal(false)
    setExamStudents([])
    setSelectedExamCode('')

        setBulkResults([])
        setBulkProgress({ current: 0, total: 0 })
        setIsBulkUploading(false)
    
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
        setBulkResults(null)

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

        if (!ocrRef.current) {
            const ocr = new PaddleOcrService();
            ocrRef.current = ocr;

            ocr.initialize()
                .then(() => {
                    console.log("PaddleOCR initialized successfully");
                })
                .catch((err) => {
                    console.error("PaddleOCR failed to initialize:", err);

                    if (ocrRef.current === ocr) {
                        ocrRef.current = null;
                    }

                    ocr.destroy();
                });
        }

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

        newImg.onload = async () => {
            try {
                const extracted = scannerRef.current.extractPaper(
                    newImg,
                    video.videoWidth,
                    video.videoHeight
                )

                if (extracted) {
                    await processShadedSheet(extracted)
                } else {
                    Swal.fire({
                        text: 'Could not detect the answer sheet.',
                        icon: 'warning'
                    })
                }
            } catch (err) {
                console.error('Capture failed:', err)

                Swal.fire({
                    text: 'Failed to capture the answer sheet.',
                    icon: 'error'
                })
            }
        }

        if (resultCanvasRef.current) {
            resultCanvasRef.current.width = 0
            resultCanvasRef.current.height = 0
        }
    }
    
    const extractHeaderData = async (src, cv) => {
        if (!ocrRef.current) {
            return { examId: "", studentId: "" };
        }

        const width = src.cols;
        const height = src.rows;

        // Capture the complete header, including both printed labels.
        const x = 0;
        const y = Math.round(height * 0.025);
        const w = width;
        const h = Math.round(height * 0.055);

        const roi = src.roi(new cv.Rect(x, y, w, h));
        const tempCanvas = document.createElement("canvas");

        try {
            cv.imshow(tempCanvas, roi);

            // Enlarge the header before recognition.
            const canvas = document.createElement("canvas");
            canvas.width = tempCanvas.width * 2;
            canvas.height = tempCanvas.height * 2;

            const ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(
                tempCanvas,
                0, 0,
                canvas.width,
                canvas.height
            );

            const result = await ocrRef.current.recognize(canvas)

            const { examId, studentId } = parseHeaderOCR(result?.text)
            console.log("HEADER OCR:", result?.text)
            console.log("Parsed exam code:", examId)
            console.log("Parsed student ID:", studentId)

            return { examId, studentId }
        } finally {
            roi.delete();
        }
    }

    function parseHeaderOCR(ocrText) {
        const text = (ocrText || "")
            .toUpperCase()
            .replace(/EXAM\s*CODE/gi, "EXAM CODE")
            .replace(/STUDENT\s*ID/gi, "STUDENT ID");

        // Extract the exam code between the labels.
        const examSection =
            text.split(/STUDENT\s*ID/i)[0] || "";

        const examId = (
            examSection.match(
                /EXAM\s*CODE\s*[:\-]?\s*([A-Z0-9\s]+)/i
            )?.[1] || ""
        ).replace(/[^A-Z0-9]/g, "");

        // Extract everything after STUDENT ID.
        const studentSection =
            text.split(/STUDENT\s*ID/i)[1] || "";

        // Correct common OCR substitutions before removing spaces.
        const correctedStudentText = studentSection
        .replace(/④/g, "6")
        .replace(/[〇ＯOQD]/g, "0")
        .replace(/[^0-9]/g, "");

        const studentId = correctedStudentText;

        return { examId, studentId };
    }


    const processShadedSheet = async(extractedCanvas) => {
        const scanData = {
            examId: '',
            studentId: '',
            answers: [],
            status: 'Failed'
        }

        const cv = window.cv
        if (!cv || !extractedCanvas) {
            Swal.fire({
                text:"OpenCV not ready or no canvas",
                icon:"error"
            }); 
            return scanData
        }

        let src, display, gray, blurred, thresh, contours, hierarchy

        try {
            src = cv.imread(extractedCanvas)
            
            

            // Extract Exam ID and Student ID
            const { examId: parsedExamId, studentId: parsedStudentId } = await extractHeaderData(src, cv)
            console.log(parsedExamId);

            scanData.examId = parsedExamId
            scanData.studentId = parsedStudentId
            
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
                scanData.status = 'Failed'
                scanData.error = 'Too few candidates found'

                Swal.fire({
                    text: 'Too few candidates found',
                    icon: 'warning'
                })

                return scanData
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

            // Automatically check the scanned answers
            if (parsedExamId && parsedStudentId && allResults.length > 0) {
                await checkAnswers(
                    parsedExamId,
                    parsedStudentId,
                    allResults
                )
            } else {
                Swal.fire({
                    title: 'Scan completed',
                    text: 'Could not automatically check answers. Please verify the Exam ID, Student ID, and detected answers.',
                    icon: 'warning'
                })
            }

            // return {
            //     examId: parsedExamId,
            //     studentId: parsedStudentId,
            //     answers: allResults,
            //     status: 'Success'
            // }
            scanData.answers = allResults
            scanData.status = 'Success'
            return scanData
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

    const checkAnswers = async (
        examCode = examId,
        currentStudentId = studentId,
        studentAnswers = answers
    ) => {
        if (
            !examCode?.trim() ||
            !currentStudentId?.trim() ||
            !studentAnswers?.length
        ) {
            Swal.fire({
                text: 'Exam ID, Student ID, and answers are required.',
                icon: 'warning'
            })
            return
        }

        setIsChecking(true)
        setCheckResult(null)

        try {
            const res = await axios.post('/exam/check', {
                examCode: examCode.trim(),
                studentId: currentStudentId.trim(),
                studentAnswers
            })

            const result = res.data.result
            console.log(result.data);
            
            setCheckResult(result)

            await Swal.fire({
                title: `Score: ${result.score}%`,
                html: `
                    <p><b>${result.correct}</b> correct out of
                    <b>${result.total}</b></p>
                    <p>${result.exam.title}</p>
                    <p class="text-sm text-gray-500 mt-2">
                        Result saved successfully
                    </p>
                `,
                icon: result.score >= 75 ? 'success' : 'info'
            })
        } catch (err) {
            console.error('Answer checking failed:', err)

            Swal.fire({
                title: 'Checking failed',
                text: err.response?.data?.message ||
                    'Failed to check answers. Please verify the Exam ID and Student ID.',
                icon: 'error'
            })
        } finally {
            setIsChecking(false)
        }
    }  

    const handleBulkUpload = async (e) => {
        const files = Array.from(e.target.files || [])
        if (!files.length || !scannerRef.current) return

        setIsBulkUploading(true)
        setBulkProgress({ current: 0, total: files.length })
        setBulkResults([])

        const results = []

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            setBulkProgress({ current: i + 1, total: files.length })

            try {
                // Load file into Image object
                const img = await new Promise((resolve, reject) => {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                        const image = new Image()
                        image.onload = () => resolve(image)
                        image.onerror = reject
                        image.src = event.target.result
                    }
                    reader.onerror = reject
                    reader.readAsDataURL(file)
                })

                const scanData = await processShadedSheet(img)
                console.log(scanData);
                
                results.push({
                    fileName: file.name,
                    examId: scanData?.examId || '',
                    studentId: scanData?.studentId || '',
                    answersCount: scanData?.answers?.length || 0,
                    status: scanData?.status || 'Success'
                })
            } catch (err) {
                console.error(`Error processing ${file.name}:`, err)
                results.push({
                    fileName: file.name,
                    status: 'Failed',
                    error: err.message || 'Processing failed'
                })
            }
        }

        setBulkResults(results)
        setIsBulkUploading(false)

        Swal.fire({
            title: 'Scan Complete',
            text: `Successfully processed ${results.filter(r => r.status === 'Success').length} of ${files.length} sheets.`,
            icon: 'success'
        })
    }
   
    const fetchStudentsByExam = async (code) => {
        if (!code?.trim()) {
            Swal.fire({ text: 'No exam code detected', icon: 'warning' })
            return
        }

        setSelectedExamCode(code.trim().toUpperCase())
        setLoadingStudents(true)
        setShowStudentsModal(true)
        setExamStudents([])

        try {
            const res = await axios.get(
            `/exam/${encodeURIComponent(code.trim())}/students`
            )
            setExamStudents(res.data.students || [])
        } catch (err) {
            console.error(err)
            Swal.fire({
            title: 'Failed to load students',
            text: err.response?.data?.message || 'Could not fetch students for this exam',
            icon: 'error'
            })
            setShowStudentsModal(false)
        } finally {
            setLoadingStudents(false)
        }
        }

        const exportStudentsToExcel = async () => {
        if (!examStudents.length) {
            Swal.fire({ text: 'No data to export', icon: 'info' })
            return
        }

        setIsExporting(true)

        try {
            const workbook = new ExcelJS.Workbook()
            workbook.creator = 'Exam Scanner'
            workbook.created = new Date()

            const sheet = workbook.addWorksheet('Results', {
            views: [{ state: 'frozen', ySplit: 1 }]
            })

            sheet.columns = [
            { header: '#', key: 'n', width: 6 },
            { header: 'Student / Applicant ID', key: 'id', width: 18 },
            { header: 'First Name', key: 'fname', width: 14 },
            { header: 'Middle Name', key: 'mname', width: 14 },
            { header: 'Last Name', key: 'lname', width: 14 },
            { header: 'Course', key: 'course', width: 14 },
            { header: 'Score (%)', key: 'score', width: 12 },
            { header: 'Exam Code', key: 'examCode', width: 14 },
            { header: 'Exam Title', key: 'examTitle', width: 24 },
            { header: 'Subject', key: 'subject', width: 14 },
            { header: 'Type', key: 'type', width: 12 },
            { header: 'Total Items', key: 'totalItems', width: 12 }
            ]

            // Header style
            sheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF2563EB' }
            }
            cell.alignment = { vertical: 'middle', horizontal: 'center' }
            })

            examStudents.forEach((s, i) => {
            sheet.addRow({
                n: i + 1,
                id: s.student_id,
                fname: s.fname || '',
                mname: s.mname || '',
                lname: s.lname || '',
                course: s.course || '',
                score: s.score,
                examCode: s.exam_code,
                examTitle: s.exam_title || '',
                subject: s.subject || '',
                type: s.type || '',
                totalItems: s.total_items
            })
            })

            // Center score column
            sheet.getColumn('score').alignment = { horizontal: 'center' }
            sheet.getColumn('n').alignment = { horizontal: 'center' }

            const buffer = await workbook.xlsx.writeBuffer()
            const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${selectedExamCode || 'exam'}_results.xlsx`
            a.click()
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error(err)
            Swal.fire({ text: 'Failed to export Excel', icon: 'error' })
        } finally {
            setIsExporting(false)
        }
    }
    return(
        <>
            {/* EXAM CODE STUDENT LIST */}
            <Modal
            isOpen={showStudentsModal}
            onClose={() => setShowStudentsModal(false)}
            >
            <div className="mt-2">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">
                    Students – {selectedExamCode}
                    </h2>
                    <p className="text-sm text-gray-500">
                    {loadingStudents
                        ? 'Loading...'
                        : `${examStudents.length} student(s) have taken this exam`}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={exportStudentsToExcel}
                    disabled={loadingStudents || isExporting || examStudents.length === 0}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold rounded-xl transition cursor-pointer"
                >
                    {isExporting ? 'Exporting...' : 'Export Excel'}
                </button>
                </div>

                {loadingStudents ? (
                <div className="text-center py-10 text-gray-500">Loading students...</div>
                ) : examStudents.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    No students have taken this exam yet.
                </div>
                ) : (
                <div className="overflow-x-auto max-h-96 overflow-y-auto border rounded-xl">
                    <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-gray-50 sticky top-0 border-b">
                        <tr>
                        <th className="p-3 font-semibold">#</th>
                        <th className="p-3 font-semibold">ID</th>
                        <th className="p-3 font-semibold">Name</th>
                        <th className="p-3 font-semibold">Course</th>
                        <th className="p-3 font-semibold">Score</th>
                        <th className="p-3 font-semibold">Exam</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {examStudents.map((s, idx) => (
                        <tr key={s.result_id || idx} className="hover:bg-gray-50">
                            <td className="p-3">{idx + 1}</td>
                            <td className="p-3 font-medium">{s.student_id}</td>
                            <td className="p-3">
                            {[s.fname, s.mname, s.lname].filter(Boolean).join(' ') || '—'}
                            </td>
                            <td className="p-3">{s.course || '—'}</td>
                            <td className="p-3">
                            <span
                                className={`font-semibold ${
                                s.score >= 75
                                    ? 'text-green-600'
                                    : s.score >= 50
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                                }`}
                            >
                                {s.score}%
                            </span>
                            </td>
                            <td className="p-3 text-gray-600">
                            {s.exam_title || s.exam_code}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                )}
            </div>
            </Modal>
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
                            disabled={isUploading || isBulkUploading}
                            className='cursor-pointer font-bold text-2xl leading-none bg-blue-300 hover:bg-blue-400 p-1 rounded-xl hover:rounded-sm duration-200 transition-all animate-fade-in [animation-delay:300ms]!'
                        >
                            {isUploading ? 'Processing...' : 'Upload'}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleBulkUpload}
                            multiple
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
                        </div>
                    </div> 
                    <div className="flex flex-col gap-3 mb-4 text-gray-800 w-full text-left bg-white p-4 rounded-xl shadow-inner">
                        {/* <div className="flex flex-wrap items-center gap-3">
                            <label className="font-bold text-lg min-w-27.5">Exam ID:</label>                            
                            
                            <span className="text-blue-600 font-semibold text-lg">
                                {isUploading ? 'Reading...' : (examId || 'Not Detected')}
                            </span>
                        </div> */}
                        <div className="flex flex-wrap items-center gap-3">
                        <label className="font-bold text-lg min-w-27.5">Exam ID:</label>
                        {examId ? (
                            <button
                            type="button"
                            onClick={() => fetchStudentsByExam(examId)}
                            className="text-blue-600 font-semibold text-lg underline hover:text-blue-800 cursor-pointer"
                            title="View students who took this exam"
                            >
                            {examId}
                            </button>
                        ) : (
                            <span className="text-blue-600 font-semibold text-lg">
                            {isUploading ? 'Reading...' : 'Not Detected'}
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
                    </div>
                    {/* Bulk Results Summary */}
                    {(bulkResults?.length ?? 0) > 0 && !isBulkUploading && (
                        <div className="my-6 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm">
                            <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                                <div>
                                    <h3 className="font-bold text-xl text-gray-800">Bulk Scan Summary</h3>
                                    <p className="text-sm text-gray-500">Overview of all processed answer sheets</p>
                                </div>
                                
                                {/* Quick Stats Badges */}
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 font-semibold text-sm rounded-lg border border-blue-100">
                                        Total: {bulkResults.length}
                                    </span>
                                    <span className="px-3 py-1 bg-green-50 text-green-700 font-semibold text-sm rounded-lg border border-green-100">
                                        Success: {bulkResults.filter(r => r.status === 'Success').length}
                                    </span>
                                    <span className="px-3 py-1 bg-red-50 text-red-700 font-semibold text-sm rounded-lg border border-red-100">
                                        Failed: {bulkResults.filter(r => r.status === 'Failed').length}
                                    </span>
                                </div>
                            </div>

                            {/* Summary Table */}
                            <div className="overflow-x-auto max-h-80 overflow-y-auto border rounded-xl">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead className="bg-gray-50 sticky top-0 text-gray-600 border-b">
                                        <tr>
                                            <th className="p-3 font-semibold">File Name</th>
                                            <th className="p-3 font-semibold">Exam ID</th>
                                            <th className="p-3 font-semibold">Student ID</th>
                                            <th className="p-3 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {bulkResults.map((res, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50">
                                                <td className="p-3 font-medium text-gray-800 truncate max-w-xs" title={res.fileName}>
                                                    {res.fileName}
                                                </td>
                                                <td className="p-3 text-gray-600">{res.examId || '—'}</td>
                                                <td className="p-3 text-gray-600">{res.studentId || '—'}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                        res.status === 'Success' 
                                                            ? 'bg-green-100 text-green-700' 
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {res.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default TeacherScan