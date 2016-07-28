import React from "react";

// Components
import Button from "components/forms/Button";

// Modules
import request from "lib/request";

export default class RegisterAdvertiser extends React.Component {

    constructor(props) {
        super(props);

        this.register = this.register.bind(this);
    }

    onRegister() {
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
        return (
            <div className="home-register-advertiser">
                <h3>Become an Advertiser</h3>
                <Button type="primary" onClick={() => this.onRegister()}>Register</Button>
            </div>
        );
    }

}
