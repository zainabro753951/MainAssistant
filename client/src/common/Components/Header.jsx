import React, { useEffect, useState } from 'react'
import { BsLayoutSidebar } from 'react-icons/bs'
import { IoSearchOutline } from 'react-icons/io5'
import { IoMdNotificationsOutline } from 'react-icons/io'
import { AnimatePresence, motion } from 'motion/react'
import { MdOutlineArrowRightAlt } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../features/auth'
import ThemeReloader from './ThemeReloader'
import useLogout from '../../Context/UseLogout'

const Header = ({ setIsSiderOpen, isSideBarOpen }) => {
  const [isProfilePopOpen, setIsProfilePopOpen] = useState(false)
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  const { mutate, isPending, isError, isSuccess, error, data } = useLogout()
  const handleLogout = () => mutate()

  useEffect(() => {
    if (isError) console.log(error)
    if (isSuccess) {
      console.log(data?.message)
      dispatch(logout())
    }
  }, [isError, isSuccess])

  if (isPending) return <ThemeReloader />

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="
        fixed top-0 left-0 right-0 z-50
        md:px-[1.5vw] sm:px-[2vw] xs:px-[2.5vw] md:py-[0.7vw] sm:py-[1.2vw] xs:py-[1.7vw]
        bg-[rgba(15,17,38,0.7)] backdrop-blur-md border-b border-[#12203b]/40
        shadow-sm flex items-center justify-between text-white
      "
    >
      {/* Left: logo + sidebar toggle */}
      <div className="flex items-center md:gap-[1.5vw] sm:gap-[2vw] xs:gap-[2.5vw]">
        <img
          src="/images/logo-01.png"
          alt="IntellectAi logo"
          className="md:w-[10vw] sm:w-[15vw] xs:w-[20vw] object-contain"
        />

        {/* Sidebar toggle (desktop) */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsSiderOpen(!isSideBarOpen)}
          aria-label="Toggle sidebar"
          className={`
            hidden md:inline-flex items-center justify-center rounded-full
            transition-shadow duration-200
            ${
              isSideBarOpen
                ? 'bg-gradient-to-r from-[#1C1C6C] to-[#142447] shadow-md'
                : 'bg-transparent hover:bg-[#111422]'
            }
            md:w-[3.5vw] md:h-[3.5vw] sm:w-[5.5vw] sm:h-[5.5vw] xs:w-[7.5vw] xs:h-[7.5vw]
          `}
        >
          <BsLayoutSidebar className="md:text-[1.4vw] sm:text-[2.4vw] xs:text-[3.9vw]" />
        </motion.button>

        {/* Sidebar toggle (mobile) */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsSiderOpen(!isSideBarOpen)}
          aria-label="Toggle sidebar (mobile)"
          className="
            md:hidden inline-flex items-center justify-center rounded-full bg-[#10131b]
            md:w-[3.5vw] md:h-[3.5vw] sm:w-[5.5vw] sm:h-[5.5vw] xs:w-[7.5vw] xs:h-[7.5vw]
          "
        >
          <BsLayoutSidebar className="md:text-[1.4vw] sm:text-[2.4vw] xs:text-[3.9vw]" />
        </motion.button>
      </div>

      {/* Right: actions */}
      <div className="flex items-center md:gap-[1vw] sm:gap-[1.5vw] xs:gap-[2vw]">
        <button
          aria-label="Search"
          className="
            inline-flex items-center justify-center rounded-full bg-[#171a22]
            md:w-[3vw] md:h-[3vw] sm:w-[5vw] sm:h-[5vw] xs:w-[7vw] xs:h-[7vw]
            hover:shadow-sm transition
          "
        >
          <IoSearchOutline className="md:text-[1.4vw] sm:text-[2.4vw] xs:text-[3.9vw]" />
        </button>

        <button
          aria-label="Notifications"
          className="
            inline-flex items-center justify-center rounded-full bg-[#171a22]
            md:w-[3vw] md:h-[3vw] sm:w-[5vw] sm:h-[5vw] xs:w-[7vw] xs:h-[7vw]
            hover:shadow-sm transition
          "
        >
          <IoMdNotificationsOutline className="md:text-[1.4vw] sm:text-[2.4vw] xs:text-[3.9vw]" />
        </button>

        {/* Profile Avatar + Popover */}
        <div className="relative">
          <button
            onClick={() => setIsProfilePopOpen(prev => !prev)}
            aria-haspopup="dialog"
            aria-expanded={isProfilePopOpen}
            className="
              inline-flex items-center justify-center rounded-full overflow-hidden border border-[#163056]
              md:w-[3.5vw] md:h-[3.5vw] sm:w-[5.5vw] sm:h-[5.5vw] xs:w-[7.5vw] xs:h-[7.5vw]
              bg-[#121621]
            "
          >
            <img
              src={user?.profileImage || '/images/userProfile/default-profile-image.jpg'}
              alt="User avatar"
              className="w-full h-full object-cover"
            />
          </button>

          <AnimatePresence>
            {isProfilePopOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -6 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="absolute right-0 md:mt-[1vw] sm:mt-[1.5vw] xs:mt-[2vw] md:w-[22vw] sm:w-[42vw] xs:w-[52vw] z-50"
              >
                <div className="bg-[rgba(10,14,28,0.85)] backdrop-blur-md border border-[#18283f] rounded-lg overflow-hidden shadow-lg">
                  <Link
                    to="/profile-settings"
                    onClick={() => setIsProfilePopOpen(false)}
                    className="flex items-center md:gap-[1.5vw] sm:gap-[2vw] xs:gap-[2.5vw] md:p-[1vw] sm:p-[1.5vw] xs:p-[2vw] bg-gradient-to-b from-[#0b1226]/40 to-transparent"
                  >
                    <img
                      src={user?.profileImage || '/images/userProfile/default-profile-image.jpg'}
                      alt="User"
                      className="md:w-[3.5vw] md:h-[3.5vw] sm:w-[5.5vw] sm:h-[5.5vw] xs:w-[7.5vw] xs:h-[7.5vw] md:rounded-[0.6vw] sm:rounded-[1.1vw] xs:rounded-[1.6vw] object-cover border border-[#223655]"
                    />
                    <div className="truncate">
                      <h4 className="font-semibold md:text-[1.2vw] sm:text-[2.2vw] xs:text-[3.7vw]">
                        {user ? `${user?.firstName} ${user?.lastName}` : 'Zain Abro'}
                      </h4>
                      <p className="md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] text-white/60 truncate">
                        {user ? user?.email : 'zainabro886@gmail.com'}
                      </p>
                    </div>
                  </Link>

                  <div className="md:p-[1vw] sm:p-[2vw] xs:p-[2vw]">
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsProfilePopOpen(false)
                      }}
                      className="w-full flex items-center justify-center md:gap-[1vw] sm:gap-[1.5vw] xs:gap-[2vw] md:rounded-[0.6vw] sm:rounded-[1.1vw] xs:rounded-[1.6vw] bg-white text-[#1C1C6C] md:py-[0.7vw] sm:py-[1.2vw] xs:py-[1.7vw] font-semibold hover:shadow-md transition md:text-[1.2vw] sm:text-[2.2vw] xs:text-[3.7vw]"
                    >
                      <span>Logout</span>
                      <MdOutlineArrowRightAlt className="md:text-[1.2vw] sm:text-[2.2vw] xs:text-[3.7vw]" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
