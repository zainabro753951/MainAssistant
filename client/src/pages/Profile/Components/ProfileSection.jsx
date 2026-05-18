// src/pages/auth/ProfileSection.jsx
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiAlertCircle, FiCheck, FiTrash2 } from 'react-icons/fi';
import { TbEdit } from 'react-icons/tb';
import { useDispatch, useSelector } from 'react-redux';
import { PulseLoader } from 'react-spinners';
import { toast, ToastContainer } from 'react-toastify';
import { login } from '../../../features/auth';

const DEFAULT_AVATAR = '/images/userProfile/default-profile-image.jpg';
const DEFAULT_BANNER = '/images/userProfile/default-black-banner.png';

export default function ProfileSection() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Previews and files
  const [profilePreview, setProfilePreview] = useState(DEFAULT_AVATAR);
  const [bannerPreview, setBannerPreview] = useState(DEFAULT_BANNER);
  const [profileFile, setProfileFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  // Upload progress
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Drag state for banner
  const [isDragOver, setIsDragOver] = useState(false);
  const bannerDropRef = useRef(null);

  // Server-side field errors
  const [serverFieldErrors, setServerFieldErrors] = useState({});

  // Initialize previews from user
  useEffect(() => {
    if (user) {
      setProfilePreview(user.profileImage || DEFAULT_AVATAR);
      setBannerPreview(user.bannerImage || DEFAULT_BANNER);
    }
  }, [user]);

  // React-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      bio: user?.bio || '',
    },
  });

  // Helper: create preview
  const createPreview = (file, setPreview, setFile) => {
    if (!file) return;
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.', { theme: 'dark' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    setFile(file);
  };

  // Handle banner drag/drop
  const handleBannerDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    createPreview(file, setBannerPreview, setBannerFile);
  };

  const handleBannerSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    createPreview(file, setBannerPreview, setBannerFile);
  };

  const handleProfileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    createPreview(file, setProfilePreview, setProfileFile);
  };

  // Profile update mutation
  const mutation = useMutation({
    mutationFn: (formData) =>
      axios.post(`${backendUrl}/user/update-profile`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(pct);
        },
      }),
    onMutate: () => {
      setIsUploading(true);
      setUploadProgress(0);
      setServerFieldErrors({}); // Clear previous server errors
    },
    onSettled: () => {
      setIsUploading(false);
      setUploadProgress(0);
    },
    onSuccess: (res) => {
      const data = res?.data;
      if (data?.success) {
        toast.success(data.message || 'Profile updated successfully!', {
          theme: 'dark',
          style: { backgroundColor: '#0f1724', border: '1px solid #3f3eed' },
        });

        // Update Redux store with new user data
        dispatch(login({ user: data.data }));

        // Reset file states but keep previews (which are now updated)
        setProfileFile(null);
        setBannerFile(null);
      } else {
        toast.error(data?.message || 'Update failed', { theme: 'dark' });
      }
    },
    onError: (err) => {
      const errorData = err?.response?.data;
      if (errorData?.errorCode === 'VALIDATION_ERROR' && errorData?.errors) {
        // Map server errors to fields
        const fieldErrors = {};
        errorData.errors.forEach((e) => {
          fieldErrors[e.field] = e.message;
        });
        setServerFieldErrors(fieldErrors);

        toast.error('Please correct the errors in your profile form.', {
          theme: 'dark',
          style: { backgroundColor: '#0f1724', border: '1px solid #d34b4b' },
        });
      } else {
        toast.error(
          errorData?.message || 'We were unable to update your profile. Please try again later.',
          {
            theme: 'dark',
            style: { backgroundColor: '#0f1724', border: '1px solid #d34b4b' },
          }
        );
      }
    },
  });

  const onSubmit = (values) => {
    const fd = new FormData();
    fd.append('id', user?.id || '');
    fd.append('firstName', values.firstName?.trim() || '');
    fd.append('lastName', values.lastName?.trim() || '');
    fd.append('email', values.email?.trim() || '');
    fd.append('phoneNumber', values.phoneNumber?.trim() || '');
    fd.append('bio', values.bio?.trim() || '');

    // Append files only if they exist/changed
    if (profileFile) fd.append('profileImage', profileFile);
    if (bannerFile) fd.append('bannerImage', bannerFile);

    mutation.mutate(fd);
  };

  const removeProfile = () => {
    setProfileFile(null);
    setProfilePreview(user?.profileImage || DEFAULT_AVATAR);
    // Note: Backend handles null/undefined by keeping existing or removing based on logic.
    // If you want to remove it entirely, you might need a specific flag or send null if API supports it.
    // For now, this resets the preview to default/existing in UI.
    toast.info('Avatar preview reset to default', { theme: 'dark' });
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview(user?.bannerImage || DEFAULT_BANNER);
    toast.info('Banner preview reset to default', { theme: 'dark' });
  };

  // Helper to get error message (client-side or server-side)
  const getErrorMessage = (fieldName) => {
    return errors[fieldName]?.message || serverFieldErrors[fieldName];
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="min-h-[60vh] w-full max-w-[92vw] mx-auto md:px-[4vw] sm:px-[5vw] xs:px-[6vw] py-[2vw] overflow-auto sidebar-scrollbar"
    >
      <ToastContainer />

      {/* outer glass card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl bg-[rgba(15,17,38,0.65)] backdrop-blur-md border border-[#12203b] shadow-2xl overflow-hidden"
      >
        {/* subtle background accents */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-[6vw] -left-[6vw] h-[36vw] w-[36vw] rounded-full bg-indigo-600/14 blur-3xl" />
          <div className="absolute -bottom-[5vw] -right-[6vw] h-[28vw] w-[28vw] rounded-full bg-fuchsia-500/8 blur-3xl" />
        </div>

        {/* banner area (drag/drop) */}
        <div
          ref={bannerDropRef}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleBannerDrop}
          className={`w-full h-[22vw] md:h-[22vw] sm:h-[32vw] xs:h-[40vw] relative transition-all ${
            isDragOver ? 'ring-2 ring-indigo-400/30' : ''
          }`}
        >
          <img
            src={bannerPreview}
            alt="banner"
            className="w-full h-full object-cover brightness-[0.96]"
            draggable={false}
          />

          <div className="absolute left-[1.2vw] bottom-[1.2vw] flex items-center gap-[0.6vw]">
            <label
              htmlFor="bannerInput"
              className="inline-flex items-center gap-[0.6vw] bg-white/6 hover:bg-white/10 text-white/90 px-[0.9vw] py-[0.6vw] rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <TbEdit className="md:text-[1.2vw] sm:text-[2.4vw] xs:text-[3.8vw]" />
              <span className="hidden sm:inline text-[0.9vw]">Change banner</span>
              <input
                id="bannerInput"
                type="file"
                name="bannerImage"
                accept="image/*"
                hidden
                onChange={handleBannerSelect}
              />
            </label>

            <button
              type="button"
              onClick={removeBanner}
              className="inline-flex items-center gap-[0.4vw] bg-white/5 hover:bg-white/10 px-[0.9vw] py-[0.6vw] rounded-full text-white/90"
            >
              <FiTrash2 className="md:text-[1vw] sm:text-[2.1vw] xs:text-[3.6vw]" />
              <span className="hidden sm:inline text-[0.9vw]">Remove</span>
            </button>
          </div>

          {/* upload progress badge */}
          {isUploading && (
            <div className="absolute right-[1.2vw] top-[1.2vw] bg-black/50 px-[0.8vw] py-[0.4vw] rounded-full text-xs text-white/90">
              Uploading {uploadProgress}% <span className="ml-[0.4vw]">⏳</span>
            </div>
          )}
        </div>

        {/* main content */}
        <div className="px-[1.2vw] md:px-[2.2vw] pt-[1.6vw] pb-[2.4vw]">
          <div className="flex flex-col md:flex-row gap-[1.4vw]">
            {/* left: form */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-[1.2vw]">
                {/* avatar preview */}
                <div className="relative">
                  <div
                    className={`w-[10vw] h-[10vw] md:w-[10vw] md:h-[10vw] sm:w-[16vw] sm:h-[16vw] xs:w-[22vw] xs:h-[22vw] rounded-full overflow-hidden border-[0.6vw] border-[rgba(63,62,237,0.18)] bg-gradient-to-br from-indigo-700/20 to-sky-400/6 flex items-center justify-center ${
                      isUploading ? 'animate-pulse' : ''
                    }`}
                  >
                    <img src={profilePreview} alt="avatar" className="w-full h-full object-cover" />
                  </div>

                  <label
                    htmlFor="profileInput"
                    className="absolute -right-[0.6vw] -bottom-[0.6vw] inline-flex items-center justify-center w-[2.6vw] h-[2.6vw] md:w-[2.6vw] md:h-[2.6vw] sm:w-[4.6vw] sm:h-[4.6vw] xs:w-[6.2vw] xs:h-[6.2vw] rounded-full bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                    title="Change avatar"
                  >
                    <input
                      id="profileInput"
                      type="file"
                      name="profileImage"
                      accept="image/*"
                      hidden
                      onChange={handleProfileSelect}
                    />
                    <TbEdit className="md:text-[1vw] sm:text-[1.9vw] xs:text-[3.2vw]" />
                  </label>
                </div>

                <div className="flex-1">
                  <h3 className="text-[1.8vw] md:text-[1.4vw] sm:text-[2.6vw] xs:text-[4vw] font-bold text-white">
                    User Profile
                  </h3>
                  <p className="text-[0.9vw] md:text-[0.9vw] sm:text-[1.9vw] xs:text-[3.2vw] text-white/70 mt-[0.4vw]">
                    Update your information and images.
                  </p>

                  <div className="mt-[0.9vw] flex gap-[0.6vw]">
                    <button
                      type="button"
                      onClick={removeProfile}
                      className="px-[0.9vw] py-[0.6vw] rounded-md bg-white/5 hover:bg-white/10 text-white/80 text-[0.9vw]"
                    >
                      <FiTrash2 className="inline md:text-[0.9vw] sm:text-[1.8vw] xs:text-[3.2vw]" />{' '}
                      <span className="ml-[0.4vw] hidden sm:inline">Remove avatar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setProfilePreview(user?.profileImage || DEFAULT_AVATAR);
                        setBannerPreview(user?.bannerImage || DEFAULT_BANNER);
                        setProfileFile(null);
                        setBannerFile(null);
                        setServerFieldErrors({});
                        setValue('firstName', user?.firstName || '');
                        setValue('lastName', user?.lastName || '');
                        setValue('email', user?.email || '');
                        setValue('phoneNumber', user?.phoneNumber || '');
                        setValue('bio', user?.bio || '');
                        toast.info('Form reset', { theme: 'dark' });
                      }}
                      className="px-[0.9vw] py-[0.6vw] rounded-md bg-white/5 hover:bg-white/10 text-white/80 text-[0.9vw]"
                    >
                      Reset form
                    </button>

                    {mutation.isSuccess && (
                      <div className="ml-auto inline-flex items-center gap-[0.4vw] text-emerald-300 text-[0.95vw]">
                        <FiCheck /> <span>Saved</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* form fields */}
              <div className="mt-[1.4vw] grid grid-cols-1 md:grid-cols-2 gap-[1vw]">
                {/* First Name */}
                <div>
                  <label className="text-[0.9vw] text-white/70 mb-[0.4vw] block">First name</label>
                  <input
                    {...register('firstName', {
                      required: 'First name is required.',
                      minLength: { value: 2, message: 'First name must be at least 2 characters.' },
                    })}
                    className={`w-full px-[0.9vw] py-[0.9vw] rounded-lg bg-[#081022] border outline-none focus:ring-2 focus:ring-indigo-500 text-[0.95vw] text-white ${
                      getErrorMessage('firstName') ? 'border-red-500' : 'border-[#1b2a44]'
                    }`}
                    placeholder="First name"
                  />
                  {getErrorMessage('firstName') && (
                    <div className="text-[0.85vw] text-rose-400 mt-[0.4vw] flex items-center gap-1">
                      <FiAlertCircle className="text-xs" /> {getErrorMessage('firstName')}
                    </div>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="text-[0.9vw] text-white/70 mb-[0.4vw] block">Last name</label>
                  <input
                    {...register('lastName', {
                      required: 'Last name is required.',
                      minLength: { value: 2, message: 'Last name must be at least 2 characters.' },
                    })}
                    className={`w-full px-[0.9vw] py-[0.9vw] rounded-lg bg-[#081022] border outline-none focus:ring-2 focus:ring-indigo-500 text-[0.95vw] text-white ${
                      getErrorMessage('lastName') ? 'border-red-500' : 'border-[#1b2a44]'
                    }`}
                    placeholder="Last name"
                  />
                  {getErrorMessage('lastName') && (
                    <div className="text-[0.85vw] text-rose-400 mt-[0.4vw] flex items-center gap-1">
                      <FiAlertCircle className="text-xs" /> {getErrorMessage('lastName')}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="text-[0.9vw] text-white/70 mb-[0.4vw] block">Email</label>
                  <input
                    {...register('email', {
                      required: 'Email address is required.',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Please enter a valid email address.',
                      },
                    })}
                    className={`w-full px-[0.9vw] py-[0.9vw] rounded-lg bg-[#081022] border outline-none focus:ring-2 focus:ring-indigo-500 text-[0.95vw] text-white ${
                      getErrorMessage('email') ? 'border-red-500' : 'border-[#1b2a44]'
                    }`}
                    placeholder="you@example.com"
                  />
                  {getErrorMessage('email') && (
                    <div className="text-[0.85vw] text-rose-400 mt-[0.4vw] flex items-center gap-1">
                      <FiAlertCircle className="text-xs" /> {getErrorMessage('email')}
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-[0.9vw] text-white/70 mb-[0.4vw] block">Phone</label>
                  <input
                    {...register('phoneNumber', {
                      required: 'Phone number is required.',
                      pattern: {
                        value: /^\+?[0-9\s\-()]{7,20}$/,
                        message: 'Please enter a valid phone number.',
                      },
                    })}
                    className={`w-full px-[0.9vw] py-[0.9vw] rounded-lg bg-[#081022] border outline-none focus:ring-2 focus:ring-indigo-500 text-[0.95vw] text-white ${
                      getErrorMessage('phoneNumber') ? 'border-red-500' : 'border-[#1b2a44]'
                    }`}
                    placeholder="+1 555 555 5555"
                  />
                  {getErrorMessage('phoneNumber') && (
                    <div className="text-[0.85vw] text-rose-400 mt-[0.4vw] flex items-center gap-1">
                      <FiAlertCircle className="text-xs" /> {getErrorMessage('phoneNumber')}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="mt-[1.2vw]">
                <label className="text-[0.9vw] text-white/70 mb-[0.4vw] block">Bio</label>
                <textarea
                  {...register('bio', {
                    required: 'Bio is required.',
                    minLength: { value: 10, message: 'Bio must be at least 10 characters long.' },
                    maxLength: { value: 1000, message: 'Bio must not exceed 1000 characters.' },
                  })}
                  rows={4}
                  className={`w-full px-[0.9vw] py-[0.9vw] rounded-lg bg-[#081022] border outline-none focus:ring-2 focus:ring-indigo-500 text-[0.95vw] text-white ${
                    getErrorMessage('bio') ? 'border-red-500' : 'border-[#1b2a44]'
                  }`}
                  placeholder="Short bio about you..."
                />
                {getErrorMessage('bio') && (
                  <div className="text-[0.85vw] text-rose-400 mt-[0.4vw] flex items-center gap-1">
                    <FiAlertCircle className="text-xs" /> {getErrorMessage('bio')}
                  </div>
                )}
              </div>

              {/* upload progress bar */}
              <div className="mt-[1vw]">
                {isUploading && (
                  <div className="w-full bg-white/6 rounded-full h-[0.8vw] overflow-hidden">
                    <div
                      className="h-[0.8vw] bg-gradient-to-r from-indigo-500 to-sky-400 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* actions */}
              <div className="mt-[1.4vw] flex items-center gap-[0.8vw]">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isUploading || mutation.isLoading}
                  className={`inline-flex items-center gap-[0.6vw] px-[1.2vw] py-[0.9vw] rounded-full font-semibold transition ${
                    isUploading || mutation.isLoading
                      ? 'bg-indigo-500/70 cursor-wait text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  } text-[0.95vw]`}
                >
                  {mutation.isLoading ? <PulseLoader size={8} color="#ffffff" /> : 'Update Profile'}
                </motion.button>
              </div>

              {/* Global server error message (if not field specific) */}
              {mutation.isError && !serverFieldErrors.firstName && (
                <div className="mt-[1vw] text-[0.85vw] text-rose-400">
                  {mutation.error?.response?.data?.message}
                </div>
              )}
            </div>

            {/* right: compact preview / meta (sticky on md+) */}
            <aside className="w-full md:w-[22vw] flex-shrink-0 mt-[1.4vw] md:mt-0">
              <div className="rounded-xl bg-[rgba(255,255,255,0.02)] border border-[#12203b] p-[1.1vw] sticky top-[2.4vw]">
                <div className="flex items-center gap-[0.8vw]">
                  <div className="w-[5.2vw] h-[5.2vw] rounded-full overflow-hidden border border-white/6">
                    <img
                      src={profilePreview}
                      alt="avatar small"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[1vw] font-semibold text-white truncate">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-[0.8vw] text-white/60 truncate">{user?.email}</div>
                  </div>
                </div>

                <div className="mt-[0.9vw] text-[0.85vw] text-white/60">
                  <div>
                    Member since:{' '}
                    <span className="text-white/80 ml-[0.4vw]">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </span>
                  </div>
                  <div className="mt-[0.6vw]">Tip: square avatars display best in the app.</div>
                </div>

                <div className="mt-[1vw] flex gap-[0.6vw]">
                  <label className="flex-1 text-center px-[0.8vw] py-[0.7vw] rounded-md bg-white/5 hover:bg-white/10 cursor-pointer text-[0.9vw]">
                    Quick avatar
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        createPreview(file, setProfilePreview, setProfileFile);
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      if (profilePreview && profilePreview.startsWith('http')) {
                        navigator.clipboard
                          .writeText(profilePreview)
                          .then(() => {
                            toast.success('Avatar URL copied', { theme: 'dark' });
                          })
                          .catch(() => {
                            toast.error('Failed to copy URL', { theme: 'dark' });
                          });
                      }
                    }}
                    className="px-[0.8vw] py-[0.7vw] rounded-md bg-white/5 hover:bg-white/10 text-[0.9vw]"
                    title="Copy Avatar URL"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </motion.div>
    </form>
  );
}
