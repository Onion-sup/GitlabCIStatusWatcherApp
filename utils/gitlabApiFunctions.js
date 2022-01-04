import { GITLAB_API_TOKEN, GITLAB_HOST } from '../secrets'

export function getGitlabProjects(searchString){
  const url = "https://" + GITLAB_HOST + "/api/v4/projects?simple=true&search=" + searchString + "&private_token=" + GITLAB_API_TOKEN
  return ( 
    fetch(url)
    .then((response) => response.json())
    .catch((error) => console.error(error))
    )
}
export function getProjectBranches(idProject){
  const url = "https://" + GITLAB_HOST + "/api/v4/projects/" + idProject + "/repository/branches?private_token=" + GITLAB_API_TOKEN
  return (
    fetch(url)
    .then((response) => response.json())
    .catch((error) => console.error(error))
    )
}

export function getPipelineFromCommit(idProject, commitSha){
  const url = "https://" + GITLAB_HOST + "/api/v4/projects/" + idProject + "/pipelines?sha="+ commitSha + "&private_token=" + GITLAB_API_TOKEN
  return (
    fetch(url)
    .then((response) => response.json())
    .catch((error) => console.error(error))
    )
}

export function getPipelineJobs(idProject, idPipeline){
  const url = "https://" + GITLAB_HOST + "/api/v4/projects/" + idProject + "/pipelines/"+ idPipeline + "/jobs?private_token=" + GITLAB_API_TOKEN
  return (
    fetch(url)
    .then((response) => response.json())
    .catch((error) => console.error(error))
    )
  }
