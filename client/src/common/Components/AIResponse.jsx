import React, { useState } from 'react'

import { AiOutlineDislike } from 'react-icons/ai'
import { AiOutlineLike } from 'react-icons/ai'

import { AiFillDislike } from 'react-icons/ai'
import { AiFillLike } from 'react-icons/ai'

import { AnimatePresence, motion } from 'motion/react'
import ResponseFormatter from './ResponseFormater'

const AIResponse = ({ isImage, message }) => {
  const [isLikeHover, setIsLikeHover] = useState(false)
  const [isDisLikeHover, setIsDisLikeHover] = useState(false)
  return (
    <div className="w-full md:py-[1.5vw] sm:py-[2.5vw] xs:py-[3.5vw] flex md:flex-row xs:flex-col md:gap-0 xs:gap-3 ">
      <div className="px-3 shrink-0">
        <img src="/images/shortLogo.png" className="md:w-[3vw] sm:w-[4vw] xs:w-[5vw] " alt="" />
      </div>
      <div className="flex flex-col xs:gap-1.5 md:gap-3 px-3">
        <h3 className="md:text-[1.2vw] sm:text-[2.2vw] xs:text-[3.7vw] font-semibold font-grotesk-space">
          ZainCodeAI
        </h3>
        <ResponseFormatter content={message?.message} />
        {/* Like and DisLike */}
        {!isImage && (
          <div className="flex">
            <div className="flex items-center gap-5 md:py-[0.7vw] sm:py-[1.2vw] xs:py-[1.7vw] px-6 my-5 rounded-md bg-[#121B32] border-2 border-[#19274d] mr-auto md:text-[1.8vw] sm:text-[2.8vw] xs:text-[4.3vw] text-theme-sky-blue transition-all duration-300">
              {/* LIKE */}
              <div
                className="relative cursor-pointer"
                onMouseEnter={() => setIsLikeHover(true)}
                onMouseLeave={() => setIsLikeHover(false)}
              >
                <motion.span
                  initial={{ opacity: 1 }}
                  animate={{ opacity: isLikeHover ? 0 : 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute"
                >
                  <AiOutlineLike />
                </motion.span>

                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isLikeHover ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AiFillLike className="text-theme-sky-blue" />
                </motion.span>
              </div>

              {/* DISLIKE */}
              <div
                className="relative cursor-pointer"
                onMouseEnter={() => setIsDisLikeHover(true)}
                onMouseLeave={() => setIsDisLikeHover(false)}
              >
                <motion.span
                  initial={{ opacity: 1 }}
                  animate={{ opacity: isDisLikeHover ? 0 : 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute"
                >
                  <AiOutlineDislike />
                </motion.span>

                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isDisLikeHover ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AiFillDislike className="text-theme-sky-blue" />
                </motion.span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIResponse
