import BackgroundTimer from 'react-native-background-timer';
import React, { useState } from "react"
import { BleManager, Device } from 'react-native-ble-plx'
import { ActivityIndicator, TouchableOpacity, View, Text, PermissionsAndroid, StyleSheet } from "react-native"
import { colors } from "../styles"
import { arrayBufferToBase64 } from '../utils/converters'
import { hexToRgb } from '../utils/converters'
import { LedStripLightColors } from '../styles'

import { useSelector } from 'react-redux'

// export function LedDeviceManager(){
  
//   const pipelineStatus = useSelector(state => state.pipelineStatus.value)      
//   console.log('[LedDeviceManager]', pipelineStatus)
//   return (
//       <View style={styles.mainContainer}>
//       </View>
//   )
const DISCONNECTED = "DISCONNECTED"
const CONNECTED = "CONNECTED"
const CONNECTING = "CONNECTING"
const DISCONNECTING = "DISCONNECTING"
const bleManager = new BleManager()
requestLocationPermission()
const DEVICE_ID = "BE:59:30:00:2D:B4"
const SERVICE_ID = "0000fff0-0000-1000-8000-00805f9b34fb"
const CHARACTERISTIC_ID = 6

export function LedDeviceManager() {

  const pipelineStatus = useSelector(state => state.pipelineStatus.value)
  const [connectionStatus, setConnectionStatus] = useState(DISCONNECTED)
  const [device, setDevice] = useState(null)
  const [deviceCharacteristic, setDeviceCharacteristic] = useState(null)
  
  if (pipelineStatus && connectionStatus == CONNECTED){
    const rgbColor = hexToRgb(LedStripLightColors[pipelineStatus])
    const command = {color: rgbColor}
    sendCommand(deviceCharacteristic, command)
  }

  return (
      <TouchableOpacity style={styles.mainContainer} onPress={() => {
        switch (connectionStatus){
          case CONNECTING:
            bleManager.stopDeviceScan()
            setConnectionStatus(DISCONNECTED)
            break
          case DISCONNECTED:
            connectDevice(connectionStatus, setConnectionStatus, setDevice, setDeviceCharacteristic)
            break
          case CONNECTED:
            disconnectDevice(connectionStatus, setConnectionStatus, device)
            break
        }      
      }}>
          <Text style={{fontSize: 15, flex: 0.95 }} numberOfLines={1}>BLE led strip light connection</Text>
          {connectionStatus == CONNECTING || connectionStatus == DISCONNECTING ? (
            <ActivityIndicator color={'grey'} size={25} />
            ) : (
              connectionStatus == CONNECTED ? (
              <View style={styles.connectedPellet}></View>
              )  : ( 
                connectionStatus == DISCONNECTED ? (
                  <View style={styles.disconnectedPellet}></View>
                ) 
                : (
                  null
                )
              )
          )}
      </TouchableOpacity>
  )
}

function connectDevice(connectionStatus, setConnectionStatus, setDevice, setDeviceCharacteristic){
      if (connectionStatus != DISCONNECTED){
        return
      }
      setConnectionStatus(CONNECTING)
      // scan devices
      let deviceFound = false
      bleManager.startDeviceScan(null, null, (error, scannedDevice) => {
        if (error) {
          console.warn("[connectDevice]", error)
          setConnectionStatus(DISCONNECTED)
          return
        }
        if (deviceFound == true){
          console.log("[connectDevice]", "deviceFound == true return")
          return
        }
        if (scannedDevice) {
          console.log("[connectDevice]", "scanned device:", scannedDevice.name, scannedDevice.id)
          if (scannedDevice.id == DEVICE_ID){
            deviceFound = true
            console.log("[connectDevice]", "connecting to", scannedDevice.id)
            scannedDevice.connect()
            .then((device) => {
              console.log("[connectDevice]", "device connected")
              bleManager.stopDeviceScan()
              getDeviceCharacteristic(device)
              .then(char => {
                setDevice(device)
                setDeviceCharacteristic(char)
                setConnectionStatus(CONNECTED)
              })
            })
            .catch((error) => {
              console.log("[connectDevice]", error)
              scannedDevice.isConnected()
              .then((isConnected) => {
                isConnected ? console.log("[connectDevice]", "device already connected") : null
              })
            })
              }
          }
      })
  }
  
function disconnectDevice(connectionStatus, setConnectionStatus, device){
    if (connectionStatus != CONNECTED){
      return
    }
    setConnectionStatus(DISCONNECTING)
    device.cancelConnection()
    .then((device) => {
      setConnectionStatus(DISCONNECTED)
    })
  }
  
async function getDeviceCharacteristic(device){
    const allServicesAndCharacteristics = await device.discoverAllServicesAndCharacteristics()
    const services = await allServicesAndCharacteristics.services()
    const service = services.find(service => service.uuid == SERVICE_ID)
    const charArray = await service.characteristics()
    const char = charArray.find(char => char.id == CHARACTERISTIC_ID)
    return char
  }
  
async function requestLocationPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
          title: 'Location permission for bluetooth scanning',
          message: 'wahtever',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      ) 
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission for bluetooth scanning granted')
        return true
      } else {
        console.log('Location permission for bluetooth scanning revoked')
        return false
      }
    } catch (err) {
      console.warn(err)
      return false
    }
  }

export function sendCommand(characteristic, command){
  let frame
  if (command.color){
  console.log("[sendCommand]", command)
  frame = [0x7e, 0x07, 0x05, 0x03, command.color.r, command.color.g, command.color.b, 0x10, 0xef]
  }
  characteristic.writeWithoutResponse(arrayBufferToBase64(frame))
  .then(() => {
  console.log('[sendCommand]', 'Success sent', command);
  })
  .catch((error) => console.warn('[sendCommand]', 'Error: ', error));
}

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    justifyContent: "space-between",
    backgroundColor: colors.displayZones
  },
  connectedPellet: {
    width: 25,
    height: 25,
    borderRadius: 25/2,
    backgroundColor: colors.success,
    borderWidth: 1
  },
  disconnectedPellet: {
    width: 25,
    height: 25,
    borderRadius: 25/2,
    backgroundColor: colors.canceled,
    borderWidth: 1
  }
})