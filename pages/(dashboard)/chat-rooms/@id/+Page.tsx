import { useState, useEffect, useRef, useCallback } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { chatService } from '../../../../lib/api-services'
import { useSocket } from '../../../../lib/use-socket'
import { useAuth } from '../../../../lib/auth-context'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'
import Spinner from '../../../../components/ui/Spinner'
import type { ChatMessage } from '../../../../lib/types'

export default function ChatRoomPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const { user } = useAuth()
  const { isConnected, joinRoom, leaveRoom, sendMessage, onNewMessage, onUserTyping, onError } = useSocket()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [roomName, setRoomName] = useState('')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Load room info and initial messages
  useEffect(() => {
    if (!id) return
    const loadRoom = async () => {
      try {
        // Load rooms to get room name
        const roomsRes = await chatService.getRooms()
        const room = (roomsRes.data || []).find((r: any) => r._id === id)
        if (room) {
          setRoomName(`${room.name}${room.section ? ` - ${room.section}` : ''}`)
        }

        // Load messages
        const messagesRes = await chatService.getMessages(id, { page: 1, limit: 50 })
        setMessages(messagesRes.data || [])
        setHasMore((messagesRes.pagination?.totalPages || 1) > 1)
      } catch (err: any) {
        console.log('Failed to load chat room:', err.message)
      } finally {
        setLoading(false)
      }
    }
    loadRoom()
  }, [id])

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom()
    }
  }, [loading])

  // Join room when socket connects
  useEffect(() => {
    if (!id || !isConnected) return
    joinRoom(id)
    return () => {
      leaveRoom(id)
    }
  }, [id, isConnected, joinRoom, leaveRoom])

  // Listen for new messages
  useEffect(() => {
    if (!isConnected) return
    const unsub = onNewMessage((message: ChatMessage) => {
      setMessages((prev) => [...prev, message])
      setTimeout(scrollToBottom, 50)
    })
    return unsub
  }, [isConnected, onNewMessage, scrollToBottom])

  // Listen for typing
  useEffect(() => {
    if (!isConnected) return
    const unsub = onUserTyping((data) => {
      if (data.userId !== user?._id) {
        setTypingUser(data.firstName)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 2000)
      }
    })
    return unsub
  }, [isConnected, onUserTyping, user?._id])

  // Listen for errors
  useEffect(() => {
    if (!isConnected) return
    const unsub = onError((data) => {
      console.log('Chat error:', data.message)
    })
    return unsub
  }, [isConnected, onError])

  const handleSend = () => {
    if (!input.trim() || !id) return
    sendMessage(id, input.trim())
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const loadMore = async () => {
    if (loadingMore || !hasMore || !id) return
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const res = await chatService.getMessages(id, { page: nextPage, limit: 50 })
      const olderMessages = res.data || []
      setMessages((prev) => [...olderMessages, ...prev])
      setPage(nextPage)
      setHasMore((res.pagination?.totalPages || 1) > nextPage)
    } catch (err) {
      console.log('Failed to load more messages')
    } finally {
      setLoadingMore(false)
    }
  }

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getSenderName = (sender: ChatMessage['sender']) => {
    if (typeof sender === 'string') return 'Unknown'
    return `${sender.firstName} ${sender.lastName}`
  }

  const getSenderId = (sender: ChatMessage['sender']) => {
    if (typeof sender === 'string') return sender
    return sender._id
  }

  const isOwnMessage = (msg: ChatMessage) => {
    return getSenderId(msg.sender) === user?._id
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Chat Rooms', href: '/chat-rooms' },
        { label: roomName || 'Chat' },
      ]} />

      <div className="mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">{roomName}</h1>
          <p className="text-xs text-gray-500">
            {isConnected ? (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                Connected
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span>
                Connecting...
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-white/60 rounded-xl border border-gray-100 p-4 space-y-3"
      >
        {hasMore && (
          <div className="text-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              {loadingMore ? 'Loading...' : 'Load older messages'}
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg className="w-16 h-16 mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <p className="font-medium">No messages yet</p>
            <p className="text-sm">Be the first to say something!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const own = isOwnMessage(msg)
            return (
              <div
                key={msg._id}
                className={`flex ${own ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] ${own ? 'order-1' : ''}`}>
                  {!own && (
                    <p className="text-xs font-medium text-gray-500 mb-1 ml-1">
                      {getSenderName(msg.sender)}
                    </p>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl ${
                      own
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-900 rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                  <p className={`text-[10px] mt-1 ${own ? 'text-right mr-1' : 'ml-1'} text-gray-400`}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            )
          })
        )}

        {typingUser && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </span>
            {typingUser} is typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          disabled={!isConnected}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || !isConnected}
          className="px-5 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
          Send
        </button>
      </div>
    </div>
  )
}
