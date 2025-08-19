import React, { useState } from 'react'
import { BsThreeDots } from 'react-icons/bs'
import { BsLayoutSidebar } from 'react-icons/bs'
import { motion } from 'motion/react'

const HistoryBar = () => {
  const [isHistoryBarOpen, setIsHistoryBarOpen] = useState()
  let historyies = [
    {
      CreatedAt: 'Today',
      history: [
        'Online School Education',
        'Ranking Water is Essentials',
        'These food are calorie',
        'If you are struggling to',
      ],
    },
    {
      CreatedAt: 'Yesterday',
      history: [
        'Online School Education',
        'Ranking Water is Essentials',
        'These food are calorie',
        'If you are struggling to',
      ],
    },
  ]
  return (
    <motion.div
      initial={{
        x: 0,
      }}
      animate={{
        x: isHistoryBarOpen ? '100%' : 0,
      }}
      className={`md:min-w-[21vw] md:block xs:hidden border-l border-gray-900 sticky md:mt-[5.5vw] md:px-5 xs:px-3 md:py-7 xs:py-3 sm:mt-[10.5vw] xs:mt-[15.5vw] left-0 top-0 flex flex-col justify-between  `}
    >
      <div
        onClick={() => setIsHistoryBarOpen(!isHistoryBarOpen)}
        className="md:w-[2vw] md:h-[2vw] sm:w-[3vw] sm:h-[3vw] xs:w-[5vw] xs:h-[5vw] cursor-pointer flex items-center justify-center md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] bg-white text-theme-sky-blue absolute left-0 top-14 z-50 -translate-x-full"
      >
        <BsLayoutSidebar />
      </div>
      <div className="relative w-full h-full overflow-auto sidebar-scrollbar">
        <div className="w-full md:py-[0.8vw] sm:py-[1.3vw] xs:py-[1.8vw] px-3 rounded-md bg-white flex items-center justify-between ">
          <img src="/images/newChat.png" className="md:w-[7vw] sm:w-[13vw] xs:w-[18vw] " alt="" />
          <img
            src="/images/ChatIcon.png"
            className="md:w-[1.5vw] sm:w-[2.6vw] xs:w-[3.7vw] "
            alt=""
          />
        </div>

        {historyies.map((history, index) => {
          return (
            <div
              key={index}
              className="w-full flex flex-col gap-4 md:py-[1.5vw] sm:py-[2.5vw] xs:py-[3.5vw]"
            >
              <h4 className="md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] text-gray-300 font-exo-space">
                {history.CreatedAt}
              </h4>
              <div className="w-full flex flex-col  items-center">
                {history?.history.map(item => {
                  return (
                    <div className="w-full flex items-center justify-between md:py-[0.7vw] sm:py-[1.2vw] xs:py-[1.7vw] transition-all duration-300 hover:bg-[#121B32] px-3 rounded-md ">
                      <p className="md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] text-gray-300 font-exo-space">
                        {item}
                      </p>
                      <p className="text-gray-300 md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw]">
                        <BsThreeDots />
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

export default HistoryBar
