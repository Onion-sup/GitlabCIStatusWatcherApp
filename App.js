import React from "react"
import { StatusWatcher } from "./components/StatusWatcher"
import { NativeModules, Button } from 'react-native';
const { CalendarModule } = NativeModules;
import { AppRegistry } from 'react-native';
AppRegistry.registerHeadlessTask('SomeTask', () =>
  require('./services/SomeTask')
);

const NewModuleButton = () => {
  const onPress = () => {
    CalendarModule.createCalendarEvent('testName', 'testLocation');
    console.log("onPress")
  };

  return (
    <Button
      title="Click to invoke your native module!"
      color="#841584"
      onPress={onPress}
    />
  );
};
export default function App() {
  return (
    <NewModuleButton/>
    // <StatusWatcher/>
  )
}