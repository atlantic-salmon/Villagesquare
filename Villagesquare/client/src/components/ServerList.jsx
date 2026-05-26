import { useChat } from '../contexts/ChatContext'

export default function ServerList() {
  const { servers, selectedServer, selectServer } = useChat()

  return (
    <div className="server-list">
      {/* Home button */}
      <div className="server-list__home" title="VillageSquare Home">
        <span>VS</span>
      </div>

      <div className="server-list__separator" />

      {servers.map((server) => (
        <div
          key={server.id}
          className={`server-list__item${selectedServer?.id === server.id ? ' active' : ''}`}
          onClick={() => selectServer(server)}
          title={server.name}
          style={{ '--server-color': server.color }}
        >
          <span>{server.icon}</span>
          <div className="server-list__indicator" />
        </div>
      ))}

      <div className="server-list__add" title="Add a Server">
        <span>+</span>
      </div>
    </div>
  )
}
