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
  const loadMoreRef = useRef(null)
  const hasMoreRef = useRef(false)
  const loadingRef = useRef(false)

  // get data
  async function getData() {
    if (loadingRef.current) {
      return
    }
    loadingRef.current = true
    const response = await fetch(`/api/chat/list?page=${pageRef.current}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.log(response.statusText)
      loadingRef.current = false
      return
    }
    const { data } = await response.json()
    hasMoreRef.current = data.hasMore

    if (pageRef.current === 1) {
      setChatList(data.list)
    } else {
      setChatList(list => list.concat(data.list))
    }
    loadingRef.current = false
    pageRef.current++
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

  // 监听滚动到chatlist底部
  useEffect(() => {
    let observer: IntersectionObserver | null = null
    let div = loadMoreRef.current
    if (div) {
      observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMoreRef.current) {
          getData()
        }
      })
      observer.observe(div)
    }
    return () => {
      if (observer && div) {
        observer.unobserve(div)
      }
    }
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
      <div ref={loadMoreRef}>&nbsp;</div>
    </div>
  )
}
