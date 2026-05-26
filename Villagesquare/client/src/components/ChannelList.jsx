import { useState, useContext } from 'react'
import { useChat } from '../contexts/ChatContext'
import { ThemeContext } from '../contexts/ThemeContext'

export default function ChannelList() {
  const { selectedServer, selectedChannel, setSelectedChannel, currentUser, updateUsername, connected } =
    useChat()
  const { theme, toggleTheme } = useContext(ThemeContext)

  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')

  const handleNameSubmit = (e) => {
    e.preventDefault()
    updateUsername(nameInput)
    setEditingName(false)
  }

  const startEdit = () => {
    setNameInput(currentUser.username)
    setEditingName(true)
  }

  if (!selectedServer) return <div className="channel-list" />

  const textChannels = selectedServer.channels.filter((c) => c.type === 'text')
  const voiceChannels = selectedServer.channels.filter((c) => c.type === 'voice')

  return (
    <div className="channel-list">
      {/* Header */}
      <div className="channel-list__header">
        <span className="channel-list__server-name">{selectedServer.name}</span>
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Channel sections */}
      <div className="channel-list__body">
        {textChannels.length > 0 && (
          <div className="channel-section">
            <div className="channel-section__title">Text Channels</div>
            {textChannels.map((ch) => (
              <button
                key={ch.id}
                className={`channel-item${selectedChannel?.id === ch.id ? ' active' : ''}`}
                onClick={() => setSelectedChannel(ch)}
              >
                <span className="channel-item__icon">#</span>
                <span className="channel-item__name">{ch.name}</span>
              </button>
            ))}
          </div>
        )}

        {voiceChannels.length > 0 && (
          <div className="channel-section">
            <div className="channel-section__title">Voice Channels</div>
            {voiceChannels.map((ch) => (
              <button
                key={ch.id}
                className={`channel-item${selectedChannel?.id === ch.id ? ' active' : ''}`}
                onClick={() => setSelectedChannel(ch)}
              >
                <span className="channel-item__icon">🔊</span>
                <span className="channel-item__name">{ch.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User bar */}
      <div className="user-bar">
        <div className="user-bar__avatar" style={{ background: currentUser.color }}>
          {currentUser.avatar}
        </div>
        <div className="user-bar__info">
          {editingName ? (
            <form onSubmit={handleNameSubmit}>
              <input
                autoFocus
                className="user-bar__name-input"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={() => setEditingName(false)}
                placeholder="Enter username…"
                maxLength={32}
              />
            </form>
          ) : (
            <div className="user-bar__name" onClick={startEdit} title="Click to change username">
              {currentUser.username}
            </div>
          )}
          <div className={`user-bar__status user-bar__status--${connected ? 'online' : 'offline'}`}>
            {connected ? 'Online' : 'Connecting…'}
          </div>
        </div>
      </div>
    </div>
  )
}
