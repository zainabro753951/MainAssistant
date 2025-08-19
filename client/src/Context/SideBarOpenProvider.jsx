import React, { createContext, useContext, useEffect, useState } from 'react'

const SideBarContext = createContext()

export const UseSideBarContext = () => useContext(SideBarContext)

export const SideBarOpenProvider = ({ children }) => {
  const [isSideBarOpen, setIsSiderOpen] = useState(true)

  useEffect(() => {
    const checkIsMobile = () => {
      const isMobile = window.matchMedia('(max-width: 768px)').matches
      setIsSiderOpen(!isMobile)
    }

    checkIsMobile() // Initial check

    window.addEventListener('resize', checkIsMobile) // Listen on resize

    return () => window.removeEventListener('resize', checkIsMobile) // Clean up
  }, [])

  return (
    <SideBarContext.Provider value={{ isSideBarOpen, setIsSiderOpen }}>
      {children}
    </SideBarContext.Provider>
  )
}

export default SideBarOpenProvider
