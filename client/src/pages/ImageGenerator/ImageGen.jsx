import React from 'react'
import Header from '../../common/Components/Header'
import Sidebar from '../../common/Components/Sidebar'
import { UseSideBarContext } from '../../Context/SideBarOpenProvider'
import AIChat from '../../common/Components/AIChat'
import ComingSoonPoster from '../../common/Components/CommingSoonPoster'

const ImageGen = () => {
  const { isSideBarOpen, setIsSiderOpen } = UseSideBarContext()
  return (
    <>
      <Header setIsSiderOpen={setIsSiderOpen} isSideBarOpen={isSideBarOpen} />
      <div className="w-full h-screen inline-flex overflow-hidden ">
        <Sidebar isSideBarOpen={isSideBarOpen} />
        <ComingSoonPoster />
      </div>
    </>
  )
}

export default ImageGen
