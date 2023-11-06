import { ActionType } from '@/app/reducers/AppReducer'
import { Chat } from '@/app/types/chat'
import { useAppContext } from '@/components/AppContext'
import { useEventBusContext } from '@/components/EventBusContext'
import { useEffect, useState } from 'react'
import { AiOutlineEdit } from 'react-icons/ai'
import { MdCheck, MdClose, MdDeleteOutline } from 'react-icons/md'
import { PiChatBold, PiTrashBold } from 'react-icons/pi'

type Props = {
  item: Chat
  selected: boolean
  onSelected: (item: Chat) => void
}

export default function ChatItem({ item, selected, onSelected }: Props) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [title, setTitle] = useState(item.title)
  const { publish } = useEventBusContext()
  const { dispatch } = useAppContext()

  useEffect(() => {
    setEditing(false)
  }, [selected, deleting])

  // update item
  async function updateChat() {
    const response = await fetch('/api/chat/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: item.id, title })
    })

    if (!response.ok) {
      console.log(response.statusText)
      return
    }

    const { code } = await response.json()
    if (code === 0) {
      publish('fetchChatList')
    }
  }

  // delete
  async function deleteChat() {
    const response = await fetch(`/api/chat/delete?id=${item.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) {
      console.log(response.statusText)
      return
    }

    const { code } = await response.json()
    if (code === 0) {
      publish('fetchChatList')
      dispatch({
        type: ActionType.UPDATE,
        field: 'selectedChat',
        value: null
      })
    }
  }

  return (
    <li
      key={item.id}
      className={`group relative flex items-center p-3 space-x-3 cursor-pointer rounded-lg hover:bg-gray-800 ${selected ? 'bg-gray-800 pr-[3.5em]' : ''}`}
      onClick={() => {
        onSelected(item)
      }}
    >
      <div>{deleting ? <PiTrashBold /> : <PiChatBold />}</div>
      {selected && editing ? (
        <input
          type="text"
          className="flex-1 bg-transparent min-w-0 outline-none"
          value={title}
          autoFocus={true}
          onChange={e => {
            setTitle(e.target.value)
          }}
        />
      ) : (
        <div className="flex-1 whitespace-nowrap overflow-hidden relative">
          {item.title}
          <span className={`absolute right-0 inset-y-0 w-8 bg-gradient-to-l group-hover:from-gray-800 ${selected ? 'from-gray-800' : 'from-gray-900'}`}></span>
        </div>
      )}

      {selected && (
        <div className="absolute right-1 flex">
          {editing || deleting ? (
            <>
              <button
                className="p-1 hover:text-white"
                onClick={e => {
                  if (editing) {
                    console.log('editing')
                    updateChat()
                  }
                  if (deleting) {
                    console.log('deleting')
                    deleteChat()
                  }
                  setDeleting(false)
                  setEditing(false)
                  e.preventDefault()
                }}
              >
                <MdCheck />
              </button>
              <button
                className="p-1 hover:text-white"
                onClick={e => {
                  setDeleting(false)
                  setEditing(false)
                  e.preventDefault()
                }}
              >
                <MdClose />
              </button>
            </>
          ) : (
            <>
              <button
                className="p-1 hover:text-white"
                onClick={e => {
                  setEditing(true)
                  e.preventDefault()
                }}
              >
                <AiOutlineEdit />
              </button>
              <button
                className="p-1 hover:text-white"
                onClick={() => {
                  setDeleting(true)
                }}
              >
                <MdDeleteOutline />
              </button>
            </>
          )}
        </div>
      )}
    </li>
  )
}
