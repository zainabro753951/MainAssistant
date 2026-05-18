import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { login as reduxLogin, logout as reduxLogout } from '../features/auth';

const Login = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onBlur',
  });

  const formSubmit = async (data) => {
    const response = await axios.post(`${backendUrl}/login`, data, {
      withCredentials: true,
    });
    return response.data;
  };

  const { mutate, isSuccess, data, error, isError } = useMutation({
    mutationFn: formSubmit,
  });

  useEffect(() => {
    if (isSuccess && data) {
      toast.success(data.message || 'Welcome back!', {
        position: 'top-right',
        theme: 'dark',
        style: {
          backgroundColor: '#121B32',
          border: '1px solid #3f3eed',
          boxShadow: '0 0 15px rgba(63, 62, 237, 0.3)',
        },
      });

      dispatch(reduxLogin({ user: data.user, token: data.token }));
      navigate('/dashboard', { replace: true });
    }

    if (isError) {
      const errorData = error?.response?.data;
      let message = 'Login failed. Please try again.';

      if (errorData?.message) {
        message = errorData.message;
      }

      // Show detailed validation errors if present
      if (errorData?.errorCode === 'VALIDATION_ERROR' && errorData?.errors?.length > 0) {
        toast.error(message, {
          position: 'top-right',
          theme: 'dark',
          style: { backgroundColor: '#121B32', border: '1px solid #d34b4b' },
        });
        // Optionally map server errors to fields here
      } else {
        toast.error(message, {
          position: 'top-right',
          theme: 'dark',
          style: { backgroundColor: '#121B32', border: '1px solid #d34b4b' },
        });
      }

      dispatch(reduxLogout());
    }
  }, [isSuccess, isError, data, dispatch, navigate]);

  const onSubmit = (payload) => {
    mutate(payload);
  };

  return (
    <div className="w-full min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-[#0a0f1a] to-[#121b32] md:px-4 xs:px-2">
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
          className="flex flex-col md:gap-[1.8vw] sm:gap-[2.3vw] xs:gap-[2.8vw]"
          noValidate
        >
          {/* Email */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-1"
          >
            <input
              type="email"
              className={`md:py-[1vw] sm:py-[1.5vw] xs:py-[2vw] md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] bg-transparent border md:rounded-[0.6vw] sm:rounded-[1.1vw] xs:rounded-[1.6vw] focus:ring-2 focus:ring-theme-sky-blue focus:border-theme-sky-blue outline-none placeholder:text-gray-400 text-white transition-all md:text-[1.3vw] sm:text-[2.3vw] xs:text-[3.8vw] ${
                errors.email ? 'border-red-500' : 'border-gray-600/60'
              }`}
              placeholder="Enter your email"
              {...register('email', {
                required: 'Email address is required!',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Please enter a valid email address.',
                },
              })}
            />
            {errors.email && (
              <span className="md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] text-red-500">
                {errors.email.message}
              </span>
            )}
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-1 relative"
          >
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`w-full md:py-[1vw] sm:py-[1.5vw] xs:py-[2vw] md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] bg-transparent border md:rounded-[0.6vw] sm:rounded-[1.1vw] xs:rounded-[1.6vw] focus:ring-2 focus:ring-theme-sky-blue focus:border-theme-sky-blue outline-none placeholder:text-gray-400 text-white transition-all md:text-[1.3vw] sm:text-[2.3vw] xs:text-[3.8vw] ${
                  errors.password ? 'border-red-500' : 'border-gray-600/60'
                }`}
                placeholder="Enter your password"
                {...register('password', { required: 'Password is required!' })}
              />
              <button
                type="button"
                className="absolute right-[1.5vw] top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && (
              <span className="md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] text-red-500">
                {errors.password.message}
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
              className="accent-theme-sky-blue w-4 h-4"
              {...register('rememberMe')}
            />
            <label
              htmlFor="rememberMe"
              className="cursor-pointer md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] select-none"
            >
              Remember me
            </label>
          </motion.div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            className={`md:py-[1vw] sm:py-[1.5vw] xs:py-[2vw] text-white font-semibold transition-all duration-300 shadow-md md:text-[1.3vw] sm:text-[2.3vw] xs:text-[3.8vw] md:rounded-[0.6vw] sm:rounded-[1.1vw] xs:rounded-[1.6vw] ${
              isSubmitting
                ? 'bg-gray-600 cursor-not-allowed opacity-70'
                : 'bg-theme-sky-blue hover:bg-white hover:text-theme-sky-blue cursor-pointer'
            }`}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="md:mt-[1vw] sm:mt-[1.5vw] xs:mt-[2vw] text-center text-gray-300"
        >
          <span className="md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw]">
            Don't have an account?{' '}
            <Link to="/register" className="text-theme-sky-blue font-semibold hover:underline">
              Sign up
            </Link>
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
