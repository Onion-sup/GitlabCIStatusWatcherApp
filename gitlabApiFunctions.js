import { GITLAB_API_TOKEN, GITLAB_HOST } from './secrets'

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
// getGitlabProjects().then((projects) => console.log("project", projects[0].id, projects[0].name))
// getProjectBranches(34).then((branches) => console.log("branch", branches[1].commit.id))
// getPipelineFromCommit(34, branches[1].commit.id).then((pipeline) => console.log("pipeline", pipeline[0].status))
