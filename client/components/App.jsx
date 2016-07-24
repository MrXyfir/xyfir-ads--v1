import React from "react";
import { render } from "react-dom";

// Components
import Advertisers from "./containers/Advertisers";
import Publishers from "./containers/Publishers";
import Panel from "./containers/Panel";
import Home from "./containers/Home";

class App extends React.Component {
	
    constructor(props) {
        super(props);

        this.state = {
            hash: location.hash.split('/')
        };

        window.onhashchange = () => {
            this.setState({ hash: location.hash.split('/') });
        };
    }
	
	render() {
		switch (this.state.hash[1]) {
            case "advertisers":
                return <Advertisers hash={this.state.hash} />;
            
            case "publishers":
                return <Publishers hash={this.state.hash} />;

            case "panel":
                return <Panel hash={this.state.hash} />;
            
            default:
                return <Home hash={this.state.hash} />;
        }
	}
	
}

render(<App />, document.querySelector("#content"));