import React from 'react'
import { motion } from 'motion/react'

const IdeasBanner = () => {
  return (
    <section
      className="w-full grid lg:grid-cols-2 grid-cols-1 md:gap-[1.5vw] sm:gap-[2vw] xs:gap-[2.5vw] md:mb-[1.5vw] sm:mb-[2vw] xs:mb-[2.5vw]
                        bg-gradient-to-br from-[#071028] via-[#0a1630] to-[#071433]
                        md:rounded-[1.5vw] sm:rounded-[2vw] xs:rounded-[2.5vw] md:p-[1.5vw] sm:p-[2vw] xs:p-[2.5vw]
                        shadow-lg border border-[#12203b]/40 backdrop-blur-sm overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col justify-center"
      >
        <h1 className="md:text-[3.4vw] sm:text-[4.4vw] xs:text-[5.9vw] font-exo-space font-bold md:leading-[3.9vw] sm:leading-[4.9vw] xs:leading-[6.4vw]">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-indigo-400 to-sky-300">
            Have Smarter Conversations with Your Voice
          </span>
        </h1>
        <p className="md:mt-[1.5vw] sm:mt-[2vw] xs:mt-[2.5vw] md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] text-white/75 font-grotesk-space md:max-w-[30vw] sm:max-w-[45vw] ">
          IntellectAi is the place to talk, connect, and engage using the power of AI voice
          technology. With IntellectAi Voice Studio, you can create natural AI voices, hold
          real-time voice chats, and even monetize your conversations through interactive audio
          experiences.
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          className="md:mt-[2vw] sm:mt-[2.5vw] xs:mt-[3vw] inline-flex items-center md:gap-[1.5vw] sm:gap-[2vw] xs:gap-[2.5vw] md:rounded-[0.7vw] sm:rounded-[1.2vw] xs:rounded-[1.7vw]
                     bg-white text-[#1C1C6C] font-semibold md:px-[2vw] sm:px-[3vw] xs:px-[4vw] md:py-[1vw] sm:py-[1.5vw] xs:py-[2vw]
                     shadow-sm hover:shadow-md transition md:text-[1.2vw] sm:text-[2.2vw] xs:text-[3.7vw]"
        >
          Try Now
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="w-full flex items-end justify-end lg:justify-end md:justify-center"
      >
        <img
          src="/images/BannerImage.png"
          alt="banner"
          className="md:w-[20vw] sm:w-[40vw] xs:w-[60vw] object-contain md:-mb-[2vw] sm:-mb-[2.5vw] xs:-mb-[3vw] select-none"
        />
      </motion.div>
    </section>
  )
}

export default IdeasBanner
