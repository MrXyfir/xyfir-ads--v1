import React from "react";

// Components
import Manage from "components/publishers/campaign/Manage";
import Create from "components/publishers/campaign/Create";
import List from "components/publishers/campaign/List";

export default class PublisherCampaigns extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.hash[2] == "campaigns") {
            return <List {...this.props} />;
        }
        else {
            if (this.props.hash[3] == "create") {
                return <Create {...this.props} />;
            }
            else {
                return (
                    <Manage
                        {...this.props}
                        id={this.props.hash[3]}
                        action={this.props.hash[4] || "view"}
                    />
                );
            }
        }
    }

}