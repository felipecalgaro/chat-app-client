import { FormEvent, useEffect, useReducer, useRef, useState } from 'react'
import io from 'socket.io-client'
import './App.css'

interface Message {
  content: string
  id: string
  userId: string
}

const socket = io('http://localhost:3000')

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState<string>('')
  const firstRender = useRef(true)

  useEffect(() => { // execute after second rendering
    if (firstRender.current) {
      firstRender.current = false
      return
    }

    socket.on('connected', id => {
      const content = 'JOINED'

      setMessages(prev => [...prev, {
        content,
        id: '' + Math.random(),
        userId: id
      }])
    })

    socket.on('receive-message', message => {
      setMessages(prev => [...prev, message])
    })

    socket.on('disconnected', id => {
      const content = 'LEFT'

      setMessages(prev => [...prev, {
        content,
        id: '' + Math.random(),
        userId: id
      }])
    })
  }, [])

  function sendMessage(e: FormEvent) {
    e.preventDefault()

    if (messageInput === '') return

    socket.emit('send-message', messageInput, socket.id)
    setMessageInput('')
  }

  return (
    <div className="container">
      <div className="chat">
        <div className="messages-area">
          {messages.map(message => (
            <p key={message.id}>
              <span>{message.userId} </span>
              {message.content}
            </p>
          ))}
        </div>
        <div className="input-area">
          <form onSubmit={sendMessage}>
            <input
              value={messageInput}
              onChange={e => setMessageInput(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              type="text"
              name="message"
              id="message"
            />
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default App
