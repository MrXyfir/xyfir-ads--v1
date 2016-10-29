import React from "react";

// Components
import Awaiting from "components/panel/awaiting/Index";

// Modules
import request from "lib/request";

// Constants
import { XACC } from "constants/config";

export default class Panel extends React.Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        request({
            url: "api/account/status",
            success: (res) => {
                if (!res.loggedIn)
                    location.href = XACC + "login/11";
                else if (!res.admin)
                    location.hash = "";
            }
        });
    }

    render() {
        switch(this.props.hash[2]) {
            case "awaiting":
                return <Awaiting hash={this.props.hash} />;
        }
    }

}