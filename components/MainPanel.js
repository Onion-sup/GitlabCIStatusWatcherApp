import React from "react"
import { AutocompleteInput } from "react-native-autocomplete-input"
import { Text, TouchableOpacity, View, FlatList, StyleSheet } from 'react-native'
import { getGitlabProjects, getProjectBranches, getPipelineFromCommit, getPipelineJobs } from '../gitlabApiFunctions'

export class MainPannel extends React.Component {
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
        this.backgroundLooper = null
    }
    render() {
        if (this.backgroundLooper){
            console.log(this.backgroundLooper)
        }
        if (!this.state.pipeline){
            if (this.backgroundLooper){
                clearInterval(this.backgroundLooper)
                this.backgroundLooper = null
                console.log("clearInterval")
            }
        }
        if (this.state.pipeline && !this.backgroundLooper){
            this.backgroundLooper = setInterval(() => {
                console.log('redenr looper', Date())
            }, 3000);
        }
        return (
            <View style={styles.mainContainer}>
                { this.renderProjectSearchBar() }
                <View style={styles.branchListAndPipelineContainer}>
                    { this.renderBranchList() }
                    { this.renderPipeline() }
                </View>
            </View>
            )
        }
    updateProjectFound(searchString){
        getGitlabProjects(searchString)
        .then((projects) => this.setState({ projectsFound: projects }))
    }
    updateProjectBranches(){
        getProjectBranches(this.state.projectSelected.id)
        .then((branches) => this.setState({ branches: branches}))
    }
    updatePipeline(){
        getPipelineFromCommit(this.state.projectSelected.id, this.state.branchSelected.commit.id)
        .then((pipelines) => this.setState({ pipeline: pipelines[0]}, () => this.updatePipelineJobs()))
    }
    updatePipelineJobs(){
        getPipelineJobs(this.state.projectSelected.id, this.state.pipeline.id)
        .then((jobs) => this.setState( {pipelineJobs: jobs}))
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
        switch (status) {
            case 'pending':
                return <View style={styles.pendingPellet}></View>
            case 'running':
                return <View style={styles.runningPellet}></View>
            case 'success':
                return <View style={styles.successPellet}></View>
            case 'failed':
                return <View style={styles.failedPellet}></View>
            case 'canceled':
                return <View style={styles.canceledPellet}></View>
        }
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
const colors = {
    background: "#554488",
    displayZones: "#D0D3D4",
    listItem: "#ECF0F1",
    pending: "#F1C40F",
    running: "#3498DB",
    success: "#42ba96",
    failed: "#E74C3C",
    canceled: "#F0F3F4"
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
        flex: 0.68,
        Width: 1,
        paddingLeft: 10,
        paddingRight: 10,
    },
    jobContainer: {
        display: 'flex',
        flexDirection: 'column',
        borderWidth: 1
    },
    pendingPellet: {
        width: 25,
        height: 25,
        borderRadius: 25/2,
        backgroundColor: colors.pending,
        borderWidth: 1
    },
    runningPellet: {
        width: 25,
        height: 25,
        borderRadius: 25/2,
        backgroundColor: colors.running,
        borderWidth: 1
    },
    successPellet: {
        width: 25,
        height: 25,
        borderRadius: 25/2,
        backgroundColor: colors.success,
        borderWidth: 1
    },
    failedPellet: {
        width: 25,
        height: 25,
        borderRadius: 25/2,
        backgroundColor: colors.failed,
        borderWidth: 1
    },
    canceledPellet: {
        width: 25,
        height: 25,
        borderRadius: 25/2,
        backgroundColor: colors.canceled,
        borderWidth: 1
    }
  });