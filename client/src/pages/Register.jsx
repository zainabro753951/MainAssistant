// src/pages/auth/Register.jsx
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaFacebookF } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { FiAlertCircle, FiCheck, FiCopy, FiExternalLink, FiEye, FiEyeOff } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const calcPasswordStrength = (pwd) => {
  let score = 0;
  if (!pwd) return { score, label: 'Very weak' };
  if (pwd.length >= 8) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  const label = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'][score];
  return { score, label };
};

const StrengthBar = ({ score = 0 }) => {
  const width = `${(score / 4) * 100}%`;
  const bg =
    score >= 4
      ? 'bg-emerald-500'
      : score >= 3
        ? 'bg-yellow-400'
        : score >= 2
          ? 'bg-orange-400'
          : 'bg-red-500';
  return (
    <div className="w-full bg-white/6 rounded md:h-[0.5vw] sm:h-[1vw] xs:h-[1.5vw] overflow-hidden">
      <div
        style={{ width }}
        className={`md:h-[0.5vw] sm:h-[1vw] xs:h-[1.5vw] ${bg} transition-all duration-300`}
      />
    </div>
  );
};

export default function Register() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onBlur' });

  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [serverErrors, setServerErrors] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const pwdValue = watch('password') || '';
  const email = watch('email') || '';
  const firstName = watch('firstName') || '';
  const lastName = watch('lastName') || '';
  const agreed = watch('isAgree') || false;

  const { score, label: pwdLabel } = useMemo(() => calcPasswordStrength(pwdValue), [pwdValue]);

  const progress = Math.round(
    ((!!firstName + !!lastName + !!email + !!pwdValue + (agreed ? 1 : 0)) / 5) * 100
  );

  const formSubmit = async (data) => {
    const res = await axios.post(`${backendUrl}/register`, {
      ...data,
      isAgree: data.isAgree === true || data.isAgree === 'true',
    });
    return res.data;
  };

  const { mutate, isSuccess, data, error, isError } = useMutation({
    mutationFn: formSubmit,
    onMutate: () => {
      setServerErrors([]);
      return { submitting: true };
    },
    onSettled: () => setServerErrors([]),
  });

  useEffect(() => {
    if (isSuccess && data) {
      toast.success(data.message || 'Account created successfully!', {
        position: 'top-right',
        autoClose: 4500,
        theme: 'dark',
        style: { backgroundColor: '#0f1724', border: '1px solid #3f3eed' },
      });

      const origin = window.location.origin;
      const ref = encodeURIComponent(data?.userId || email || '');
      setInviteUrl(`${origin}/invite?ref=${ref}`);

      reset();
    }
  }, [isSuccess, data, reset, email]);

  useEffect(() => {
    if (isError) {
      const errorData = error?.response?.data;
      const message = errorData?.message || 'Registration failed. Please try again.';

      if (errorData?.errorCode === 'VALIDATION_ERROR' && errorData?.errors) {
        setServerErrors(errorData.errors);
      } else if (errorData?.errorCode === 'EMAIL_EXISTS') {
        setError('email', { type: 'server', message: errorData.message });
      } else {
        toast.error(message, {
          position: 'top-right',
          autoClose: 4500,
          theme: 'dark',
          style: { backgroundColor: '#0f1724', border: '1px solid #d34b4b' },
        });
      }
    }
  }, [isError, error, setError]);

  const onSubmit = (payload) => mutate(payload);

  const handleCopyInvite = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success('Invite link copied!', { position: 'top-right', theme: 'dark' });
      setTimeout(() => setCopied(false), 1400);
    } catch {
      toast.error('Copy failed', { position: 'top-right', theme: 'dark' });
    }
  };

  const getFieldServerError = (field) => {
    if (!serverErrors) return '';
    const err = serverErrors.find((e) => e.field === field);
    return err ? err.message : '';
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-b from-[#071225] to-[#041026] md:p-[1.5vw] sm:p-[2vw] xs:p-[2.5vw]">
      <ToastContainer />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="md:w-[80vw] sm:w-[90vw] xs:w-full mx-auto md:rounded-[1.5vw] sm:rounded-[2vw] xs:rounded-[2.5vw] bg-[rgba(15,17,38,0.85)] backdrop-blur-md border border-[#12203b] shadow-2xl overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* left - visual + social */}
          <div className="hidden md:flex flex-col md:gap-[2vw] sm:gap-[2.5vw] xs:gap-[3vw] md:p-[2vw] sm:p-[2.5vw] xs:p-[3vw] bg-gradient-to-b from-[#0f1230]/40 to-transparent border-r border-[#12203b]">
            <div>
              <h3 className="md:text-[1.7vw] sm:text-[2.7vw] xs:text-[4.2vw] font-exo-space font-bold text-indigo-200 mb-3">
                Start your journey
              </h3>
              <p className="md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] text-white/70 ">
                Create, publish and monetize content using the power of AI — voice, images and more.
                Sign up to unlock creator tools, monetization & collaboration features.
              </p>
            </div>
            <div className="w-full h-full">
              <img
                src="/images/AI-agents.webp"
                className=" w-full h-full rounded-lg object-cover"
                alt="AI Agents"
              />
            </div>

            <div className="md:mt-[1.5vw] sm:mt-[2vw] xs:mt-[2.5vw]">
              <div className="md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] text-white/70 mb-3">
                Or sign up quickly with
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-3 md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] md:py-[0.7vw] sm:py-[1.2vw] xs:py-[1.7vw] md:rounded-[0.5vw] sm:rounded-[1vw] xs:rounded-[1.5vw] bg-white/95 text-black font-semibold shadow-sm hover:scale-102 transform transition md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw]"
                  onClick={() => (window.location.href = `${backendUrl}/auth/google`)}
                >
                  <FcGoogle /> Continue with Google
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-3 md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] md:py-[0.7vw] sm:py-[1.2vw] xs:py-[1.7vw] md:rounded-[0.5vw] sm:rounded-[1vw] xs:rounded-[1.5vw] bg-[#1877f2]/90 text-white font-semibold shadow-sm hover:scale-102 transform transition md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw]"
                  onClick={() => (window.location.href = `${backendUrl}/auth/facebook`)}
                >
                  <FaFacebookF /> Facebook
                </button>
              </div>

              <div className="md:mt-[1.5vw] sm:mt-[2vw] xs:mt-[2.5vw] md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] text-white/60">
                By signing up you agree to our{' '}
                <Link to="/terms" className="text-indigo-300 underline">
                  Terms & Privacy
                </Link>
                .
              </div>
            </div>
          </div>

          {/* right - form */}
          <div className="md:p-[1.5vw] sm:p-[2vw] xs:p-[2.5vw]">
            <div className="md:mb-[1vw] sm:mb-[1.5vw] xs:mb-[2vw]">
              <h2 className="md:text-[1.7vw] sm:text-[2.7vw] xs:text-[4.2vw] font-exo-space font-bold text-white">
                Create an account
              </h2>
              <p className="md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] text-white/60 md:mb-[0.3vw] sm:mb-[0.8vw] xs:mb-[1.3vw]">
                Start building on IntellectAi — free to start
              </p>
            </div>

            {/* progress */}
            <div className="md:mb-[1vw] sm:mb-[1.5vw] xs:mb-[2vw]">
              <div className="flex items-center justify-between md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] text-white/60 md:mb-[0.3vw] sm:mb-[0.8vw] xs:mb-[1.3vw]">
                <span>Profile progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-white/6 md:h-[0.5vw] sm:h-[1vw] xs:h-[1.5vw] rounded overflow-hidden">
                <div
                  className="md:h-[0.5vw] sm:h-[1vw] xs:h-[1.5vw] bg-gradient-to-r from-indigo-500 to-sky-400 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="md:space-y-[1.1vw] sm:space-y-[1.6vw] xs:space-y-[2.1vw]"
              noValidate
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:gap-[0.9vw] sm:gap-[1.4vw] xs:gap-[1.9vw]">
                <div className="flex flex-col">
                  <label
                    className="md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] text-white/60 md:mb-[0.3vw] sm:mb-[0.8vw] xs:mb-[1.3vw]"
                    htmlFor="firstName"
                  >
                    First name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    placeholder="First name"
                    className={`md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] md:py-[0.7vw] sm:py-[1.2vw] xs:py-[1.7vw] md:rounded-[0.5vw] sm:rounded-[1vw] xs:rounded-[1.5vw] bg-[#091022] border text-white outline-none focus:ring-2 focus:ring-indigo-500 md:text-[1.2vw] sm:text-[2.2vw] xs:text-[3.7vw] ${errors.firstName || getFieldServerError('firstName') ? 'border-red-500' : 'border-[#1b2a44]'}`}
                    {...register('firstName', {
                      required: 'First name is required.',
                      minLength: { value: 2, message: 'First name must be at least 2 characters.' },
                    })}
                    aria-invalid={errors.firstName ? 'true' : 'false'}
                  />
                  {(errors.firstName || getFieldServerError('firstName')) && (
                    <span className="md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] text-red-400 md:mb-[0.3vw] sm:mb-[0.8vw] xs:mb-[1.3vw] flex items-center gap-1">
                      <FiAlertCircle className="text-xs" />
                      {errors.firstName?.message || getFieldServerError('firstName')}
                    </span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label
                    className="md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] text-white/60 md:mb-[0.3vw] sm:mb-[0.8vw] xs:mb-[1.3vw]"
                    htmlFor="lastName"
                  >
                    Last name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Last name"
                    className={`md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] md:py-[0.7vw] sm:py-[1.2vw] xs:py-[1.7vw] md:rounded-[0.5vw] sm:rounded-[1vw] xs:rounded-[1.5vw] bg-[#091022] border text-white outline-none focus:ring-2 focus:ring-indigo-500 md:text-[1.2vw] sm:text-[2.2vw] xs:text-[3.7vw] ${errors.lastName || getFieldServerError('lastName') ? 'border-red-500' : 'border-[#1b2a44]'}`}
                    {...register('lastName', {
                      required: 'Last name is required.',
                      minLength: { value: 2, message: 'Last name must be at least 2 characters.' },
                    })}
                    aria-invalid={errors.lastName ? 'true' : 'false'}
                  />
                  {(errors.lastName || getFieldServerError('lastName')) && (
                    <span className="md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] text-red-400 md:mb-[0.3vw] sm:mb-[0.8vw] xs:mb-[1.3vw] flex items-center gap-1">
                      <FiAlertCircle className="text-xs" />
                      {errors.lastName?.message || getFieldServerError('lastName')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                <label
                  className="md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] text-white/60 md:mb-[0.3vw] sm:mb-[0.8vw] xs:mb-[1.3vw]"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  className={`md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] md:py-[0.7vw] sm:py-[1.2vw] xs:py-[1.7vw] md:rounded-[0.5vw] sm:rounded-[1vw] xs:rounded-[1.5vw] bg-[#091022] border text-white outline-none focus:ring-2 focus:ring-indigo-500 md:text-[1.2vw] sm:text-[2.2vw] xs:text-[3.7vw] ${errors.email ? 'border-red-500' : 'border-[#1b2a44]'}`}
                  {...register('email', {
                    required: 'Email address is required.',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Please enter a valid email address.',
                    },
                  })}
                  aria-invalid={errors.email ? 'true' : 'false'}
                />
                {errors.email && (
                  <span className="md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] text-red-400 md:mb-[0.3vw] sm:mb-[0.8vw] xs:mb-[1.3vw] flex items-center gap-1">
                    <FiAlertCircle className="text-xs" />
                    {errors.email.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col relative">
                <label
                  className="md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] text-white/60 md:mb-[0.3vw] sm:mb-[0.8vw] xs:mb-[1.3vw]"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Create a password"
                    className={`w-full md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] md:py-[0.7vw] sm:py-[1.2vw] xs:py-[1.7vw] md:rounded-[0.5vw] sm:rounded-[1vw] xs:rounded-[1.5vw] bg-[#091022] border text-white outline-none focus:ring-2 focus:ring-indigo-500 pr-10 md:text-[1.2vw] sm:text-[2.2vw] xs:text-[3.7vw] ${errors.password || getFieldServerError('password') ? 'border-red-500' : 'border-[#1b2a44]'}`}
                    {...register('password', {
                      required: 'Password is required.',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters long.',
                      },
                      maxLength: {
                        value: 128,
                        message: 'Password must not exceed 128 characters.',
                      },
                      validate: (val) => {
                        if (!/[A-Z]/.test(val))
                          return 'Password must contain at least one uppercase letter.';
                        if (!/[a-z]/.test(val))
                          return 'Password must contain at least one lowercase letter.';
                        if (!/[0-9]/.test(val)) return 'Password must contain at least one number.';
                        if (!/[^A-Za-z0-9]/.test(val))
                          return 'Password must contain at least one special character (e.g., !@#$%^&*).';
                        return true;
                      },
                    })}
                    aria-invalid={errors.password ? 'true' : 'false'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute md:right-[1vw] sm:right-[1.5vw] xs:right-[2vw] top-1/2 -translate-y-1/2 text-white/70 md:text-[1.2vw] sm:text-[2.2vw] xs:text-[3.7vw]"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                <div className="mt-2 flex items-center md:gap-[1vw] sm:gap-[1.5vw] xs:gap-[2vw]">
                  <StrengthBar score={score} />
                  <div className="md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] text-white/60 md:w-[6vw] sm:w-[8vw] xs:w-[9vw] text-right ">
                    {pwdLabel}
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] text-white/50">
                  <div className={pwdValue.length >= 8 ? 'text-white/80' : ''}>
                    • Minimum 8 characters
                  </div>
                  <div className={/[A-Z]/.test(pwdValue) ? 'text-white/80' : ''}>
                    • Uppercase letter
                  </div>
                  <div className={/[0-9]/.test(pwdValue) ? 'text-white/80' : ''}>• Number</div>
                  <div className={/[^A-Za-z0-9]/.test(pwdValue) ? 'text-white/80' : ''}>
                    • Symbol
                  </div>
                </div>

                {(errors.password || getFieldServerError('password')) && (
                  <span className="md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] text-red-400 md:mb-[0.3vw] sm:mb-[0.8vw] xs:mb-[1.3vw] flex items-center gap-1">
                    <FiAlertCircle className="text-xs" />
                    {errors.password?.message || getFieldServerError('password')}
                  </span>
                )}
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  id="isAgree"
                  type="checkbox"
                  className="md:mb-[0.3vw] sm:mb-[0.8vw] xs:mb-[1.3vw] w-4 h-4 accent-indigo-400 cursor-pointer"
                  {...register('isAgree', {
                    required: 'You must agree to the Terms & Conditions and Privacy Policy.',
                  })}
                  aria-invalid={errors.isAgree ? 'true' : 'false'}
                />
                <label
                  htmlFor="isAgree"
                  className="md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] text-white/70 cursor-pointer"
                >
                  I agree to the{' '}
                  <Link to="/terms" className="text-indigo-300 underline hover:text-indigo-400">
                    privacy policy & terms
                  </Link>
                </label>
              </div>
              {errors.isAgree && (
                <div className="md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] text-red-400 flex items-center gap-1">
                  <FiAlertCircle className="text-xs" /> {errors.isAgree.message}
                </div>
              )}
              {getFieldServerError('isAgree') && (
                <div className="md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] text-red-400 flex items-center gap-1">
                  <FiAlertCircle className="text-xs" /> {getFieldServerError('isAgree')}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full inline-flex items-center justify-center gap-2 md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] md:py-[0.7vw] sm:py-[1.2vw] xs:py-[1.7vw] md:rounded-[0.5vw] sm:rounded-[1vw] xs:rounded-[1.5vw] text-white font-semibold transition md:text-[1.3vw] sm:text-[2.3vw] xs:text-[3.8vw] ${
                  isSubmitting
                    ? 'bg-indigo-500/70 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 00-12 12h4z"
                      ></path>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="mt-4 flex items-center justify-between md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] text-white/60">
              <div>
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-300 font-semibold hover:text-indigo-200">
                  Sign in
                </Link>
              </div>
            </div>

            {/* Invite / Share area */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={inviteUrl ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
              className="overflow-hidden"
            >
              {inviteUrl && (
                <div className="md:mt-[1.5vw] sm:mt-[2vw] xs:mt-[2.5vw] bg-[rgba(255,255,255,0.02)] border border-[#15314a] md:rounded-[0.5vw] sm:rounded-[1vw] xs:rounded-[1.5vw] p-3 flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="md:text-[1vw] sm:text-[2vw] xs:text-[3.5vw] text-white/60">
                      Share your invite link
                    </div>
                    <div className="md:mb-[0.3vw] sm:mb-[0.8vw] xs:mb-[1.3vw] flex items-center gap-2 bg-transparent">
                      <input
                        value={inviteUrl}
                        readOnly
                        className="min-w-0 truncate bg-transparent md:text-[1.1vw] sm:text-[2.1vw] xs:text-[3.6vw] text-white/80 outline-none"
                        title={inviteUrl}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyInvite}
                      className={`inline-flex items-center gap-2 md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] md:py-[0.7vw] sm:py-[1.2vw] xs:py-[1.7vw] md:rounded-[0.5vw] sm:rounded-[1vw] xs:rounded-[1.5vw] font-semibold transition ${
                        copied
                          ? 'bg-green-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      {copied ? (
                        <>
                          <FiCheck /> Copied
                        </>
                      ) : (
                        <>
                          <FiCopy /> Copy
                        </>
                      )}
                    </button>

                    <a
                      href={inviteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 md:px-[1vw] sm:px-[1.5vw] xs:px-[2vw] md:py-[0.7vw] sm:py-[1.2vw] xs:py-[1.7vw] md:rounded-[0.5vw] sm:rounded-[1vw] xs:rounded-[1.5vw] border border-white/10 text-white/80 hover:bg-white/5"
                    >
                      <FiExternalLink /> Open
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
