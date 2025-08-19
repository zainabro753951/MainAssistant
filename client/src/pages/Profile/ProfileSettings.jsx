import React from 'react'
import Header from '../../common/Components/Header'
import { UseSideBarContext } from '../../Context/SideBarOpenProvider'
import Sidebar from '../../common/Components/Sidebar'
import ProfileSection from './Components/ProfileSection'

const ProfileSettings = () => {
  const { isSideBarOpen, setIsSiderOpen } = UseSideBarContext()
  return (
    <>
      <Header setIsSiderOpen={setIsSiderOpen} isSideBarOpen={isSideBarOpen} />
      <div className="w-full h-screen inline-flex overflow-hidden ">
        <Sidebar isSideBarOpen={isSideBarOpen} />
        <ProfileSection />
      </div>
    </>
  )
}

export default ProfileSettings
