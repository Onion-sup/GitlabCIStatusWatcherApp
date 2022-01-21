import React from "react"
import { StatusWatcher } from "./components/StatusWatcher"
require('./services/BackgroundTimer.js')

export default function App() {
  return (
    <StatusWatcher/>
  )
}