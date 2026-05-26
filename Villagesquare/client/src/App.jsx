import { useContext } from 'react'
import { ThemeContext } from './contexts/ThemeContext'
import { ChatProvider } from './contexts/ChatContext'
import ServerList from './components/ServerList'
import ChannelList from './components/ChannelList'
import ChatArea from './components/ChatArea'
import UserList from './components/UserList'

function App() {
  const { theme } = useContext(ThemeContext)

  return (
    <div className="app" data-theme={theme}>
      <ChatProvider>
        <ServerList />
        <ChannelList />
        <ChatArea />
        <UserList />
      </ChatProvider>
    </div>
  )
}

export default App
