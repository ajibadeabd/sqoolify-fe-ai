import { useState, useEffect } from 'react'
import { navigate } from 'vike/client/router'
import { chatService } from '../../../lib/api-services'
import Card from '../../../components/ui/Card'
import Breadcrumbs from '../../../components/layout/Breadcrumbs'
import Spinner from '../../../components/ui/Spinner'

interface Channel {
  _id: string
  name: string
}

interface RoomWithChannels {
  room: any
  channels: Channel[]
  expanded: boolean
}

export default function ChatRoomsPage() {
  const [roomsData, setRoomsData] = useState<RoomWithChannels[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await chatService.getRooms()
        const rooms = res.data || []

        // Fetch channels for each room in parallel
        const roomsWithChannels = await Promise.all(
          rooms.map(async (room: any) => {
            try {
              const channelsRes = await chatService.getChannels(room._id)
              return { room, channels: channelsRes.data || [], expanded: false }
            } catch {
              return { room, channels: [], expanded: false }
            }
          })
        )

        setRoomsData(roomsWithChannels)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch chat rooms')
      } finally {
        setLoading(false)
      }
    }
    fetchRooms()
  }, [])

  const toggleExpand = (index: number) => {
    setRoomsData(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, expanded: !item.expanded } : item
      )
    )
  }

  const navigateToChannel = (roomId: string, channelId?: string) => {
    const slug = channelId || 'general'
    navigate(`/chat-rooms/${roomId}/${slug}`)
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Chat Rooms' }]} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Chat Rooms</h1>
        <p className="text-gray-500 mt-1">Chat with classmates and teachers in your class rooms</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : error ? (
        <Card>
          <p className="text-red-500 text-center py-8">{error}</p>
        </Card>
      ) : roomsData.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <svg className="mx-auto w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <p className="text-gray-500 font-medium">No chat rooms available</p>
            <p className="text-gray-400 text-sm mt-1">You&apos;ll see chat rooms when you&apos;re assigned to a class</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {roomsData.map(({ room, channels, expanded }, index) => (
            <Card key={room._id}>
              <div>
                {/* Room Header */}
                <div
                  className="flex items-center gap-4 p-1 cursor-pointer"
                  onClick={() => toggleExpand(index)}
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {room.name}
                      {room.section ? ` - ${room.section}` : ''}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {room.students?.length || 0} students
                      <span className="text-gray-400"> · {channels.length} {channels.length === 1 ? 'channel' : 'channels'}</span>
                    </p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
                    fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Channels List */}
                {expanded && channels.length > 0 && (
                  <div className="mt-3 ml-16 border-t border-gray-100 pt-3 space-y-1">
                    {channels.map((channel) => (
                      <button
                        key={channel._id}
                        onClick={() => navigateToChannel(
                          room._id,
                          channel._id === 'general' ? undefined : channel._id
                        )}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2"
                      >
                        <span className="text-gray-400">#</span>
                        {channel.name.toLowerCase()}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
