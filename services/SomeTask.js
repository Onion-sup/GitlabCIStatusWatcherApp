import { projectSelected, branchSelected } from '../components/StatusWatcher'
import { getPipelineFromCommit } from '../utils/gitlabApiFunctions'

module.exports = async () => {
    setInterval(() => {
        if (projectSelected != undefined && branchSelected != undefined){
            console.log('SomeTask', projectSelected.id)
            getPipelineFromCommit(projectSelected.id, branchSelected.commit.id)
            .then((pipelines) => console.log('pipeline', pipelines))
            .catch((error) => console.error(error))
        }
    console.log('SomeTask')
    }
    , 5000)
  };