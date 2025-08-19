import { useMutation } from '@tanstack/react-query'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { IoSend } from 'react-icons/io5'
import { addMessage, appendToLastAIMessage } from '../../features/AIResponse'
import { useDispatch } from 'react-redux'
import { toast, ToastContainer } from 'react-toastify'
import { useSocketContext } from '../../Context/SocketProvder'
import axios from 'axios'

const EnterMessage = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const { socket } = useSocketContext()
  const dispatch = useDispatch()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  // Function for sending prompt
  const sendPrompt = async prompt => {
    const response = await axios.post(`${backendUrl}/user/text-to-text-gen`, prompt, {
      withCredentials: true,
    })
    return response.data
  }

  // create mutation for sending prompt
  const { mutate, isError, isSuccess, data, error } = useMutation({
    mutationFn: sendPrompt,
  })

  const onSubmit = async data => {
    // Step 1: Show user message in chat
    dispatch(addMessage({ sender: 'user', message: data?.prompt }))

    // Step 2: Add empty AI message to update later
    dispatch(addMessage({ sender: 'ai', message: '' }))
    mutate(data)
    reset()
  }

  useEffect(() => {
    if (isSuccess) {
      console.log(data)
    }
    if (isError) {
      console.log(error)
    }
  }, [isSuccess, isError])

  useEffect(() => {
    socket.on('ai-realtimeMessage', data => {
      console.log(data)

      dispatch(appendToLastAIMessage(data?.message))
      console.log('AI says:', data)
    })

    return () => {
      socket.off('ai-realtimeMessage')
    }
  }, [])

  return (
    <form
      method="post"
      onSubmit={handleSubmit(onSubmit)}
      className="w-full rounded-md bg-[#121B32] border-2 border-[#19274d] py-1 px-1.5 flex items-center"
    >
      <ToastContainer />
      <div className="w-full relative px-3 flex flex-col items-center">
        <input
          type="text"
          className="md:py-[0.7vw] sm:py-[1.3vw] xs:py-[1.7vw] outline-none w-full md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw]"
          {...register('prompt', { required: true })}
        />
        {errors.prompt && (
          <span className="md:text-[0.9vw] sm:text-[1.9vw] xs:text-[3.4vw] text-red-500 absolute left-5 w-full top-1/2 -translate-y-1/2">
            Please enter a prompt!
          </span>
        )}
      </div>
      <button className="md:p-[0.7vw] sm:p-[1.3vw] xs:p-[1.7vw] flex items-center justify-center bg-white text-theme-sky-blue md:text-[1.3vw] sm:text-[2.1vw] xs:text-[3.6vw]">
        <IoSend />
      </button>
    </form>
  )
}

export default EnterMessage
