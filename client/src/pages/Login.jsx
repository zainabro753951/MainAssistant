import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import { login, logout } from '../features/auth'
import { useSocketContext } from '../Context/SocketProvder'
import { motion } from 'framer-motion'

const Login = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const dispatch = useDispatch()
  const { socket } = useSocketContext()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const formSubmit = async data => {
    const response = await axios.post(`${backendUrl}/login`, data, {
      withCredentials: true,
    })
    return response.data
  }

  // React Query Mutation
  const { mutate, isSuccess, data, error, isError } = useMutation({
    mutationFn: formSubmit,
  })

  useEffect(() => {
    if (isSuccess) {
      dispatch(login({ user: data?.user }))
      const userId = data?.user?.id
      socket.emit('user-join', userId)
    }

    if (isError) {
      toast.error(error?.response?.data?.message || 'Something went wrong!', {
        position: 'top-right',
        theme: 'dark',
        style: {
          backgroundColor: '#121B32',
          border: 'solid 1px #3f3eed',
          boxShadow: '0 0 15px #3f3eed',
        },
      })
      dispatch(logout())
    }

    return () => {
      socket.off('user-join')
    }
  }, [isSuccess, isError])

  const onSubmit = data => {
    mutate(data)
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1a] to-[#121b32] md:px-4 xs:px-2">
      <ToastContainer />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className=" md:w-[35vw] sm:w-[65vw] xs:w-[75vw] bg-[rgba(18,27,50,0.6)] backdrop-blur-xl border border-[#25345e] md:rounded-[1.5vw] sm:rounded-[2vw] xs:rounded-[2.5vw] shadow-2xl md:p-[1.5vw] sm:p-[3vw] xs:p-[4vw] font-grotesk-space"
      >
        {/* Headings */}
        <motion.h4
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:text-[1.4vw] sm:text-[2.4vw] xs:text-[3.9vw] text-theme-sky-blue font-semibold text-center"
        >
          Welcome Back
        </motion.h4>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:text-[2.5vw] sm:text-[3.5vw] xs:text-[5vw] font-bold text-center font-exo-space md:mb-[1vw] sm:mb-[1.5vw] xs:mb-[2vw] text-white"
        >
          Login to Continue
        </motion.h2>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          method="post"
          className="flex flex-col md:gap-[1.8vw] sm:gap-[2.3vw] xs:gap-[2.8vw]"
        >
          {/* Email */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-1"
          >
            <input
              type="text"
              className="md:py-[1vw] sm:py-[1.5vw] xs:py-[2vw] md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] bg-transparent border border-gray-600/60 md:rounded-[0.6vw] sm:rounded-[1.1vw] xs:rounded-[1.6vw] focus:ring-2 focus:ring-theme-sky-blue focus:border-theme-sky-blue outline-none placeholder:text-gray-400 text-white transition-all md:text-[1.3vw] sm:text-[2.3vw] xs:text-[3.8vw]"
              placeholder="Enter your email"
              {...register('email', {
                required: 'This field is required!',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && (
              <span className="md:text-[1.3vw] sm:text-[2.3vw] xs:text-[3.8vw] text-red-500">
                {errors.email.message}
              </span>
            )}
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-1"
          >
            <input
              type="password"
              className="md:py-[1vw] sm:py-[1.5vw] xs:py-[2vw] md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] bg-transparent border border-gray-600/60 md:rounded-[0.6vw] sm:rounded-[1.1vw] xs:rounded-[1.6vw] focus:ring-2 focus:ring-theme-sky-blue focus:border-theme-sky-blue outline-none placeholder:text-gray-400 text-white transition-all md:text-[1.3vw] sm:text-[2.3vw] xs:text-[3.8vw]"
              placeholder="Enter your password"
              {...register('password', { required: true })}
            />
            {errors.password && (
              <span className="md:text-[1.3vw] sm:text-[2.3vw] xs:text-[3.8vw] text-red-500">
                This field is required
              </span>
            )}
          </motion.div>

          {/* Remember Me */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 text-gray-300"
          >
            <input
              type="checkbox"
              id="rememberMe"
              className=" accent-theme-sky-blue"
              {...register('rememberMe')}
            />
            <label
              htmlFor="rememberMe"
              className="cursor-pointer md:text-[1.3vw] sm:text-[2.3vw] xs:text-[3.8vw] select-none"
            >
              Remember me
            </label>
          </motion.div>

          {/* Submit */}
          <motion.input
            type="submit"
            value="Login"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="md:py-[1vw] sm:py-[1.5vw] xs:py-[2vw] bg-theme-sky-blue text-white font-semibold cursor-pointer transition-all duration-300 hover:bg-white hover:text-theme-sky-blue shadow-md md:text-[1.3vw] sm:text-[2.3vw] xs:text-[3.8vw] md:rounded-[0.6vw] sm:rounded-[1.1vw] xs:rounded-[1.6vw]"
          />
        </form>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="md:mt-[1vw] sm:mt-[1.5vw] xs:mt-[2vw] text-center text-gray-300"
        >
          <span className="md:text-[1.3vw] sm:text-[2.3vw] xs:text-[3.8vw]">
            Don’t have an account?{' '}
            <Link to="/register" className="text-theme-sky-blue font-semibold hover:underline">
              Sign up
            </Link>
          </span>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Login
