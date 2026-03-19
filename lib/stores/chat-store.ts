import { create } from 'zustand'
import { chatService } from '../api-services'
import type { ChatMessage } from '../types'

interface Channel {
  _id: string
  name: string
}

interface Room {
  _id: string
  name: string
  section?: string
  students?: any[]
}

interface ChannelMessages {
  messages: ChatMessage[]
  page: number
  hasMore: boolean
  loaded: boolean
}

interface ChatState {
  rooms: Room[]
  roomsLoaded: boolean
  roomsLoading: boolean

  channels: Record<string, Channel[]> // keyed by roomId
  channelsLoading: Record<string, boolean>

  activeRoomId: string | null
  activeChannelId: string | undefined

  // Messages cached per room:channel key
  messageCache: Record<string, ChannelMessages>
  messagesLoading: boolean
  loadingMore: boolean

  fetchRooms: () => Promise<void>
  fetchChannels: (roomId: string) => Promise<Channel[]>
  fetchMessages: (roomId: string, channelId?: string) => Promise<void>
  loadMoreMessages: (roomId: string, channelId?: string) => Promise<void>

  setActiveRoom: (roomId: string) => void
  setActiveChannel: (channelId: string | undefined) => void

  addMessage: (message: ChatMessage) => void

  getCacheKey: (roomId: string, channelId?: string) => string
}

const getCacheKey = (roomId: string, channelId?: string) =>
  channelId ? `${roomId}:${channelId}` : `${roomId}:general`

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  roomsLoaded: false,
  roomsLoading: false,

  channels: {},
  channelsLoading: {},

  activeRoomId: null,
  activeChannelId: undefined,

  messageCache: {},
  messagesLoading: false,
  loadingMore: false,

  getCacheKey,

  fetchRooms: async () => {
    if (get().roomsLoaded || get().roomsLoading) return
    set({ roomsLoading: true })
    try {
      const res = await chatService.getRooms()
      set({ rooms: res.data || [], roomsLoaded: true })
    } catch (err) {
      console.error('Failed to fetch chat rooms:', err)
    } finally {
      set({ roomsLoading: false })
    }
  },

  fetchChannels: async (roomId: string) => {
    const { channels, channelsLoading } = get()
    if (channels[roomId] || channelsLoading[roomId]) return channels[roomId] || []

    set({ channelsLoading: { ...get().channelsLoading, [roomId]: true } })
    try {
      const res = await chatService.getChannels(roomId)
      const data = res.data || []
      set({
        channels: { ...get().channels, [roomId]: data },
        channelsLoading: { ...get().channelsLoading, [roomId]: false },
      })
      return data
    } catch (err) {
      console.error('Failed to fetch channels:', err)
      set({ channelsLoading: { ...get().channelsLoading, [roomId]: false } })
      return []
    }
  },

  fetchMessages: async (roomId: string, channelId?: string) => {
    const key = getCacheKey(roomId, channelId)
    const cached = get().messageCache[key]
    if (cached?.loaded) return

    set({ messagesLoading: true })
    try {
      const res = await chatService.getMessages(roomId, {
        page: 1,
        limit: 50,
        ...(channelId && { channel: channelId }),
      })
      set({
        messageCache: {
          ...get().messageCache,
          [key]: {
            messages: res.data || [],
            page: 1,
            hasMore: (res.pagination?.totalPages || 1) > 1,
            loaded: true,
          },
        },
      })
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    } finally {
      set({ messagesLoading: false })
    }
  },

  loadMoreMessages: async (roomId: string, channelId?: string) => {
    const key = getCacheKey(roomId, channelId)
    const cached = get().messageCache[key]
    if (!cached || !cached.hasMore || get().loadingMore) return

    set({ loadingMore: true })
    try {
      const nextPage = cached.page + 1
      const res = await chatService.getMessages(roomId, {
        page: nextPage,
        limit: 50,
        ...(channelId && { channel: channelId }),
      })
      const olderMessages = res.data || []
      set({
        messageCache: {
          ...get().messageCache,
          [key]: {
            messages: [...olderMessages, ...cached.messages],
            page: nextPage,
            hasMore: (res.pagination?.totalPages || 1) > nextPage,
            loaded: true,
          },
        },
      })
    } catch (err) {
      console.error('Failed to load more messages:', err)
    } finally {
      set({ loadingMore: false })
    }
  },

  setActiveRoom: (roomId: string) => {
    set({ activeRoomId: roomId, activeChannelId: undefined })
  },

  setActiveChannel: (channelId: string | undefined) => {
    set({ activeChannelId: channelId })
  },

  addMessage: (message: ChatMessage) => {
    const { activeRoomId, activeChannelId } = get()
    if (!activeRoomId) return

    const msgChannel = (message as any).channel
    const channelId = typeof msgChannel === 'object' ? msgChannel?._id : msgChannel
    const key = getCacheKey(activeRoomId, channelId || undefined)
    const cached = get().messageCache[key]

    if (cached) {
      set({
        messageCache: {
          ...get().messageCache,
          [key]: {
            ...cached,
            messages: [...cached.messages, message],
          },
        },
      })
    }
  },
}))
