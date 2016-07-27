import React from "react";
import { render } from "react-dom";

// Components
import Advertisers from "./containers/Advertisers";
import Publishers from "./containers/Publishers";
import Panel from "./containers/Panel";
import Home from "./containers/Home";

// Modules
import parseHashQuery from "lib/parse-hash-query";
import request from "lib/request";

// Constants
import { XACC } from "constants/config";

class App extends React.Component {
	
    constructor(props) {
        super(props);

        this.state = {
            hash: location.hash.split('?')[0].split('/'),
            loading: true
        };

        window.onhashchange = () => {
            this.setState({
                hash: location.hash.split('?')[0].split('/')
            });
        };

        this._login = this._login.bind(this);

        this._login();
    }

    _login() {
        const q = parseHashQuery();

        // Attempt to login using XID/AUTH or skip to initialize()
        if (q.xid && q.auth) {
            request({
                url: "api/account/login",
                method: "POST",
                data: { xid: q.xid, auth: q.auth },
                success: (res) => {
                    if (res.error) {
                        location.href = XACC + "login/11";
                    }
                    else {
                        // Clear ?xid=...&auth=... from hash
                        this.setState({ loading: false });
                        location.hash = location.hash.split('?')[0];
                    }
                }
            });
        }
        // User must be logged in if anywhere but home page
        else if (location.hash) {
            request({
                url: "api/account/status",
                success: (res) => {
                    if (!res.loggedIn)
                        location.href = XACC + "login/11";
                    else
                        this.setState({ loading: false });
                }
            });
        }
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