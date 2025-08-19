import React from 'react'
import { UseSideBarContext } from '../../Context/SideBarOpenProvider'
import Header from '../../common/Components/Header'
import Sidebar from '../../common/Components/Sidebar'
import QuestionsSection from './Components/QuestionsSection'

const Faqs = () => {
  const { isSideBarOpen, setIsSiderOpen } = UseSideBarContext()
  return (
    <>
      <Header setIsSiderOpen={setIsSiderOpen} isSideBarOpen={isSideBarOpen} />
      <div className="w-full h-screen inline-flex overflow-hidden ">
        <Sidebar isSideBarOpen={isSideBarOpen} />
        <QuestionsSection />
      </div>
    </>
  )
}

export default Faqs
