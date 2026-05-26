import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'

const SERVER_URL = 'http://localhost:3001'

export const ChatContext = createContext()

export function ChatProvider({ children }) {
  const [servers, setServers] = useState([])
  const [selectedServer, setSelectedServer] = useState(null)
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [messages, setMessages] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [connected, setConnected] = useState(false)

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vs_user')
      return saved
        ? JSON.parse(saved)
        : { id: `local-${Date.now()}`, username: 'Villager', avatar: 'VI', color: '#43b581' }
    } catch {
      return { id: `local-${Date.now()}`, username: 'Villager', avatar: 'VI', color: '#43b581' }
    }
  })

  const socketRef = useRef(null)

  // Connect socket once
  useEffect(() => {
    const socket = io(SERVER_URL, { transports: ['websocket', 'polling'] })
    socketRef.current = socket

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('new_message', (message) => {
      setMessages((prev) => [...prev, message])
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  // Fetch servers
  useEffect(() => {
    fetch(`${SERVER_URL}/api/servers`)
      .then((r) => r.json())
      .then((data) => {
        setServers(data)
        if (data.length > 0) {
          const srv = data[0]
          setSelectedServer(srv)
          const firstText = srv.channels.find((c) => c.type === 'text')
          setSelectedChannel(firstText || srv.channels[0] || null)
        }
      })
      .catch(console.error)
  }, [])

  // Fetch online users
  useEffect(() => {
    fetch(`${SERVER_URL}/api/users/online`)
      .then((r) => r.json())
      .then(setOnlineUsers)
      .catch(console.error)
  }, [])

  // Fetch messages + join room when channel changes
  useEffect(() => {
    if (!selectedChannel || selectedChannel.type === 'voice') {
      setMessages([])
      return
    }

    fetch(`${SERVER_URL}/api/channels/${selectedChannel.id}/messages`)
      .then((r) => r.json())
      .then(setMessages)
      .catch(console.error)

    if (socketRef.current) {
      socketRef.current.emit('join_channel', selectedChannel.id)
    }
  }, [selectedChannel])

  const sendMessage = useCallback(
    (content) => {
      if (!selectedChannel || !content.trim() || !socketRef.current) return
      socketRef.current.emit('send_message', {
        channelId: selectedChannel.id,
        content: content.trim(),
        author: currentUser,
      })
    },
    [selectedChannel, currentUser]
  )

  const selectServer = useCallback((server) => {
    setSelectedServer(server)
    const firstText = server.channels.find((c) => c.type === 'text')
    setSelectedChannel(firstText || server.channels[0] || null)
  }, [])

  const updateUsername = useCallback(
    (username) => {
      const trimmed = username.trim().slice(0, 32)
      if (!trimmed) return
      const updated = {
        ...currentUser,
        username: trimmed,
        avatar: trimmed.slice(0, 2).toUpperCase(),
      }
      setCurrentUser(updated)
      localStorage.setItem('vs_user', JSON.stringify(updated))
    },
    [currentUser]
  )

  return (
    <ChatContext.Provider
      value={{
        servers,
        selectedServer,
        selectedChannel,
        setSelectedChannel,
        messages,
        onlineUsers,
        currentUser,
        connected,
        sendMessage,
        selectServer,
        updateUsername,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => useContext(ChatContext)
