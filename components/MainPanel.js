import React from "react"
import { AutocompleteInput } from "react-native-autocomplete-input"
import { Text, TouchableOpacity } from 'react-native'
import { getGitlabProjects } from '../gitlabApiFunctions'

export class MainPannel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            projectSelected: undefined,
            projectsFound: [],
            branches: []
        }
    }
    updateProjectFound(searchString){
        getGitlabProjects(searchString)
        .then((projects) => this.setState({ projectsFound: projects }))
    }

    render() {
        return (
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
                    <TouchableOpacity onPress={() => this.setState( { projectSelected: item, projectsFound: [] })}>
                        <Text>{item.name}</Text>
                    </TouchableOpacity>
                }}
            />
            )
        }
}