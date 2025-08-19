import React from 'react'
import { motion } from 'motion/react'
import { useSelector } from 'react-redux'

const FeatureCards = () => {
  const { user } = useSelector(state => state.auth)

  const featuresCard = [
    {
      image: '/images/FeatureCard/feature1.jpg',
      title: 'Create Image (Coming Soon)',
      description:
        'Turn your words into stunning AI-generated visuals. This feature will be available soon.',
      button: 'Notify Me',
      isComingSoon: true,
    },
    {
      image: '/images/FeatureCard/feature2.jpg',
      title: 'Create Conversations',
      description:
        'Our voice-to-voice feature turns your speech into natural AI-powered conversations in real time.',
      button: 'Start',
    },
    {
      image: '/images/FeatureCard/feature3.jpg',
      title: 'Upload Folders',
      description:
        'Upload your project folders like git and let AI organize, analyze, and suggest smart insights instantly.',
      button: 'Go To',
    },
  ]

  return (
    <section className="w-full md:py-[2vw] sm:py-[2.5vw] xs:py-[3vw]">
      <h2 className="md:text-[2.5vw] sm:text-[3.5vw] xs:text-[5vw] font-exo-space font-bold md:mb-[1.5vw] sm:mb-[2vw] xs:mb-[2.5vw]">
        👋 Welcome, {user?.firstName} {user?.lastName}
      </h2>

      <div className="grid md:gap-[1.5vw] sm:gap-[2vw] xs:gap-[2.5vw] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ">
        {featuresCard.map((item, idx) => (
          <motion.article
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: idx * 0.06 }}
            whileHover={{ scale: 1.02 }}
            className="relative md:rounded-[1vw] sm:rounded-[1.5vw] xs:rounded-[2vw] overflow-hidden md:h-[16vw] sm:h-[26vw] xs:h-[36vw]
                       border border-[#1b2a44]/40 shadow-md
                       bg-gradient-to-b from-[#071225]/60 to-[#041026]/40"
          >
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />

            <div className="absolute left-0 right-0 bottom-0 w-full h-full bg-black/75 backdrop-blur-sm md:p-[1.5vw] sm:p-[2vw] xs:p-[2.5vw]">
              <h3 className="md:text-[1.5vw] sm:text-[2.5vw] xs:text-[4vw] font-semibold font-exo-space">
                {item.title}
              </h3>
              <p className="md:mt-[0.7vw] sm:mt-[1.2vw] xs:mt-[1.7vw] md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] text-white/70">
                {item.description}
              </p>

              <div className="md:mt-[1.5vw] sm:mt-[2vw] xs:mt-[2.5vw] flex items-center md:gap-[1vw] sm:gap-[1.5vw] xs:gap-[2vw]">
                <motion.button
                  initial={{
                    backgroundColor: item.isComingSoon ? '#1C1C6C' : '#3f3eed',
                    color: '#fff',
                  }}
                  whileHover={{ scale: 1.03, boxShadow: '0 0.5vw 1.5vw rgba(63,62,237,0.18)' }}
                  className="md:rounded-[0.6vw] sm:rounded-[1.1vw] xs:rounded-[1.6vw]
                             md:px-[1.5vw] sm:px-[2vw] xs:px-[2.5vw] md:py-[0.6vw] sm:py-[1.1vw] xs:py-[1.6vw]
                             md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] font-semibold transition"
                  style={{ backgroundColor: item.isComingSoon ? '#1C1C6C' : undefined }}
                >
                  {item.isComingSoon ? 'Notify Me' : item.button}
                </motion.button>

                {item.isComingSoon && (
                  <span className="md:text-[0.7vw] sm:text-[1.7vw] xs:text-[2.2vw] text-white/60 md:px-[0.7vw] sm:px-[1.2vw] xs:px-[1.7vw] md:py-[0.25vw] sm:py-[0.75vw] xs:py-[1.25vw] bg-white/5 rounded-full">
                    Coming Soon
                  </span>
                )}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

export default FeatureCards
