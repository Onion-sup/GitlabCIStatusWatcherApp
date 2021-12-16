import React from "react"
import { AutocompleteInput } from "react-native-autocomplete-input"
import { Text, TouchableOpacity, View, FlatList, StyleSheet } from 'react-native'
import { getGitlabProjects, getProjectBranches, getPipelineFromCommit, getPipelineJobs } from '../gitlabApiFunctions'

export class MainPannel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            projectSelected: undefined,
            branchSelected: undefined,
            projectsFound: [],
            branches: [],
            pipeline: undefined,
            pipelineJobs: []
        }
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
        .then((jobs) => this.setState( {pipelineJobs: jobs} ))
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
                            projectSelected: undefined,
                            branchSelected: undefined,
                            branches: []
                        });
                        this.updateProjectFound(text)
                        }
                    }
                    flatListProps={{
                        keyExtractor: (_, idx) => idx,
                        renderItem: ({ item }) =>
                            <TouchableOpacity onPress={() => this.setState( { projectSelected: item, projectsFound: [] }, () => this.updateProjectBranches())}>
                                <Text>{item.name}</Text>
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
                renderItem= {({ item }) => 
                    <TouchableOpacity onPress={() => this.setState( { branchSelected: item }, () => this.updatePipeline())}>
                        <Text>{item.name}</Text>
                    </TouchableOpacity>
                }
                keyExtractor={item => item.name}
            /> 
          </View>
        )
    }
    renderPipeline(){
        return(
            <View style={styles.pipelineContainer}>
                <Text>PipelineStatus: { (this.state.pipeline) ? this.state.pipeline.status : "unknown" }</Text>
            </View>
        )
    }
    renderJobsStatus(){
        return(
            <FlatList
            data={this.state.branches}
            renderItem= {({ item }) => 
                <Text>{item.name}: {item.status}</Text>
            }
            keyExtractor={item => item.name}
          /> 
        )
    }
    render() {
        return (
            <View>
                { this.renderProjectSearchBar() }
                { this.renderBranchList() }
                { this.renderPipeline() }
                {/* { this.renderJobsStatus() } */}
            </View>
            )
        }
}

const styles = StyleSheet.create({
    autocompleteContainer: {
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
    searchBar: {
        borderWidth: 1,
        borderRadius: 20
    },
    pipelineStatusContainer: {
        top: 100
    },
    pipelineContainer: {
        borderWidth: 1,
        borderRadius: 20
    },
    branchListContainer: {
        top: 100,
        height: 100,
        paddingLeft: 10,
        paddingRight: 10,
        borderWidth: 1,
        borderRadius: 20
        }
  });