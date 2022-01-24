import BackgroundTimer from 'react-native-background-timer';
import React, { useEffect, useState } from "react";
import { colors } from "../styles"
import { AutocompleteInput } from "react-native-autocomplete-input"
import { Text, TouchableOpacity, View, FlatList, StyleSheet } from 'react-native'
import { getGitlabProjects, getProjectBranches, getPipelineFromCommit, getPipelineJobs } from '../utils/gitlabApiFunctions'
import { LedDeviceManager } from "./LedDeviceManager";
import { hexToRgb } from '../utils/converters'
import { useSelector, useDispatch } from 'react-redux'
import { updatePipelineStatus } from '../redux/pipelineStatusSlice';

// export function StatusWatcher(){
//     const statusArray = ['fail', 'success', 'running']
//     const dispatch = useDispatch()
//     let i = 0
//     BackgroundTimer.runBackgroundTimer(() => { 
        
//         // console.log('[StatusWatcher]', statusArray[i])
//         {dispatch(updatePipelineStatus(statusArray[i]))}
//         i = (i+1)%3
//     }, 
//     3000);
//     console.log('[StatusWatcher]')
//     return (
//         <View style={styles.mainContainer}>        
//             <LedDeviceManager/>
//         </View>
//     )
// }
export function StatusWatcher() {
    const [projectSelected, setProjectSelected] = useState(null)
    const [branchSelected, setBranchSelected] = useState(null)
    const [projectsFound, setProjectsFound] = useState([])
    const [branches, setBranches] = useState([])
    const [pipeline, setPipeline] = useState(null)
    const [pipelineJobs, setPipelineJobs] = useState([])

    return (
        <View style={styles.mainContainer}>
            { renderProjectSearchBar(projectsFound, setProjectsFound, projectSelected, setProjectSelected, setBranches, setPipelineJobs, setBranchSelected) }
            <View style={styles.branchListAndPipelineContainer}>
                { renderBranchList(branches, branchSelected, setBranchSelected, projectSelected, pipeline, setPipeline, setPipelineJobs) }
                { renderPipelineJobs(pipelineJobs) }
                <LedDeviceManager/>
            </View>
        </View>
        )
    }
    
    function updateProjectBranches(projectSelected, setBranches){
        if (!projectSelected){
            return
        }
        getProjectBranches(projectSelected.id)
        .then((branches) => setBranches(branches))
        .catch((error) => {
            console.warn("[updateProjectBranches]", error)
        })
    }
    function updatePipeline(projectSelected, branchSelected, setPipeline, setPipelineJobs){
        if (!projectSelected || !branchSelected){
            return
        }
        getPipelineFromCommit(projectSelected.id, branchSelected.commit.id)
        .then((pipelines) => {
            setPipeline(pipelines[0])
            updatePipelineJobs(setPipelineJobs, projectSelected, pipelines[0])
        })
        .catch((error) => {
            console.warn("[updatePipeline]", error)
        })
    }
    function updatePipelineJobs(setPipelineJobs, projectSelected, pipeline){
        if (!projectSelected || !pipeline){
            return
        }
        getPipelineJobs(projectSelected.id, pipeline.id)
        .then((jobs) => setPipelineJobs(jobs))
        .catch((error) => {
            console.warn("[updatePipelineJobs]", error)
        })
    }
    
    function renderProjectSearchBar(projectsFound, setProjectsFound, projectSelected, setProjectSelected, setBranches, setPipelineJobs, setBranchSelected){
        return (
            <View style={styles.autocompleteContainer}>
                <AutocompleteInput
                    style={styles.searchBar}
                    placeholder="Search Gitlab Project..."
                    data={projectsFound}
                    value={ (projectSelected) ? projectSelected.name : null}
                    onChangeText={(searchString) => {
                        setPipelineJobs([])
                        setBranchSelected(null)
                        setProjectSelected(null)
                        setProjectsFound([])
                        setBranches([])
                        getGitlabProjects(searchString).then((projects) => setProjectsFound(projects))
                        }
                    }
                    flatListProps={{
                        keyExtractor: (_, idx) => idx,
                        renderItem: ({ item }) =>
                            <TouchableOpacity style={styles.suggestionListItem} onPress={() => {
                                setProjectSelected(item)
                                setProjectsFound([])
                                updateProjectBranches(item, setBranches)
                            }}>
                                <Text style={styles.text}>{item.name}</Text>
                            </TouchableOpacity>
                    }}
                />
            </View>
        )
    }

    function renderBranchList(branches, branchSelected, setBranchSelected, projectSelected, pipeline, setPipeline, setPipelineJobs){
        return (
            <View style={styles.branchListContainer}>
                <FlatList
                data={branches}
                renderItem= {({ item }) => renderBranchItem(item, branchSelected, setBranchSelected, projectSelected, pipeline, setPipeline, setPipelineJobs) }
                keyExtractor={item => item.name}
            /> 
          </View>
        )
    }
    function renderBranchItem(branchItem, branchSelected, setBranchSelected, projectSelected, pipeline, setPipeline, setPipelineJobs){
        const _renderStatusPellet = pipeline && branchSelected
        return (
            <TouchableOpacity style={styles.listItemContainer} onPress={() =>{
                setBranchSelected( branchItem )
                updatePipeline(projectSelected, branchItem, setPipeline, setPipelineJobs)
            }}>
                <Text style={{fontSize: 20, flex:0.9}} numberOfLines={1}>{branchItem.name}</Text>
                { _renderStatusPellet && branchSelected.name === branchItem.name ?  renderStatusPellet(pipeline.status) : null }
            </TouchableOpacity>
        )
    }
    function renderStatusPellet(status){
        return <View style={[styles.pellet, {backgroundColor: colors[status]}]}></View>
    }

    function renderPipelineJobs(pipelineJobs){
        return(
            <View style={styles.pipelineContainer}>
                <FlatList
                data={pipelineJobs}
                renderItem= {({ item }) => renderJobItem(item) }
                keyExtractor={item => item.name}
                /> 
            </View>
        )
    }
    function renderJobItem(job){
        return (
            <View style={styles.listItemContainer} >
                <Text style={{fontSize: 20, flex:0.9}} numberOfLines={1}>{job.name}</Text>
                { renderStatusPellet(job.status) }
            </View>
        )
    }
    


const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        padding: 10,
        backgroundColor: colors.background,
        fontFamily: 'san'
    },
    text:{
        fontSize: 20
    },
    suggestionListItem: {
        backgroundColor: colors.listItem
    },
    listItemContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: "space-between",
        borderBottomWidth: 1
    },
    autocompleteContainer: {
        margin: 10,
        flex: 1,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 1
    },
    searchBar: {
        backgroundColor: colors.displayZones,
        fontSize: 20
    },
    branchListAndPipelineContainer: {
        top: 60,
        flex: 0.9,
        justifyContent: "space-between",
    },
    branchListContainer: {
        backgroundColor: colors.displayZones,
        flex: 0.3,
        paddingLeft: 10,
        paddingRight: 10,
    },
    pipelineContainer: {
        backgroundColor: colors.displayZones,
        flex: 0.66,
        Width: 1,
        paddingLeft: 10,
        paddingRight: 10,
    },
    pellet: {
        width: 25,
        height: 25,
        borderRadius: 25/2,
        borderWidth: 1
    }
  });