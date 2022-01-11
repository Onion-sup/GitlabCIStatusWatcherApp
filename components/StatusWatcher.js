import React from "react";
import { colors } from "../styles"
import { AutocompleteInput } from "react-native-autocomplete-input"
import { Text, TouchableOpacity, View, FlatList, StyleSheet } from 'react-native'
import { getGitlabProjects, getProjectBranches, getPipelineFromCommit, getPipelineJobs } from '../utils/gitlabApiFunctions'
import { LedDeviceManager } from "./LedDeviceManager";
import { hexToRgb } from '../utils/converters'

export class StatusWatcher extends React.Component {
    constructor(props) {
        super(props);
        this.initState = {
            projectSelected: undefined,
            branchSelected: undefined,
            projectsFound: [],
            branches: [],
            pipeline: undefined,
            pipelineJobs: []
        }
        this.state = {
            ...this.initState
        }
        setInterval(()=>{
            this.updateProjectBranches()
            this.updatePipeline()
            this.updatePipelineJobs()
        }, 5000)
    }
    
    render() {
        return (
            <View style={styles.mainContainer}>
                { this.renderProjectSearchBar() }
                <View style={styles.branchListAndPipelineContainer}>
                    { this.renderBranchList() }
                    { this.renderPipeline() }
                    <LedDeviceManager command={this.getLedDeviceCommand()}/>
                </View>
            </View>
            )
        }
    getLedDeviceCommand(){
        if (this.state.pipeline){
            rgbColor = hexToRgb(colors[this.state.pipeline.status])
            const command = {color: rgbColor}
            return command
        }
    }
    updateProjectFound(searchString){
        getGitlabProjects(searchString)
        .then((projects) => this.setState({ projectsFound: projects }))
    }
    updateProjectBranches(){
        if (this.state.projectSelected === this.initState.projectSelected){
            return
        }
        getProjectBranches(this.state.projectSelected.id)
        .then((branches) => this.setState({ branches: branches}))
        .catch((error) => {
            console.warn("[updateProjectBranches]", error)
            this.setState({
                branches: this.initState.branches
            })
        })
    }
    updatePipeline(){
        if (this.state.projectSelected === this.initState.projectSelected || this.state.branchSelected === this.initState.branchSelected){
            return
        }
        getPipelineFromCommit(this.state.projectSelected.id, this.state.branchSelected.commit.id)
        .then((pipelines) => this.setState({ pipeline: pipelines[0]}, () => this.updatePipelineJobs()))
        .catch((error) => {
            console.warn("[updatePipeline]", error)
            this.setState({ 
                pipeline: this.initState.pipeline
            })
        })
    }
    updatePipelineJobs(){
        if (this.state.projectSelected === this.initState.projectSelected || this.state.pipeline === this.initState.pipeline){
            return
        }
        getPipelineJobs(this.state.projectSelected.id, this.state.pipeline.id)
        .then((jobs) => this.setState( {pipelineJobs: jobs}))
        .catch((error) => {
            console.warn("[updatePipelineJobs]", error)
            this.setState({ 
                pipelineJobs: this.initState.pipelineJobs
            })
        })
    }
    
    renderProjectSearchBar(){
        return (
            <View style={styles.autocompleteContainer}>
                <AutocompleteInput
                    style={styles.searchBar}
                    placeholder="Search Gitlab Project..."
                    data={this.state.projectsFound}
                    value={ (this.state.projectSelected) ? this.state.projectSelected.name : null}
                    onChangeText={(text) => {
                        this.setState({ 
                            ...this.initState
                        });
                        this.updateProjectFound(text)
                        }
                    }
                    flatListProps={{
                        keyExtractor: (_, idx) => idx,
                        renderItem: ({ item }) =>
                            <TouchableOpacity style={styles.suggestionListItem} onPress={() => this.setState( { projectSelected: item, projectsFound: [] }, () => this.updateProjectBranches())}>
                                <Text style={styles.text}>{item.name}</Text>
                            </TouchableOpacity>
                    }}
                />
            </View>
        )
    }

    renderBranchList(){
        return (
            <View style={styles.branchListContainer}>
                <FlatList
                data={this.state.branches}
                renderItem= {({ item }) => this.renderBranchItem(item) }
                keyExtractor={item => item.name}
            /> 
          </View>
        )
    }
    renderBranchItem(branch){
        const renderStatusPellet = this.state.pipeline && this.state.branchSelected
        return (
            <TouchableOpacity style={styles.listItemContainer} onPress={() => this.setState( { branchSelected: branch }, () => this.updatePipeline())}>
                <Text style={{fontSize: 20, flex:0.9}} numberOfLines={1}>{branch.name}</Text>
                { renderStatusPellet && this.state.branchSelected.name === branch.name ?  this.renderStatusPellet(this.state.pipeline.status) : null }
            </TouchableOpacity>
        )
    }
    renderStatusPellet(status){
        return <View style={[styles.pellet, {backgroundColor: colors[status]}]}></View>
    }

    renderPipeline(){
        return(
            <View style={styles.pipelineContainer}>
                <FlatList
                data={this.state.pipelineJobs}
                renderItem= {({ item }) => this.renderJobItem(item) }
                keyExtractor={item => item.name}
                /> 
            </View>
        )
    }
    renderJobItem(job){
        return (
            <View style={styles.listItemContainer} >
                <Text style={{fontSize: 20, flex:0.9}} numberOfLines={1}>{job.name}</Text>
                { this.renderStatusPellet(job.status) }
            </View>
        )
    }
    
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