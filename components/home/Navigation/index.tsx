'use client'
import Button from '@/components/common/Button'
import Menubar from './Menubar'
import Toolbar from './Toolbar'
import { useAppContext } from '@/components/AppContext'
import ChatList from './ChatList'

export default function Navigation() {
  const {
    state: { displayNavigation }
  } = useAppContext()
  return (
    <nav className={`${displayNavigation ? '' : 'hidden'} dark w-[260px] bg-gray-900 text-gray-300 h-full p-2 relative flex flex-col`}>
      <Menubar />
      <ChatList />
      <Toolbar />
    </nav>
  )
}
