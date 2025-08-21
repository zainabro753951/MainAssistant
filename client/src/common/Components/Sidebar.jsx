// src/common/Components/Sidebar.jsx
import React, { useState, useEffect } from 'react'
import { GoHome } from 'react-icons/go'
import { FaRegFolder } from 'react-icons/fa'
import { TbMessageChatbot, TbLogout } from 'react-icons/tb'
import { IoImageOutline } from 'react-icons/io5'
import { FiEdit, FiSettings } from 'react-icons/fi'
import { FaRegUser, FaAngleDown } from 'react-icons/fa6'
import { HiOutlineLogin } from 'react-icons/hi'
import { PiUsersThree } from 'react-icons/pi'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useDispatch, useSelector } from 'react-redux'
import useLogout from '../../Context/UseLogout'
import ThemeReloader from './ThemeReloader'
import { logout } from '../../features/auth'

const Sidebar = ({ isSideBarOpen }) => {
  const dispatch = useDispatch()
  const [isSettingOpen, setIsSettingOpen] = useState(false)
  const { user } = useSelector(state => state.auth)

  const sideBarLinks = [
    { path: '/', LinkIcon: <GoHome />, LinkName: 'Home' },
    { path: '/file-manager', LinkIcon: <FaRegFolder />, LinkName: 'File Manager' },
    { path: '/virtual-ai-assistant', LinkIcon: <TbMessageChatbot />, LinkName: 'AI Assistant' },
    { path: '/image-generator', LinkIcon: <IoImageOutline />, LinkName: 'Image Generator' },
  ]

  const settings = [
    { path: '/faqs', LinkIcon: <FaRegUser />, LinkName: 'FAQs' },
    { path: '/login', LinkIcon: <HiOutlineLogin />, LinkName: 'Login' },
    { path: '/reset-password', LinkIcon: <PiUsersThree />, LinkName: 'Reset Password' },
  ]

  const { mutate, isPending, isError, isSuccess, error } = useLogout()

  const handleLogout = () => mutate()

  useEffect(() => {
    if (isError) console.log(error)
    if (isSuccess) dispatch(logout())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError, isSuccess])

  if (isPending) return <ThemeReloader />

  return (
    <motion.div
      className={`flex flex-col justify-between sticky top-0 left-0 min-h-screen
        bg-[#0b1224]/80 backdrop-blur-xl border-r border-[#1c2750] shadow-[0_0_25px_rgba(20,30,80,0.3)]
        transition-all duration-300 overflow-hidden
        ${
          isSideBarOpen
            ? 'md:min-w-[21.5vw] md:pt-[5.2vw]'
            : 'xs:w-fit xs:pt-[9vw] sm:pt-[7.5vw] md:pt-[5.2vw]'
        }`}
    >
      {/* Links */}
      <div className="w-full flex flex-col items-center overflow-auto sidebar-scrollbar">
        <div
          className={`${
            isSideBarOpen ? 'w-full md:px-[1.6vw]' : 'sm:px-[0.6vw] xs:py-[2.4vw]'
          } flex flex-col gap-[0.6vw] md:gap-[0.8vw]`}
        >
          {sideBarLinks.map((link, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              className="w-full rounded-[0.8vw] transition-all duration-300"
            >
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-[0.9vw] md:px-[1vw] sm:px-[0.8vw] xs:px-[0.9vw]
                  ${isSideBarOpen ? 'md:py-[1.2vw] sm:py-[1.8vw] xs:py-[2.2vw]' : 'py-[1.1vw]'}
                  font-grotesk-space font-semibold tracking-wide rounded-[0.8vw]
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-[#1C1C6C] to-[#142447] text-theme-sky-blue shadow-md'
                      : 'hover:bg-[#161A24]'
                  }`
                }
              >
                <span className="text-[1.6vw] md:text-[1.4vw] sm:text-[2.4vw] xs:text-[3.6vw] text-gray-300">
                  {link.LinkIcon}
                </span>
                {isSideBarOpen && (
                  <p className="md:text-[1.05vw] sm:text-[1.9vw] xs:text-[3.2vw] truncate">
                    {link.LinkName}
                  </p>
                )}
              </NavLink>
            </motion.div>
          ))}
        </div>

        {/* Register + Settings */}
        <div
          className={`${
            isSideBarOpen ? 'w-full md:px-[1.6vw]' : 'sm:px-[0.6vw] xs:py-[2.4vw]'
          } flex flex-col gap-[0.6vw] md:gap-[0.8vw]`}
        >
          <NavLink
            to={'/register'}
            className="flex items-center gap-[0.9vw] md:px-[1vw] sm:px-[0.8vw] xs:px-[0.9vw] md:py-[1.2vw] sm:py-[1.8vw] xs:py-[2.2vw]
              font-grotesk-space font-semibold tracking-wide rounded-[0.8vw] hover:bg-[#161A24] transition-all"
          >
            <FiEdit className="text-[1.4vw] md:text-[1.2vw] sm:text-[2.0vw] xs:text-[3.2vw]" />
            {isSideBarOpen && (
              <p className="md:text-[1.05vw] sm:text-[1.9vw] xs:text-[3.2vw]">Register</p>
            )}
          </NavLink>

          {/* Settings Dropdown */}
          <div className="flex flex-col relative">
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsSettingOpen(!isSettingOpen)}
              className="flex items-center justify-between gap-[0.9vw] md:px-[1vw] sm:px-[0.8vw] xs:px-[0.9vw]
                md:py-[1.2vw] sm:py-[1.8vw] xs:py-[2.2vw] font-grotesk-space font-semibold rounded-[0.8vw] cursor-pointer hover:bg-[#161A24] transition-all"
            >
              <div className="flex items-center gap-[0.9vw]">
                <FiSettings className="text-[1.4vw] md:text-[1.2vw] sm:text-[2.0vw] xs:text-[3.2vw]" />
                {isSideBarOpen && (
                  <p className="md:text-[1.05vw] sm:text-[1.9vw] xs:text-[3.2vw]">Settings</p>
                )}
              </div>

              {isSideBarOpen && (
                <motion.span animate={{ rotate: isSettingOpen ? 180 : 0 }} className="text-[1vw]">
                  <FaAngleDown className="text-[0.95vw] md:text-[0.9vw] sm:text-[1.7vw] xs:text-[2.8vw]" />
                </motion.span>
              )}
            </motion.div>

            <AnimatePresence>
              {isSettingOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28 }}
                  className={`flex flex-col mt-[0.6vw] ${
                    isSideBarOpen
                      ? 'md:px-[1.2vw]'
                      : 'absolute left-[3.8rem] bg-[#161A24] rounded-[0.8vw] p-[0.6vw] z-20'
                  }`}
                >
                  {settings.map((link, idx) => (
                    <NavLink
                      key={idx}
                      to={link.path}
                      className={({ isActive }) =>
                        `flex items-center gap-[0.6vw] py-[0.6vw] px-[0.8vw] rounded-[0.8vw] font-grotesk-space text-[0.95vw]
                        ${isActive ? 'text-theme-sky-blue' : 'text-gray-300 hover:text-white'}`
                      }
                    >
                      <span className="text-[1.1vw] md:text-[1.0vw] sm:text-[1.8vw] xs:text-[2.8vw]">
                        {link.LinkIcon}
                      </span>
                      {isSideBarOpen && <span className="truncate">{link.LinkName}</span>}
                    </NavLink>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>

            {/* Logout */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              onClick={handleLogout}
              className="flex items-center gap-[0.9vw] md:px-[1vw] sm:px-[0.8vw] xs:px-[0.9vw] md:py-[1.2vw] sm:py-[1.8vw] xs:py-[2.2vw]
                font-grotesk-space font-semibold text-red-400 hover:text-red-500 rounded-[0.8vw] cursor-pointer transition-all"
            >
              <TbLogout className="text-[1.4vw] md:text-[1.2vw] sm:text-[2.0vw] xs:text-[3.2vw]" />
              {isSideBarOpen && (
                <p className="md:text-[1.05vw] sm:text-[1.9vw] xs:text-[3.2vw]">Logout</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div
        className={`${
          isSideBarOpen ? 'md:px-[1.6vw] md:pb-[1.2vw]' : 'sm:px-[0.6vw] xs:py-[2.4vw]'
        }`}
      >
        <Link
          to={'/profile-settings'}
          className="flex items-center gap-[0.8vw] bg-[#121B32]/80 border border-[#19274d] rounded-[0.8vw] p-[0.9vw] hover:border-theme-sky-blue transition-all overflow-hidden"
        >
          <div className="w-[4.6vw] h-[4.6vw] md:w-[3.6vw] md:h-[3.6vw] sm:w-[5.2vw] sm:h-[5.2vw] xs:w-[7.2vw] xs:h-[7.2vw] flex items-center justify-center rounded-full bg-[#21262F] overflow-hidden shrink-0 border border-blue-700">
            <img
              src={user?.profileImage || '/images/userProfile/default-profile-image.jpg'}
              className="w-full h-full object-cover"
              alt="profile"
            />
          </div>
          {isSideBarOpen && (
            <div className="overflow-hidden min-w-0">
              <h2 className="font-semibold text-white md:text-[1.05vw] sm:text-[1.9vw] xs:text-[3.0vw] truncate">
                {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
              </h2>
              <p className="md:text-[0.85vw] sm:text-[1.6vw] xs:text-[2.6vw] text-gray-400 truncate">
                {user ? user.email : 'guest@email.com'}
              </p>
            </div>
          )}
        </Link>
      </div>
    </motion.div>
  )
}

export default Sidebar
