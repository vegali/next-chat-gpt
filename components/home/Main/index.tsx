import ChatInput from './ChatInput'
import Menu from './Menu'
import MessageList from './MessageList'
import Welcome from './Welcome'

export default function Navigation() {
  return (
    <div className="relative flex-1 ">
      <main className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 overflow-y-auto w-full h-full">
        <Menu />
        {/* <Welcome /> */}
        <MessageList />
        <ChatInput />
      </main>
    </div>
  )
}
