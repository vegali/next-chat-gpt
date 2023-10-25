import { groupByDate } from '@/app/common/utils'
import { Chat } from '@/app/types/chat'
import { useEffect, useMemo, useRef, useState } from 'react'
import ChatItem from './ChatItem'
import { useEventBusContext } from '@/components/EventBusContext'
import { useAppContext } from '@/components/AppContext'
import { ActionType } from '@/app/reducers/AppReducer'

export default function ChatList() {
  const [chatList, setChatList] = useState<Chat[]>([])
  const pageRef = useRef(1)
  const groupList = useMemo(() => {
    if (chatList?.length) {
      return groupByDate(chatList)
    } else {
      chatList
    }
  }, [chatList])
  const { subscribe, unsubscribe } = useEventBusContext()

  const {
    state: { selectedChat },
    dispatch
  } = useAppContext()

  // get data
  async function getData() {
    const response = await fetch(`/api/chat/list?page=${pageRef.current}`, {
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

    if (pageRef.current === 1) {
      setChatList(data.list)
    } else {
      setChatList(list => list.concat(data.list))
    }
  }

  // 首次进入页面请求数据
  useEffect(() => {
    getData()
  }, [])

  useEffect(() => {
    const callback: EventListener = () => {
      pageRef.current = 1
      getData()
    }
    subscribe('fetchChatList', callback)
    return () => unsubscribe('fetchChatList', callback)
  }, [])

  return (
    <div className="flex flex-col flex-1 mt-2 overflow-y-auto mb-[48px]">
      {groupList?.length &&
        groupList.map(([date, list]) => {
          return (
            <div key={date}>
              <div className="sticky top-0 p-3 z-10 text-sm bg-gray-900 text-gray-500">{date}</div>
              <ul>
                {list.map(item => {
                  const selected = selectedChat?.id === item.id
                  return (
                    <ChatItem
                      key={item.id}
                      item={item}
                      selected={selected}
                      onSelected={chat => {
                        dispatch({
                          type: ActionType.UPDATE,
                          field: 'selectedChat',
                          value: chat
                        })
                      }}
                    />
                  )
                })}
              </ul>
            </div>
          )
        })}
    </div>
  )
}
