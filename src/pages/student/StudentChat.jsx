import { useState, useRef, useEffect } from 'react'
import axios from '../../../axios-config.js'

function StudentChat(){    
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [conversationId, setConversationId] = useState(null)
    const [isGenerating, setIsGenerating] = useState(false)

    const conversationIdRef = useRef(conversationId)
    useEffect(() => {
        conversationIdRef.current = conversationId
}, [conversationId])

    const handleSend = async () => {
        if (!input.trim() || isGenerating) return

        const userText = input
        setInput('')
        setIsGenerating(true)

        setMessages(prev => [
        ...prev,
        { role: 'user', content: userText },
        { role: 'model', content: '' }
        ])

        let processedLength = 0

    try {
      await axios.post(
            '/api/chat/stream',
            {
                conversationId: conversationIdRef.current,
                prompt: userText,
            },
            {
            responseType: 'text',
            onDownloadProgress: (progressEvent) => {
                const fullResponse = progressEvent.event.target.responseText
                const newChunk = fullResponse.slice(processedLength)
                processedLength = fullResponse.length

                const lines = newChunk.split('\n\n')

                for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const dataStr = line.replace('data: ', '').trim()
                    if (dataStr === '[DONE]') break

                    try {
                    const payload = JSON.parse(dataStr)

                    if (payload.type === 'meta') {
                        setConversationId(payload.conversationId)
                    } else if (payload.type === 'token') {
                        setMessages((prev) => {
                        const updated = [...prev]
                        const lastIdx = updated.length - 1
                        updated[lastIdx] = {
                            ...updated[lastIdx],
                            content: updated[lastIdx].content + payload.text,
                        }
                        return updated
                        })
                    }
                    } catch (err) {
                        console.log("JSON parse error:"+err)                        
                    }
                }
                }
            },
            }
        )
        } catch (err) {
        console.error('Axios Chat Error:', err)
        setMessages((prev) => {
            const updated = [...prev]
            const lastIdx = updated.length - 1
            updated[lastIdx] = {
            ...updated[lastIdx],
            content: 'Error: Failed to get response.',
            }
            return updated
        })
        } finally {
        setIsGenerating(false)
        }
    }
    return(
        <>
            <div className="max-md:mt-10 flex justify-between gap-1 flex-wrap">
                <div className='flex-1 h-112.5 overflow-y-auto border border-[#ddd] p-3.75 rounded-2xl'>
                        <h1 className='text-center font-bold text-2xl'>CHAT HISTORY</h1>
                </div>
                <div className="w-3/4 max-md:w-full">
                    <div className="h-112.5 overflow-y-auto border border-[#ddd] p-3.75 rounded-2xl">
                        {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`my-2.5 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
                        >
                            <span
                            className={`inline-block rounded-lg px-3 py-2 ${
                                msg.role === 'user'
                                ? 'bg-[#007bff] text-white'
                                : 'bg-[#e9ecef] text-black'
                            }`}
                            >
                            {msg.content || (isGenerating && idx === messages.length - 1 ? '...' : '')}
                            </span>
                        </div>
                        ))}
                    </div>
                    <div className="mt-1 flex gap-2 border border-slate-200 rounded-2xl p-0.5">
                        <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask something..."
                        className="grow p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                        disabled={isGenerating}
                        />
                        <button
                        onClick={handleSend}
                        disabled={isGenerating}
                        className="px-5 py-2.5 rounded-xl font-bold bg-[#12264F] text-white"
                        >
                        Send
                        </button>
                    </div>
                </div>                
            </div>
        </>
    )
}

export default StudentChat