import React from "react";

// Components
import Button from "components/forms/Button";

// Modules
import request from "lib/request";

export default class RegisterAdvertiser extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        request({
            url: "api/advertisers/account/register",
            method: "POST", success: (response) => {
                if (response.error)
                    alert(response.message);
                else
                    location.hash = "/advertisers";
            }
        });
    }

    render() {
        return <div />;
    }

}
