import React from 'react'
import { UseSideBarContext } from '../../Context/SideBarOpenProvider'
import SettingVirtualAssistant from '../../common/Components/SettingVirtualAssistant'
import { useSelector } from 'react-redux'
import VirtualAssistant from './Components/VirtualAssistant'

const ChatBox = () => {
  const { isSideBarOpen, setIsSiderOpen } = UseSideBarContext()
  const { user } = useSelector(state => state.auth)

  if (user?.isAISet === 0) {
    return <SettingVirtualAssistant />
  }

  return <VirtualAssistant />
}

export default ChatBox
