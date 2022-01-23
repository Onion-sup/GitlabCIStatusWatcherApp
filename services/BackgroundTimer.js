import BackgroundTimer from 'react-native-background-timer';
import { projectSelected, branchSelected } from '../components/StatusWatcher'
import { getPipelineFromCommit } from '../utils/gitlabApiFunctions'
import { deviceCharacteristic, sendCommand } from '../components/LedDeviceManager'
import { hexToRgb } from '../utils/converters'
import { LedStripLightColors } from '../styles'

BackgroundTimer.runBackgroundTimer(() => { 
    
    console.log('backgroundTimer')
    if (projectSelected != undefined && branchSelected != undefined){
        let pipelineStatus = null
        getPipelineFromCommit(projectSelected.id, branchSelected.commit.id)
            .then((pipelines) => {
                pipelineStatus = pipelines[0].status
                if (deviceCharacteristic != undefined){
                    if (pipelineStatus){
                        const command = getLedStripLightCommand(pipelineStatus)
                        sendCommand(deviceCharacteristic, command)
                    }
                }
            })
            .catch((error) => console.error(error))         
    }
}, 
3000);

function getLedStripLightCommand(pipelineStatus){
    console.log('[getLedStripLightCommand]', 'pipelineStatus', pipelineStatus)
        const rgbColor = hexToRgb(LedStripLightColors[pipelineStatus])
        const command = {color: rgbColor}
        return command
}