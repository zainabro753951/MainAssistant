import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  messages: [], // [{ sender: 'user' | 'ai', message }]
}

const AImessagesSlice = createSlice({
  name: 'AIMessages',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload) // full message
    },
    appendToLastAIMessage: (state, action) => {
      const lastIndex = state.messages.length - 1
      if (state.messages[lastIndex].sender === 'ai') {
        state.messages[lastIndex].message += action.payload
      }
    },
    clearMessages: state => {
      state.messages = []
    },
  },
})

export const { addMessage, appendToLastAIMessage, clearMessages } = AImessagesSlice.actions
export default AImessagesSlice.reducer
