import {Component} from "react";
import React from "react";
import ReactDOM from "react-dom";
import StringList from "./StringList";
import ProjectTable from "./ProjectTable";
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Input from '@material-ui/core/Input';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';


export class Project extends Component {
    constructor(props) {
        super(props);
        this.state = {
            project: {Languages: [], BaseLanguage: {}, Identifiers: []},
            newIdentifier: '',
            languages: []
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleLanguageSubmit = this.handleLanguageSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);

        this.languageSelect = React.createRef();
    }

    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        this.newIdentifier();
    }

    handleLanguageSubmit(event) {
        event.preventDefault();
        console.log("language added")
        var body = {
            "languageCode": this.languageSelect.current.value
        };
        fetch(process.env.REACT_APP_BACKEND_URL + '/project/' + this.props.projectId + '/languages', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })
            .then(result => {
                if (!result.ok) {
                    throw Error(result.statusText);
                }
                return result.json()
            })
            .then(project => {
                this.setState({project});
                this.setState({languages: this.diffLanguages(this.state.languages)});
            })
            .catch((error) => console.log(error));
    }

    newIdentifier() {
        var body = {
            "projectId": this.props.projectId,
            "identifier": this.state.newIdentifier
        };
        fetch(process.env.REACT_APP_BACKEND_URL + '/identifier', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })
            .then(result => {
                if (!result.ok) {
                    throw Error(result.statusText);
                }
                return result.json()
            })
            .then(identifier => {
                var updatedProject = this.state.project;
                updatedProject.Identifiers.push(identifier);
                this.setState({project: updatedProject})
            })
            .catch((error) => console.log(error));
    }

    showLanguage(lang) {
        var temp = document.createElement("div");
        ReactDOM.render(<StringList project={this.state.project} language={lang}/>, temp);
        var container = document.getElementById("content");
        container.childNodes.forEach(function (child) {
            container.removeChild(child);
        });
        container.appendChild(temp.querySelector("#stringList"));
    }

    componentDidMount() {
        fetch(process.env.REACT_APP_BACKEND_URL + '/project/' + this.props.projectId)
            .then(result => {
                if (!result.ok) {
                    throw Error(result.statusText);
                }
                return result.json()
            })
            .then(project => {
                this.setState({project});
                this.fetchLanguages();
            })
            .catch((error) => console.log(error));
    }

    fetchLanguages() {
        fetch(process.env.REACT_APP_BACKEND_URL + '/languages')
            .then(result => {
                if (!result.ok) {
                    throw Error(result.statusText);
                }
                return result.json();
            })
            .then(languages => {
                this.setState({languages: this.diffLanguages(languages)});
            })
            .catch((error) => console.log(error));
    }

    diffLanguages(languages) {
        var diff = [];
        var langKeys = [];
        var projLangKeys = [];
        for (var i = 0; i < languages.length; i++) {
            langKeys.push(languages[i].IsoCode)
        }
        for (var j = 0; j < this.state.project.Languages.length; j++) {
            projLangKeys.push(this.state.project.Languages[j].IsoCode);
        }
        for (var k = 0; k < languages.length; k++) {
            if (!projLangKeys.includes(langKeys[k])) {
                diff.push(languages[k])
            }
        }
        return diff;
    }

    render() {
        return (
            <div className="Project" id="project">
                {this.state.project.Name} <br/>
                BaseLanguage: {this.state.project.BaseLanguage.IsoCode} - {this.state.project.BaseLanguage.Name} <br/>
                Languages:
                <List className="Languages">
                    {this.state.project.Languages.map(language =>
                        <ListItem key={language.IsoCode} onClick={this.showLanguage.bind(this, language.IsoCode)}>
                            <ListItemText primary={language.Name} secondary={language.IsoCode} />
                        </ListItem>
                    )}
                </List><br/>
                <form onSubmit={this.handleSubmit}>
                    New Identifier: <Input type="text" name="newIdentifier" value={this.state.newIdentifier}
                                           onChange={this.handleChange} required/>
                    <Button type="submit">Add identifier</Button>
                </form>
                <div>
                    <form onSubmit={this.handleLanguageSubmit}>
                        <select value={this.state.value} ref={this.languageSelect} name="language" required>
                            {this.state.languages.map(language =>
                                <option key={language.IsoCode} value={language.IsoCode}>
                                    {language.IsoCode} - {language.Name}
                                </option>
                            )}
                        </select>
                        <Button onClick={this.handleLanguageSubmit}>Add language to project</Button>
                    </form>
                </div>
                <ProjectTable project={this.state.project}/>
            </div>
        );
    }
}

export default Project;