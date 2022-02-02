import { configureStore } from '@reduxjs/toolkit'
import pipelineStatusReducer from './pipelineStatusSlice'

export default configureStore({
  reducer: {
    pipelineStatus: pipelineStatusReducer
  }
})
