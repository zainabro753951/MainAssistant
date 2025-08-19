import { configureStore } from '@reduxjs/toolkit'
import autheReducer from '../features/auth'
import AImessagesReducer from '../features/AIResponse'
import RepoSystemReducer from '../features/Repos'

export const store = configureStore({
  reducer: {
    auth: autheReducer,
    AIMessages: AImessagesReducer,
    Repos: RepoSystemReducer,
  },
})
