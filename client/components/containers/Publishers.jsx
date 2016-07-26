import React from "react";

// Components
import Campaigns from "components/publishers/Campaigns";
import Account from "components/publishers/Account";

export default class Publishers extends React.Component {

    constructor(props) {
        super(props);
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
            <div className="publishers">
                <nav className="publishers-nav">
                    <a href="#/publishers/campaign/create" className="link-lg">Create Campaign</a>
                    <a href="#/publishers/campaigns" className="link-lg">View Campaigns</a>
                    <a href="#/publishers/account" className="link-lg">My Account</a>
                </nav>

                {view}
            </div>
        );
    }

}