import React from "react";

// Components
import Campaigns from "components/advertisers/Campaigns";
import Account from "components/advertisers/Account";

// Modules
import request from "lib/request";

export default class Advertisers extends React.Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        request({
            url: "api/account/status",
            success: (res) => {
                if (!res.loggedIn)
                    location.href = XACC + "login/11";
                else if (!res.advertiser)
                    location.hash = "";
            }
        });
    }

    render() {
        let view;
        switch (this.props.hash[2]) {
            case "campaigns":
            case "campaign":
                view = <Campaigns {...this.props} />; break;
            default:
                view = <Account {...this.props} />;
        }

        return (
            <div className="advertisers">
                <nav className="advertisers-nav">
                    <a href="#/advertisers/campaign/create" className="link-lg">Create Campaign</a>
                    <a href="#/advertisers/campaigns" className="link-lg">View Campaigns</a>
                    <a href="#/advertisers/account" className="link-lg">My Account</a>
                </nav>

                {view}
            </div>
        );
    }

}