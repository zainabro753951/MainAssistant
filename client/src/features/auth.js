import { createSlice } from '@reduxjs/toolkit'
import useCheckUserAuth from '../Secure/CheckUserAuth'

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    login: (state, action) => {
      state.user = action.payload.user
      state.isAuthenticated = true
      state.isLoading = false
    },

    logout: (state, action) => {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
    },
  },
})

export const { login, logout } = authSlice.actions

export default authSlice.reducer
