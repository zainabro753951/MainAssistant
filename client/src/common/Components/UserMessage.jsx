import React from 'react'
import { FiEdit } from 'react-icons/fi'
const UserMessage = ({ message }) => {
  console.log(message)

  return (
    <div className="w-full md:py-[0.5vw] sm:py-[1vw] xs:py-[1.5vw] px-3 rounded-md bg-[#121B32] border-2 border-[#19274d] flex items-center justify-between">
      <div className="flex items-center gap-5">
        <div className="md:w-[3vw] md:h-[3vw] sm:w-[4vw] sm:h-[4vw] xs:w-[6vw] xs:h-[6vw] flex items-center justify-center rounded-full bg-[#21262F] md:text-[1.3vw] overflow-hidden sm:text-[2.3vw] xs:text-[3.8vw] cursor-pointer border-2 border-blue-700">
          <img src="/images/01.png" className="w-full h-full" alt="" />
        </div>
        <p className="md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] tracking-wide font-grotesk-space ">
          {message?.message}
        </p>
      </div>
      <span className="md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] text-[#3857ad] cursor-pointer">
        <FiEdit />
      </span>
    </div>
  )
}

export default UserMessage
