import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  repos: [], // sab repos
  currentRepo: null, // currently open repo
  files: {}, // key: prefix, value: { items: [], fetched: true }
  fileContents: {}, // key: fileKey, value: content (string / blob)
}

const repoSlice = createSlice({
  name: 'repoSystem',
  initialState,
  reducers: {
    setRepos: (state, action) => {
      state.repos = action.payload
    },
    setCurrentRepo: (state, action) => {
      state.currentRepo = action.payload
    },
    setFilesForPrefix: (state, action) => {
      const { prefix, items } = action.payload
      state.files[prefix] = { items: items || [], fetched: true }
    },
    setFileContent: (state, action) => {
      const { prefix, mergedCode, fetched } = action.payload
      state.fileContents[prefix] = { mergedCode, fetched }
    },
    updateFileContent: (state, action) => {
      const { prefix, chunk } = action.payload
      if (!state.fileContents[prefix]) {
        state.fileContents[prefix] = { mergedCode: '', fetched: false }
      }
      state.fileContents[prefix].mergedCode += chunk
    },
  },
})

export const { setRepos, setCurrentRepo, setFilesForPrefix, setFileContent, updateFileContent } =
  repoSlice.actions
export default repoSlice.reducer
