import { useState, useEffect, useRef, useCallback } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { useSocket } from '../../../../lib/use-socket'
import { useAuth } from '../../../../lib/auth-context'
import { useChatStore } from '../../../../lib/stores/chat-store'
import type { ChatMessage } from '../../../../lib/types'

export default function ChatRoomPage() {
  const pageContext = usePageContext()
  const params = pageContext.routeParams as any
  const roomId = params?.id
  const urlChannelId = params?.channelId

  const { user } = useAuth()
  const { isConnected, joinRoom, leaveRoom, sendMessage, onNewMessage, onUserTyping, onError } = useSocket()

  const {
    rooms, fetchRooms,
    channels, fetchChannels,
    activeRoomId, activeChannelId,
    setActiveRoom, setActiveChannel,
    messageCache, messagesLoading, loadingMore,
    fetchMessages, loadMoreMessages, addMessage,
    getCacheKey,
  } = useChatStore()

  const [input, setInput] = useState('')
  const [typingUser, setTypingUser] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Initialize room and channel
  useEffect(() => {
    if (!roomId) return
    fetchRooms()
    fetchChannels(roomId)
    setActiveRoom(roomId)

    const channelId = urlChannelId === 'general' ? undefined : urlChannelId
    setActiveChannel(channelId)
    fetchMessages(roomId, channelId)
  }, [roomId, urlChannelId])

  // Join socket room
  useEffect(() => {
    if (!roomId || !isConnected) return
    joinRoom(roomId, activeChannelId)
    return () => { leaveRoom(roomId, activeChannelId) }
  }, [roomId, isConnected, activeChannelId])

  // Listen for new messages
  useEffect(() => {
    if (!isConnected) return
    const unsub = onNewMessage((message: ChatMessage) => {
      addMessage(message)
      setTimeout(scrollToBottom, 50)
    })
    return unsub
  }, [isConnected, onNewMessage])

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
    return onError((data) => console.log('Chat error:', data.message))
  }, [isConnected, onError])

  // Scroll on initial load
  const cacheKey = getCacheKey(roomId || '', activeChannelId)
  const cached = messageCache[cacheKey]
  const messages = cached?.messages || []
  const hasMore = cached?.hasMore || false

  useEffect(() => {
    if (cached?.loaded && messages.length > 0) scrollToBottom()
  }, [cached?.loaded])

  const switchChannel = (channelId: string | undefined) => {
    if (!roomId) return
    leaveRoom(roomId, activeChannelId)
    setActiveChannel(channelId)
    fetchMessages(roomId, channelId)
    joinRoom(roomId, channelId)

    const channelSlug = channelId || 'general'
    window.history.replaceState({}, '', `/chat-rooms/${roomId}/${channelSlug}`)
  }

  const handleSend = () => {
    if (!input.trim() || !roomId) return
    sendMessage(roomId, input.trim(), activeChannelId)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleLoadMore = () => {
    if (roomId) loadMoreMessages(roomId, activeChannelId)
  }

  const room = rooms.find(r => r._id === roomId)
  const roomName = room ? `${room.name}${room.section ? ` - ${room.section}` : ''}` : 'Chat'
  const roomChannels = channels[roomId || ''] || []
  const activeChannelName = activeChannelId
    ? roomChannels.find(c => c._id === activeChannelId)?.name || 'Channel'
    : 'General'

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getDateLabel = (dateStr?: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    if (date.toDateString() === now.toDateString()) return 'Today'
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getSenderName = (sender: ChatMessage['sender']) => {
    if (typeof sender === 'string') return 'Unknown'
    return `${sender.firstName} ${sender.lastName}`
  }

  const getSenderId = (sender: ChatMessage['sender']) => {
    if (typeof sender === 'string') return sender
    return sender._id
  }

  const getInitials = (sender: ChatMessage['sender']) => {
    if (typeof sender === 'string') return '?'
    return `${(sender.firstName || '')[0] || ''}${(sender.lastName || '')[0] || ''}`.toUpperCase()
  }

  const isOwnMessage = (msg: ChatMessage) => getSenderId(msg.sender) === user?._id

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500',
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
  }

  // Group messages by date
  const messagesByDate: { date: string; messages: ChatMessage[] }[] = []
  let currentDate = ''
  for (const msg of messages) {
    const msgDate = new Date(msg.createdAt || '').toDateString()
    if (msgDate !== currentDate) {
      currentDate = msgDate
      messagesByDate.push({ date: msg.createdAt || '', messages: [msg] })
    } else {
      messagesByDate[messagesByDate.length - 1].messages.push(msg)
    }
  }

  const isLoadingMessages = messagesLoading && !cached?.loaded

  return (
    <div className="flex h-[calc(100vh-5rem)] rounded-xl overflow-hidden border border-[var(--color-secondary)]/20">
      {/* Sidebar */}
      <div className="w-56 shrink-0 flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(to bottom right, var(--color-primary, #3B82F6), var(--color-secondary, #2563EB))' }}>
        {/* Decorative circles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <div className="absolute bottom-16 -right-6 w-28 h-28 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* Room Header */}
        <div className="p-4 border-b border-white/10 relative z-10">
          <h2 className="font-bold text-white text-sm truncate">{roomName}</h2>
          <p className="text-xs text-white/50 mt-0.5">{roomChannels.length} channels</p>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto p-2 relative z-10">
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider px-2 mb-2">Channels</p>
          {roomChannels.map((channel) => {
            const isActive = channel._id === 'general'
              ? !activeChannelId
              : activeChannelId === channel._id
            return (
              <button
                key={channel._id}
                onClick={() => switchChannel(channel._id === 'general' ? undefined : channel._id)}
                className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors mb-0.5 ${
                  isActive
                    ? 'bg-white/15 text-white font-medium'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-white/40 mr-1">#</span>
                {channel.name.toLowerCase()}
              </button>
            )
          })}
        </div>

        {/* User */}
        {user && (
          <div className="p-3 border-t border-white/10 flex items-center gap-2 relative z-10">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: 'var(--color-primary)' }}>
              {(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-white truncate font-medium">{user.firstName}</p>
              <p className="text-[10px] text-white/40 truncate">{user.role}</p>
            </div>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {/* Channel Header */}
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-lg"># {activeChannelName.toLowerCase()}</h3>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
          </div>
          <div className="flex items-center gap-3 text-gray-500 text-sm">
            <span>{room?.students?.length || 0} members</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50">
          {hasMore && (
            <div className="text-center mb-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="text-sm font-medium disabled:opacity-50"
                style={{ color: 'var(--color-primary)' }}
              >
                {loadingMore ? 'Loading...' : 'Load older messages'}
              </button>
            </div>
          )}

          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-primary)' }} />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg className="w-16 h-16 mb-3 opacity-20" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <p className="font-medium text-gray-500">No messages yet</p>
              <p className="text-sm">Be the first to say something in #{activeChannelName.toLowerCase()}!</p>
            </div>
          ) : (
            messagesByDate.map((group, gi) => (
              <div key={gi}>
                {/* Date Separator */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2">{getDateLabel(group.date)}</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {group.messages.map((msg) => {
                  const own = isOwnMessage(msg)
                  const senderName = getSenderName(msg.sender)
                  return (
                    <div key={msg._id} className="flex gap-3 mb-4 hover:bg-gray-100/50 rounded-lg px-2 py-1.5 -mx-2 transition-colors">
                      {/* Avatar */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5 ${own ? '' : getAvatarColor(senderName)}`}
                        style={own ? { backgroundColor: 'var(--color-primary)' } : undefined}
                      >
                        {getInitials(msg.sender)}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-sm" style={own ? { color: 'var(--color-primary)' } : { color: '#111827' }}>
                            {senderName}
                          </span>
                          <span className="text-[10px] text-gray-400">{formatTime(msg.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-0.5 break-words">{msg.content}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))
          )}

          {typingUser && (
            <div className="flex items-center gap-2 text-gray-400 text-sm px-2">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              {typingUser} is typing...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-5 py-3 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message #${activeChannelName.toLowerCase()}...`}
              className="flex-1 bg-transparent text-gray-900 text-sm placeholder-gray-400 focus:outline-none"
              disabled={!isConnected}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || !isConnected}
              className="px-4 py-1.5 text-white rounded-lg text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
