import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import AssistantImageSetting from './AssistantImageSetting'
import AssistantNameSetting from './AssistantNameSetting'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useDispatch } from 'react-redux'
import { login } from '../../features/auth'
import ThemeReloader from './ThemeReloader'

const SettingVirtualAssistant = () => {
  const [isNext, setIsNext] = useState(false)
  const [AssistantImage, setAssistantImage] = useState(null)
  const [AssistantName, setAssistantName] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)
  const dispatch = useDispatch()

  const backendUrl = import.meta.env.VITE_BACKEND_URL

  // Async POST function
  const PostAssistantSettings = async data => {
    const response = await axios.post(`${backendUrl}/ai-setting`, data, {
      withCredentials: true,
    })
    return response.data
  }

  // Mutation setup
  const { mutate, isSuccess, isError, data, error, isPending } = useMutation({
    mutationFn: PostAssistantSettings,
  })

  const handleToggleNext = () => {
    if (!isNext) {
      setIsNext(true)
      return
    }

    if (AssistantName && AssistantImage) {
      mutate({
        assistantName: AssistantName,
        AIAssistantImage: AssistantImage,
      })
    } else {
      toast.error('Please provide assistant name and image before proceeding.', {
        position: 'top-right',
        autoClose: 5000,
        theme: 'dark',
        style: {
          backgroundColor: '#121B32',
          border: 'solid 1px #3f3eed',
          boxShadow: '0 0 15px #3f3eed',
          width: '100%',
        },
      })
    }
  }

  useEffect(() => {
    if (isError) {
      toast.error(error?.response?.data?.message || 'Something went wrong.', {
        position: 'top-right',
        autoClose: 5000,
        theme: 'dark',
        style: {
          backgroundColor: '#121B32',
          border: 'solid 1px #3f3eed',
          boxShadow: '0 0 15px #3f3eed',
          width: '100%',
        },
      })
    }

    if (isSuccess) {
      toast.success(data?.message || 'Assistant saved successfully!', {
        position: 'top-right',
        autoClose: 5000,
        theme: 'dark',
        style: {
          backgroundColor: '#121B32',
          border: 'solid 1px #3f3eed',
          boxShadow: '0 0 15px #3f3eed',
          width: '100%',
        },
      })
      dispatch(login({ user: data?.user }))
    }
  }, [isSuccess, isError, error, data])

  if (isPending) {
    return <ThemeReloader />
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center md:p-[3vw] sm:py-[5vw] xs:py-[7vw]">
      <ToastContainer />

      <AnimatePresence mode="wait">
        {!isNext ? (
          <AssistantImageSetting
            AssistantImage={AssistantImage}
            setAssistantImage={setAssistantImage}
            selectedImageIndex={selectedImageIndex}
            setSelectedImageIndex={setSelectedImageIndex}
          />
        ) : (
          <AssistantNameSetting
            AssistantImage={AssistantImage}
            setAssistantName={setAssistantName}
          />
        )}
      </AnimatePresence>

      <div className="md:w-[85%] relative md:pb-[5.5vw] sm:pb-[7vw] xs:pb-[9vw]">
        <AnimatePresence mode="wait">
          {isNext && (
            <motion.button
              key="prev"
              initial={{ opacity: 0, backgroundColor: '#151a24', y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              whileHover={{ backgroundColor: '#ffffff', color: '#1C1C6C' }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsNext(false)}
              className="md:py-[0.7vw] sm:py-[1.2vw] xs:py-[1.7vw] md:px-[2.5vw] sm:px-[3vw] xs:px-[4.5vw] mt-3 bg-theme-lightBlue rounded-md font-grotesk-space font-semibold cursor-pointer md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] text-white absolute left-0"
            >
              Prev
            </motion.button>
          )}
        </AnimatePresence>

        <motion.button
          key="next"
          initial={{ opacity: 0, backgroundColor: '#3f3eed', y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          whileHover={{ backgroundColor: '#ffffff', color: '#1C1C6C' }}
          transition={{ duration: 0.3 }}
          onClick={handleToggleNext}
          className={`
            md:py-[0.7vw] sm:py-[1.2vw] xs:py-[1.7vw]
            md:px-[2.5vw] sm:px-[3vw] xs:px-[4.5vw]
            mt-3
            ${
              !AssistantImage
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-theme-sky-blue cursor-pointer'
            }
            text-white
            rounded-md
            font-grotesk-space
            font-semibold
            md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw]
            absolute right-0
          `}
          disabled={!AssistantImage}
        >
          Next
        </motion.button>
      </div>
    </div>
  )
}

export default SettingVirtualAssistant
