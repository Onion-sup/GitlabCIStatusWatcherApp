import React from "react"
import { AutocompleteInput } from "react-native-autocomplete-input"
import { Text, TouchableOpacity, View, FlatList, StyleSheet } from 'react-native'
import { getGitlabProjects, getProjectBranches, getPipelineFromCommit } from '../gitlabApiFunctions'

export class MainPannel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            projectSelected: undefined,
            branchSelected: undefined,
            projectsFound: [],
            branches: []
        }
    }
    updateProjectFound(searchString){
        getGitlabProjects(searchString)
        .then((projects) => this.setState({ projectsFound: projects }))
    }

    renderProjectSearchBar(){
        return (
            <View style={styles.autocompleteContainer}>
                <AutocompleteInput
                    placeholder="Gitlab Project"
                    data={this.state.projectsFound}
                    value={ (this.state.projectSelected) ? this.state.projectSelected.name : null}
                    onChangeText={(text) => {
                        this.setState({ projectSelected: undefined});
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

    updateProjectBranches(){
        getProjectBranches(this.state.projectSelected.id)
        .then((branches) => this.setState({ branches: branches}))
    }
    
    renderBranchList(){
        return (
            <FlatList
            data={this.state.branches}
            renderItem= {({ item }) => 
                <TouchableOpacity onPress={() => this.setState( { projectSelected: item, projectsFound: [] })}>
                    <Text>{item.name}</Text>
                </TouchableOpacity>
            }
            keyExtractor={item => item.id}
          /> 
        )
    }

    render() {
        return (
            
            <View>
                { this.renderProjectSearchBar() }
                { this.renderBranchList() }
            </View>
            )
        }
}

const styles = StyleSheet.create({
    autocompleteContainer: {
      flex: 1,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: 1
    }
  });