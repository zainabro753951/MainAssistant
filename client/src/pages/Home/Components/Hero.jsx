import React from 'react'
import IdeasBanner from './IdeasBanner'
import FeatureCards from './FeatureCards'
import Footer from '../../../common/Components/Footer'

const Hero = () => {
  return (
    <div
      className="
        w-full min-h-screen
        md:px-[2vw] sm:px-[2.5vw] xs:px-[3vw]
        md:mt-[6vw] sm:mt-[8vw] xs:mt-[10vw]
        overflow-auto
      "
    >
      <IdeasBanner />
      <FeatureCards />
      <Footer />
    </div>
  )
}

export default Hero
