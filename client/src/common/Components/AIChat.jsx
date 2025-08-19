import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import AIResponse from './AIResponse'
import UserMessage from './UserMessage'
import EnterMessage from './EnterMessage'

const AIChat = () => {
  const { messages } = useSelector(state => state.AIMessages)
  const lastMessage = useRef(null)

  useEffect(() => {
    // Scroll to the last message when messages update
    if (lastMessage.current) {
      lastMessage.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full h-full md:pt-[7vw] sm:pt-[12vw] xs:pt-[17vw] overflow-auto sidebar-scrollbar xs:px-2 md:px-6">
        {messages.map((message, idx) => {
          const isLast = idx === messages.length - 1

          if (message?.sender?.toLowerCase() === 'user') {
            return (
              <div key={idx} ref={isLast ? lastMessage : null}>
                <UserMessage message={message} />
              </div>
            )
          }

          if (message?.sender?.toLowerCase() === 'ai') {
            return (
              <div key={idx} ref={isLast ? lastMessage : null}>
                <AIResponse message={message} />
              </div>
            )
          }

          return null
        })}
      </div>

      <div className="w-full md:min-h-[7vw] sm:min-h-[12vw] xs:min-h-[17vw] md:p-[1.5vw] sm:p-[2vw] xs:p-[2.5vw] flex items-center justify-center">
        <EnterMessage />
      </div>
    </div>
  )
}

export default AIChat
