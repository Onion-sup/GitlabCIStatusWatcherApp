import React from "react"
import { StatusWatcher } from "./components/StatusWatcher"
import store from './redux/store'
import { Provider } from 'react-redux'

// require('./services/BackgroundTimer.js')
export default function App() {
  return (
    <Provider store={store}>
      <StatusWatcher/>
    </Provider>
  )
}