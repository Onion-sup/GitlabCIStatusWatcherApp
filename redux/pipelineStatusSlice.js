import { createSlice } from '@reduxjs/toolkit'

export const pipelineStatusSlice = createSlice({
  name: 'pipelineStatus',
  initialState: {
    value: null
  },
  reducers: {
    updatePipelineStatus: (state, action) => {
      state.value = action.payload
    }
  }
})

export const { updatePipelineStatus } = pipelineStatusSlice.actions

export default pipelineStatusSlice.reducer