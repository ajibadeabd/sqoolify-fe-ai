import { useState, useEffect, useRef, useCallback } from 'react'
import { navigate } from 'vike/client/router'
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
    activeChannelId,
    setActiveRoom, setActiveChannel,
    messageCache, messagesLoading, loadingMore,
    fetchMessages, loadMoreMessages, addMessage,
    getCacheKey,
  } = useChatStore()

  const [input, setInput] = useState('')
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>({})

  const toggleRoom = (id: string) => {
    setExpandedRooms(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Fetch all rooms and their channels on mount
  useEffect(() => {
    fetchRooms().then(() => {
      const store = useChatStore.getState()
      store.rooms.forEach(r => fetchChannels(r._id))
    })
  }, [])

  // Initialize active room and channel from URL
  useEffect(() => {
    if (!roomId) return
    setActiveRoom(roomId)
    setExpandedRooms(prev => ({ ...prev, [roomId]: true }))
    fetchChannels(roomId)

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

  const switchToChannel = (targetRoomId: string, channelId: string | undefined) => {
    if (roomId && isConnected) leaveRoom(roomId, activeChannelId)
    setActiveRoom(targetRoomId)
    setActiveChannel(channelId)
    fetchMessages(targetRoomId, channelId)
    if (isConnected) joinRoom(targetRoomId, channelId)

    const channelSlug = channelId || 'general'
    navigate(`/chat-rooms/${targetRoomId}/${channelSlug}`)
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
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 border-t border-gray-200">
      {/* Sidebar — all rooms + channels */}
      <div className="w-52 shrink-0 flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(to bottom right, var(--color-primary, #3B82F6), var(--color-secondary, #2563EB))' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <div className="absolute bottom-16 -right-6 w-28 h-28 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
        </div>

        <div className="p-4 border-b border-white/10 relative z-10">
          <h2 className="font-bold text-white text-sm">Chat Rooms</h2>
        </div>

        <div className="flex-1 overflow-y-auto py-2 relative z-10">
          {rooms.map((r) => {
            const rChannels = channels[r._id] || []
            const isExpanded = expandedRooms[r._id]
            const hasActiveChannel = roomId === r._id
            return (
              <div key={r._id}>
                <button
                  onClick={() => toggleRoom(r._id)}
                  className={`w-full text-left px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    hasActiveChannel ? 'text-white/70' : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  <svg
                    className={`w-3 h-3 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  {r.name}{r.section ? ` - ${r.section}` : ''}
                </button>
                {isExpanded && rChannels.map((channel) => {
                  const chId = channel._id === 'general' ? undefined : channel._id
                  const isActive = roomId === r._id && (
                    channel._id === 'general' ? !activeChannelId : activeChannelId === channel._id
                  )
                  return (
                    <button
                      key={channel._id}
                      onClick={() => switchToChannel(r._id, chId)}
                      className={`w-full text-left pl-7 pr-3 py-1 text-sm transition-colors ${
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
            )
          })}
        </div>

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
        {!roomId ? (
          /* No room selected — empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <svg className="w-16 h-16 mb-3 opacity-20" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <p className="font-medium text-gray-500">Select a channel</p>
            <p className="text-sm">Pick a channel from the sidebar to start chatting</p>
          </div>
        ) : (
          <>
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

                    {group.messages.map((msg, mi) => {
                      const own = isOwnMessage(msg)
                      const senderName = getSenderName(msg.sender)
                      const senderId = getSenderId(msg.sender)

                      const prevMsg = mi > 0 ? group.messages[mi - 1] : null
                      const prevSenderId = prevMsg ? getSenderId(prevMsg.sender) : null
                      const prevTime = prevMsg?.createdAt ? new Date(prevMsg.createdAt).getTime() : 0
                      const currTime = msg.createdAt ? new Date(msg.createdAt).getTime() : 0
                      const isConsecutive = prevSenderId === senderId && (currTime - prevTime) < 5 * 60 * 1000

                      if (isConsecutive) {
                        return (
                          <div key={msg._id} className={`flex ${own ? 'justify-end pr-[42px]' : 'justify-start pl-[42px]'} py-0.5`}>
                            <div className={`px-3 py-1.5 rounded-xl text-sm break-words max-w-[70%] ${
                              own ? 'text-white rounded-tr-sm' : 'text-gray-700 bg-white border border-gray-200 rounded-tl-sm'
                            }`} style={own ? { backgroundColor: 'var(--color-primary)' } : undefined}>
                              {msg.content}
                            </div>
                          </div>
                        )
                      }

                      return (
                        <div key={msg._id} className={`flex ${own ? 'justify-end' : 'justify-start'} ${mi > 0 ? 'mt-3' : ''}`}>
                          <div className={`flex gap-2.5 max-w-[70%] ${own ? 'flex-row-reverse' : ''}`}>
                            {/* Avatar */}
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5 ${own ? '' : getAvatarColor(senderName)}`}
                              style={own ? { backgroundColor: 'var(--color-primary)' } : undefined}
                            >
                              {getInitials(msg.sender)}
                            </div>

                            {/* Content */}
                            <div className={`min-w-0 ${own ? 'text-right' : ''}`}>
                              <div className={`flex items-baseline gap-2 ${own ? 'justify-end' : ''}`}>
                                <span className="font-semibold text-xs text-gray-500">
                                  {senderName}
                                </span>
                                <span className="text-[10px] text-gray-400">{formatTime(msg.createdAt)}</span>
                              </div>
                              <div className={`mt-1 px-3 py-2 rounded-xl text-sm break-words inline-block text-left ${
                                own ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white text-gray-700 border border-gray-200 rounded-tl-sm'
                              }`} style={own ? { backgroundColor: 'var(--color-primary)' } : undefined}>
                                {msg.content}
                              </div>
                            </div>
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
              <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:bg-gray-50 transition">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message #${activeChannelName.toLowerCase()}...`}
                  className="flex-1 bg-transparent text-gray-900 text-sm placeholder-gray-400 focus:outline-none px-4 py-2.5"
                  disabled={!isConnected}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || !isConnected}
                  className="px-3 py-2.5 text-gray-400 hover:text-blue-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
