import { MdRefresh } from 'react-icons/md'
import { PiLightningAFill, PiStopBold } from 'react-icons/pi'
import { FiSend } from 'react-icons/fi'
import Button from '@/components/common/Button'
import TextareaAutoSize from 'react-textarea-autosize'
import { useEffect, useRef, useState } from 'react'
// import { v4 as uuidv4 } from 'uuid'
import { Message, MessageRequestBody } from '@/app/types/chat'
import { useAppContext } from '@/components/AppContext'
import { ActionType } from '@/app/reducers/AppReducer'
import { useEventBusContext, EventListener } from '@/components/EventBusContext'

export default function ChatInput() {
  const [messageText, setMessageText] = useState('')
  const chatIdRef = useRef('')
  const stopRef = useRef(false)
  const { publish, subscribe, unsubscribe } = useEventBusContext()

  const {
    state: { messageList, currentModel, streamingId, selectedChat },
    dispatch
  } = useAppContext()

  useEffect(() => {
    const callback: EventListener = data => {
      send(data)
    }
    subscribe('createNewChat', callback)
    return () => unsubscribe('createNewChat', callback)
  }, [])

  // 监听选择对话改变
  useEffect(() => {
    if (selectedChat?.id === chatIdRef.current) {
      return
    }
    chatIdRef.current = selectedChat?.id ?? ''
    stopRef.current = true
  }, [selectedChat])

  // create or update
  async function createOrUpdateMessage(message: Message) {
    const response = await fetch('/api/message/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    })

    if (!response.ok) {
      console.log(response.statusText)
      return
    }

    const { data } = await response.json()
    if (!chatIdRef.current) {
      chatIdRef.current = data.message.chatId
      publish('fetchChatList')
      dispatch({
        type: ActionType.UPDATE,
        field: 'selectedChat',
        value: chatIdRef.current
      })
    }
    return data.message
  }

  // send
  const send = async (content: string) => {
    const message = await createOrUpdateMessage({
      id: '',
      role: 'user',
      content,
      chatId: chatIdRef.current
    })
    dispatch({ type: ActionType.ADD_MESSAGE, message })
    const messages = messageList.concat([message])
    doSend(messages)
  }

  // resend
  const reSend = async () => {
    const messages = [...messageList]
    if (messages.length && messages[messages.length - 1].role === 'assistant') {
      const result = await deleteMessage(messages[messages.length - 1].id)
      if (!result) {
        console.log('delete error')
        return
      }
      dispatch({ type: ActionType.REMOVE_MESSAGE, message: messages[messages.length - 1] })
      messages.splice(messages.length - 1, 1)
    }
    doSend(messages)
  }

  // delete message
  async function deleteMessage(id: string) {
    const response = await fetch(`/api/message/delete?${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) {
      console.log(response.statusText)
      return
    }
    const { code } = await response.json()
    return code === 0
  }

  // do send
  const doSend = async (messages: Message[]) => {
    stopRef.current = false
    const body: MessageRequestBody = { messages, model: currentModel }
    setMessageText('')
    const controller = new AbortController()
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify(body)
    })
    if (!response.ok) {
      console.log(response.statusText)
      return
    }
    if (!response.body) {
      console.log(response.statusText)
      return
    }
    const responseMessage = await createOrUpdateMessage({
      id: '',
      role: 'assistant',
      content: '',
      chatId: chatIdRef.current
    })
    dispatch({ type: ActionType.ADD_MESSAGE, message: responseMessage })
    dispatch({ type: ActionType.UPDATE, field: 'streamingId', value: responseMessage.id })
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let done = false
    let content = ''
    while (!done) {
      if (stopRef.current) {
        controller.abort()
        break
      }
      const result = await reader.read()
      done = result.done
      const chunk = decoder.decode(result.value)
      content += chunk
      dispatch({ type: ActionType.UPDATE_MESSAGE, message: { ...responseMessage, content } })
    }
    createOrUpdateMessage({ ...responseMessage, content })
    dispatch({ type: ActionType.UPDATE, field: 'streamingId', value: '' })
    setMessageText('')
  }

  return (
    <div className="absolute inset-x-0 bottom-0">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-4">
        {messageList.length !== 0 &&
          (streamingId !== '' ? (
            <Button
              icon={PiStopBold}
              variant="primary"
              className="mb-4 mx-3"
              onClick={() => {
                stopRef.current = true
              }}
            >
              停止生成
            </Button>
          ) : (
            <Button
              icon={MdRefresh}
              variant="primary"
              className="mb-4 mx-3"
              onClick={() => {
                reSend()
              }}
            >
              重新生成
            </Button>
          ))}

        <div className="flex items-end w-full border border-black/10 dark:border-gray-800/50 bg-white dark:bg-gray-700 rounded shadow-sm py-4 outline-none">
          <div className="mx-3 mb-2.5">
            <PiLightningAFill />
          </div>
          <TextareaAutoSize
            value={messageText}
            onChange={e => {
              setMessageText(e.target.value)
            }}
            className="flex-1 max-h-64 mb-1.5 bg-transparent text-black dark:text-white resize-none border-0 outline-none"
            placeholder="输入一条消息..."
            rows={1}
          />
          <Button
            onClick={() => {
              send(messageText)
            }}
            className="mx-3 !rounded-lg"
            icon={FiSend}
            variant="primary"
            disabled={messageText.trim() === '' || streamingId !== ''}
          />
        </div>
      </div>
      <footer className="text-center text-sm text-gray-700 dark:text-gray-300 px-4 pb-6">&copy; {new Date().getFullYear()}</footer>
    </div>
  )
}
