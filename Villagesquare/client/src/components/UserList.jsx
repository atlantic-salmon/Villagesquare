import { useChat } from '../contexts/ChatContext'

const STATUS_GROUPS = [
  { key: 'online', label: 'Online' },
  { key: 'idle',   label: 'Idle'   },
  { key: 'dnd',    label: 'Do Not Disturb' },
  { key: 'offline', label: 'Offline' },
]

export default function UserList() {
  const { onlineUsers, currentUser } = useChat()

  // Add current user (always online) to the list, deduplicated
  const allUsers = [
    { ...currentUser, status: 'online', isSelf: true },
    ...onlineUsers.filter((u) => u.id !== currentUser.id),
  ]

  return (
    <div className="user-list">
      <div className="user-list__header">Members — {allUsers.length}</div>

      {STATUS_GROUPS.map(({ key, label }) => {
        const group = allUsers.filter((u) => u.status === key)
        if (group.length === 0) return null
        return (
          <div className="user-group" key={key}>
            <div className="user-group__title">
              {label} — {group.length}
            </div>
            {group.map((user) => (
              <div className="user-item" key={user.id} title={user.username}>
                <div className="user-item__avatar-wrap">
                  <div className="user-item__avatar" style={{ background: user.color }}>
                    {user.avatar}
                  </div>
                  <div className={`user-item__status user-item__status--${user.status}`} />
                </div>
                <span className="user-item__name">
                  {user.username}
                  {user.isSelf && <span className="user-item__you"> (you)</span>}
                </span>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
