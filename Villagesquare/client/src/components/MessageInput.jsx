import { useState, useRef } from 'react'
import { useChat } from '../contexts/ChatContext'

export default function MessageInput() {
  const { sendMessage, selectedChannel } = useChat()
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    sendMessage(trimmed)
    setValue('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const placeholder =
    selectedChannel?.type === 'voice'
      ? 'Voice channels don\'t have text chat'
      : `Message #${selectedChannel?.name || 'channel'}`

  const disabled = !selectedChannel || selectedChannel.type === 'voice'

  return (
    <div className="message-input">
      <div className="message-input__box">
        <button className="message-input__attach" type="button" disabled={disabled} aria-label="Attach file">
          +
        </button>
        <input
          ref={inputRef}
          className="message-input__field"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          maxLength={2000}
          autoComplete="off"
        />
        <button
          className="message-input__send"
          type="button"
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
        >
          ➤
        </button>
      </div>
    </div>
  )
}
