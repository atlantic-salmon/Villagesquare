import { useEffect, useRef } from 'react'
import { useChat } from '../contexts/ChatContext'
import MessageInput from './MessageInput'

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(ts) {
  const d = new Date(ts)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

function isSameDay(ts1, ts2) {
  return new Date(ts1).toDateString() === new Date(ts2).toDateString()
}

export default function ChatArea() {
  const { selectedChannel, messages, currentUser } = useChat()
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!selectedChannel) {
    return (
      <div className="chat-area chat-area--empty">
        <p>Select a channel to start chatting</p>
      </div>
    )
  }

  if (selectedChannel.type === 'voice') {
    return (
      <div className="chat-area">
        <div className="chat-area__header">
          <span className="chat-area__header-icon">🔊</span>
          <span className="chat-area__header-name">{selectedChannel.name}</span>
        </div>
        <div className="chat-area__voice-placeholder">
          <div className="voice-ph__icon">🎤</div>
          <h2>Voice Channel</h2>
          <p>Voice is not yet functional in this prototype.</p>
          <p>Pick a text channel to start chatting!</p>
        </div>
        <MessageInput />
      </div>
    )
  }

  // Group consecutive messages from the same author (within 5 min)
  const annotated = messages.map((msg, i) => {
    const prev = messages[i - 1]
    const grouped =
      prev &&
      prev.author.id === msg.author.id &&
      msg.timestamp - prev.timestamp < 300_000
    return { ...msg, grouped }
  })

  return (
    <div className="chat-area">
      {/* Header */}
      <div className="chat-area__header">
        <span className="chat-area__header-icon">#</span>
        <span className="chat-area__header-name">{selectedChannel.name}</span>
        <span className="chat-area__header-sep" />
        <span className="chat-area__header-desc">Welcome to #{selectedChannel.name}!</span>
      </div>

      {/* Messages */}
      <div className="chat-area__messages">
        {annotated.length === 0 && (
          <div className="chat-area__welcome">
            <div className="chat-area__welcome-icon">#</div>
            <h2>Welcome to #{selectedChannel.name}!</h2>
            <p>This is the beginning of the #{selectedChannel.name} channel.</p>
          </div>
        )}

        {annotated.map((msg, i) => {
          const showDivider = i === 0 || !isSameDay(msg.timestamp, annotated[i - 1].timestamp)
          const isOwn = msg.author.id === currentUser.id

          return (
            <div key={msg.id}>
              {showDivider && (
                <div className="date-divider">
                  <span className="date-divider__label">{formatDate(msg.timestamp)}</span>
                </div>
              )}
              <div className={`message${msg.grouped ? ' message--grouped' : ''}${isOwn ? ' message--own' : ''}`}>
                {msg.grouped ? (
                  <div className="message__avatar-spacer">
                    <span className="message__hover-time">{formatTime(msg.timestamp)}</span>
                  </div>
                ) : (
                  <div className="message__avatar" style={{ background: msg.author.color }}>
                    {msg.author.avatar}
                  </div>
                )}
                <div className="message__body">
                  {!msg.grouped && (
                    <div className="message__header">
                      <span className="message__author" style={{ color: msg.author.color }}>
                        {msg.author.username}
                      </span>
                      <span className="message__time">{formatTime(msg.timestamp)}</span>
                    </div>
                  )}
                  <p className="message__content">{msg.content}</p>
                </div>
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      <MessageInput />
    </div>
  )
}
