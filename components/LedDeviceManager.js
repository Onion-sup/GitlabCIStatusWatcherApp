import React from "react"
import { BleManager, Device } from 'react-native-ble-plx'
import { ActivityIndicator, TouchableOpacity, View, Text, PermissionsAndroid, StyleSheet } from "react-native"
import { colors } from "../styles"

export class LedDeviceManager extends React.Component {
  constructor(props) {
      super(props)
      this.bleManager = new BleManager()
      this.requestLocationPermission()
      this.deviceName = "ELK-BLEDOM"
      this.state = {
        isScanning: false,
        device: undefined
      }
  }
  render(){
    return (
        <TouchableOpacity style={styles.mainContainer} >
            <Text style={{fontSize: 15, flex: 0.95 }} numberOfLines={1}>BLE led strip light connection</Text>
            {this.state.isLoading ? (
            <ActivityIndicator color={'grey'} size={25} />
            ) : (
              <View style={styles.successPellet}></View>
            )}
        </TouchableOpacity>
    )
  }
  connectDevice = () => {
      if (this.state.isScanning){
        return
      }
      console.log("scanDevices")
      setIsScanning(true)
      // scan devices
      this.bleManager.startDeviceScan(null, null, (error, scannedDevice) => {
        if (error) {
          console.warn(error)
        }
        console.log("scanDevices", "startDeviceScan")
        // if a device is detected add the device to the list by dispatching the action into the reducer
        if (scannedDevice) {
          console.log(scannedDevice.id)
          if (scannedDevice.name == this.deviceName){
            console.log("scanDevices", "connect to device")
            scannedDevice.connect
            .then((device) => {
              this.bleManager.stopDeviceScan()
              this.setState({ isScanning: false,  device: device})
            })
          }
        }
      })

      // stop scanning devices after x seconds
      setTimeout(() => {
        this.bleManager.stopDeviceScan()
        this.setState({ isScanning: false })
      }, 10000)
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
  successPellet: {
    width: 25,
    height: 25,
    borderRadius: 25/2,
    backgroundColor: colors.success,
    borderWidth: 1
  }
})