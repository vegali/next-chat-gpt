import { ActionType } from '@/app/reducers/AppReducer'
import { useAppContext } from '@/components/AppContext'
import MarkDown from '@/components/common/MarkDown'
import { useEffect } from 'react'
import { SiOpenai } from 'react-icons/si'

export default function MessageList() {
  const {
    state: { messageList, streamingId, selectedChat },
    dispatch
  } = useAppContext()

  // get data
  async function getData(chatId: string) {
    const response = await fetch(`/api/message/list?chatId=${chatId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.log(response.statusText)
      return
    }

    const { data } = await response.json()

    dispatch({
      type: ActionType.UPDATE,
      field: 'messageList',
      value: data.list
    })
  }

  // 监听selectedChat更新messagelist
  useEffect(() => {
    if (selectedChat) {
      getData(selectedChat.id)
    } else {
      dispatch({
        type: ActionType.UPDATE,
        field: 'messageList',
        value: []
      })
    }
  }, [selectedChat])

  return (
    <div className="w-full pt-10 pb-48 dark:text-gray-300">
      <ul>
        {messageList.map(item => {
          const isUser = item.role == 'user'
          return (
            <li key={item.id} className={`${isUser ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
              <div className="w-full max-w-4xl mx-auto flex space-x-4 p-5 text-lg">
                <div className="text-3xl leading-[1]">{isUser ? '😊' : <SiOpenai />}</div>
                <div className="flex-1">
                  <MarkDown>{`${item.content} ${item.id == streamingId ? '▍' : ''}`}</MarkDown>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
