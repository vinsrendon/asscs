import { useState, useRef, useEffect } from 'react'
import axios from '../../../axios-config.js'
import ReactMarkdown from 'react-markdown'
import MarkdownPreview from '@uiw/react-markdown-preview';

function StudentChat(){
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [conversationId, setConversationId] = useState(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [conversations, setConversations] = useState([])
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)
    const conversationIdRef = useRef(conversationId)

    const scrollToBottom = (isStreaming = false) => {
        messagesEndRef.current?.scrollIntoView({ 
            behavior: isStreaming ? 'auto' : 'smooth'
        })
    }

    const fetchConversations = async () => {
        try {
        const res = await axios.get(`/api/chat/conversationsbyid`)
            setConversations(res.data)                
        } catch (err) {
            console.error('Failed to fetch conversations:', err)
        }
    }

    useEffect(() => {
        const fetchConversations = async () => {
            try {
            const res = await axios.get(`/api/chat/conversationsbyid`)
                setConversations(res.data)                
            } catch (err) {
                console.error('Failed to fetch conversations:', err)
            }
        }

        fetchConversations()
    },[])

    useEffect(() => {
            conversationIdRef.current = conversationId
    }, [conversationId])

    useEffect(() => {
        scrollToBottom(isGenerating)
    }, [messages,isGenerating])

    useEffect(() => {
    if (!isGenerating) {
            inputRef.current?.focus()
        }
    }, [isGenerating])

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
            timeout: 20000,
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
                        } 
                        else if (payload.type === 'token') {
                            setMessages((prev) => {
                            const updated = [...prev]
                            if(updated.length % 2 === 0 ){
                                fetchConversations()
                            }
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
            },
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

    const initNewChat = async () =>{
        setConversationId(null)
        setMessages([])
        setInput('')
    }

    const handleSelectConversation = async (id) => {
        if (isGenerating || id === conversationId) return
        setConversationId(id)
        setIsGenerating(true)

        try {
        const res = await axios.get(`/api/chat/messages/${id}`)
            setMessages(res.data)            
        } catch (err) {
            console.error('Failed to load conversation messages:', err)
        } finally {
            setIsGenerating(false)
        }
    }
    return(
        <>
            <div className="max-md:mt-10 flex justify-between gap-1 flex-wrap">
                <div className='flex-1 h-112.5 overflow-y-auto border border-[#ddd] p-3 rounded-2xl'>
                        <div className="flex items-center justify-center gap-3 mb-5">
                            <div className='text-white bg-blue-600 p-2 rounded-2xl'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" >
                                <path d="m21.45 11.11-3-1.5-2.7-1.35-1.35-2.7-1.5-3c-.34-.68-1.45-.68-1.79 0l-1.5 3-1.35 2.7-2.7 1.35-3 1.5c-.34.17-.55.52-.55.89s.21.72.55.89l3 1.5 2.7 1.35 1.35 2.7 1.5 3c.17.34.52.55.89.55s.73-.21.89-.55l1.5-3 1.35-2.7 2.7-1.35 3-1.5c.34-.17.55-.52.55-.89s-.21-.72-.55-.89Zm-3.89 1.5-.84.42-2.16 1.08-.3.15-.15.3L12 18.77l-2.11-4.21-.15-.3-.3-.15-2.16-1.08-.84-.42L5.23 12l1.21-.61.84-.42 2.16-1.08.3-.15.15-.3L12 5.23l2.11 4.21.15.3.3.15 2.16 1.08.84.42 1.21.61zM19.5 1.5l-.94 2.06-2.06.94 2.06.94.94 2.06.94-2.06 2.06-.94-2.06-.94z"></path>
                                </svg>
                            </div>   
                            <div>
                                <h1 className='font-bold text-2xl leading-none'>AI Assistant</h1>
                            </div>     
                        </div>
                        <button onClick={initNewChat} className="cursor-pointer py-1 px-2 text-white text-center rounded-2xl w-full text-2xl font-bold bg-blue-600">New chat</button>
                        <p className='text-muted-foreground ml-1 mt-1'>History</p>
                        <div className="mt-2 overflow-y-auto grow space-y-1">
                            {conversations.length === 0 ? (
                            <p className="text-sm text-gray-400 italic px-2">No past conversations</p>
                            ) : (
                            conversations.map((conv) => (
                                <button
                                key={conv.id}
                                onClick={() => handleSelectConversation(conv.id)}
                                className={`w-full text-left px-3 py-2 text-sm rounded-xl truncate transition flex items-center gap-2 cursor-pointer ${
                                    conv.id === conversationId
                                    ? 'bg-blue-100 text-blue-700 font-medium'
                                    : 'hover:bg-slate-100 text-gray-700'
                                }`}
                                >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    className="shrink-0"
                                >
                                    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
                                </svg>
                                <span className="truncate ">{conv.title || 'New Chat'}</span>
                                </button>
                            ))
                            )}
                        </div>
                </div>
                <div className="w-8/10 max-md:w-full">
                    <div className="h-112.5 overflow-y-auto border border-[#ddd] p-3.75 rounded-2xl">
                        {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`my-2.5 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
                        >
                            {msg.role === 'model' ?
                                <svg className='fill-blue-400'  xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" >
                                <path d="M8.5 10a1.5 2 0 1 0 0 4 1.5 2 0 1 0 0-4m7 0a1.5 2 0 1 0 0 4 1.5 2 0 1 0 0-4M8 16h8v2H8z"></path><path d="M21 11V8c0-1.1-.9-2-2-2h-6V4.61c.3-.27.5-.67.5-1.11 0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5c0 .44.2.84.5 1.11V6H5c-1.1 0-2 .9-2 2v3c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1v3c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-3c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1M5 20V8h14v12z"></path>
                                </svg> :
                                <svg className='ml-auto' xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" >
                                <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5m0-8c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3M4 22h16c.55 0 1-.45 1-1v-1c0-3.86-3.14-7-7-7h-4c-3.86 0-7 3.14-7 7v1c0 .55.45 1 1 1m6-7h4c2.76 0 5 2.24 5 5H5c0-2.76 2.24-5 5-5"></path>
                                </svg>
                            }
                            <span
                            className={`inline-block px-3 py-2 font-serif ${
                                msg.role === 'user'
                                ? 'bg-[#007bff] text-white rounded-b-lg rounded-tl-lg'
                                : 'bg-[#e9ecef] text-black rounded-b-lg rounded-tr-lg'
                            }`}
                            >                            
                            {/* <ReactMarkdown>{msg.content || (isGenerating && idx === messages.length - 1 ? '...' : '')}</ReactMarkdown> */}
                            <MarkdownPreview source={msg.content || (isGenerating && idx === messages.length - 1 ? '...' : '')}/>
                            </span>
                        </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="mt-1 flex gap-2 border border-slate-200 rounded-2xl p-0.5">
                        <input
                        ref={inputRef}
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
                        className="cursor-pointer px-5 py-2.5 rounded-xl font-bold bg-blue-600 text-white"
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