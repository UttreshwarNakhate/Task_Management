import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// This file defines the authentication slice of the Redux store, including actions and initial state.
interface AuthState {
  isLoggedIn:boolean
  accessToken: string | null
  refreshToken: string | null
  user: { id:string; username: string; email: string} | null
}

// This file defines the initial state for the authentication slice of the Redux store.
const initialState: AuthState = {
  isLoggedIn: false,
  accessToken: null,
  refreshToken: null,
  user: null,
}

// This file defines the Redux slice for authentication, including actions and initial state.
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signInSuccess: (
      state,
      action: PayloadAction<{
        accessToken: string
        refreshToken: string
        user: { id:string;username: string; email: string }
      }>
    ) => {
      state.isLoggedIn = true
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.user = action.payload.user
    },
    signOutSuccess: (state) => {
       state.isLoggedIn = false
      state.accessToken = null
      state.refreshToken = null
      state.user = null
    },
  },
})


// This file exports the actions and reducer for the authentication slice of the Redux store.
export const { signInSuccess, signOutSuccess } = authSlice.actions
export default authSlice.reducer
