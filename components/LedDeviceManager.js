import React from "react"
import { BleManager, Device } from 'react-native-ble-plx'
import { ActivityIndicator, TouchableOpacity, View, Text, PermissionsAndroid, StyleSheet } from "react-native"
import { colors } from "../styles"
import { arrayBufferToBase64 } from '../utils/converters'

export class LedDeviceManager extends React.Component {
  DISCONNECTED = 0
  CONNECTED = 1
  CONNECTING = 2
  DISCONNECTING = 3
  constructor(props) {
      super(props)
      this.bleManager = new BleManager()
      this.requestLocationPermission()
      this.DEVICE_ID = "BE:59:30:00:2D:B4"
      this.SERVICE_ID = "0000fff0-0000-1000-8000-00805f9b34fb"
      this.CHARACTERISTIC_ID = 6
      this.initState = {
        isScanning: false,
        device: undefined,
        deviceCharacteristic: undefined,
        connectionStatus: this.DISCONNECTED
      }
      this.state = {
        ...this.initState
    }
  }
  render(){
    this.sendCommand()
    return (
        <TouchableOpacity style={styles.mainContainer} onPress={() => this._switchDeviceConnection()} >
            <Text style={{fontSize: 15, flex: 0.95 }} numberOfLines={1}>BLE led strip light connection</Text>
            {this.state.connectionStatus == this.CONNECTING || this.state.connectionStatus == this.DISCONNECTING ? (
              <ActivityIndicator color={'grey'} size={25} />
              ) : (
                this.state.connectionStatus == this.CONNECTED ? (
                <View style={styles.connectedPellet}></View>
                )  : ( 
                  this.state.connectionStatus == this.DISCONNECTED ? (
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
  
  _switchDeviceConnection = () => {
    switch (this.state.connectionStatus){
      case this.CONNECTING:
          this.bleManager.stopDeviceScan()
          this.setState({ connectionStatus: this.DISCONNECTED })
      case this.DISCONNECTED:
        this.connectDevice()
        break
      case this.CONNECTED:
        this.disconnectDevice()
        break
    }
  }
  sendCommand(){
    const { command }  = this.props
    if (!command){
      return
    }
    let frame
    if (this.state.connectionStatus === this.CONNECTED){
      if (command.color){
        console.log("[sendCommand]", command)
        frame = [0x7e, 0x07, 0x05, 0x03, command.color.r, command.color.g, command.color.b, 0x10, 0xef]
      }
      this.state.deviceCharacteristic.writeWithoutResponse(arrayBufferToBase64(frame))
      .then(() => {
        console.warn('[sendCommand]', 'Success sent', command);
      })
      .catch((error) => console.warn('[sendCommand]', 'Error arrayBufferToBase64', error));
    }
  }

  
  connectDevice(){
      if (this.state.connectionStatus != this.DISCONNECTED){
        return
      }
      this.setState({ connectionStatus: this.CONNECTING})
      // scan devices
      let deviceFound = false
      this.bleManager.startDeviceScan(null, null, (error, scannedDevice) => {
        if (error) {
          console.warn("[connectDevice]", error)
          this.setState({ connectionStatus: this.DISCONNECTED})
          return
        }
        if (deviceFound == true){
          console.log("[connectDevice]", "deviceFound == true return")
          return
        }
        if (scannedDevice) {
          console.log("[connectDevice]", "scanned device:", scannedDevice.name, scannedDevice.id)
          if (scannedDevice.id == this.DEVICE_ID){
            deviceFound = true
            console.log("[connectDevice]", "connecting to", scannedDevice.id)
            scannedDevice.connect()
            .then((device) => {
              console.log("[connectDevice]", "device connected")
              this.bleManager.stopDeviceScan()
              this.getDeviceCharacteristic(device)
              .then(deviceCharacteristic => {
                this.setState({ connectionStatus: this.CONNECTED, device: device, deviceCharacteristic: deviceCharacteristic})
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
  
  disconnectDevice(){
    if (this.state.connectionStatus != this.CONNECTED){
      return
    }
    this.setState({ connectionStatus: this.DISCONNECTING })
    this.state.device.cancelConnection()
    .then((device) => {
      device.isConnected()
      .then((isConnected) => {
        if (!isConnected){
          this.setState( this.initState )
        }
        else {
          this.setState( {device: device, connectionStatus: this.CONNECTED} )
        }
      }) 
    })
  }
  
  async getDeviceCharacteristic(device){
    const allServicesAndCharacteristics = await device.discoverAllServicesAndCharacteristics()
    const services = await allServicesAndCharacteristics.services()
    const service = services.find(service => service.uuid == this.SERVICE_ID)
    const charArray = await service.characteristics()
    const char = charArray.find(char => char.id == this.CHARACTERISTIC_ID)
    return char
  }
  
  async requestLocationPermission() {
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