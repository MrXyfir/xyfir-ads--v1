import React from "react";

// Components
import Button from "components/forms/Button";
import Alert from "components/forms/Alert";

// Module
import request from "lib/request";

export default class EndAdvertiserCampaign extends React.Component {

    constructor(props) {
        super(props);
    }

    onConfirm() {
        request({
            url: "api/advertisers/campaigns/" + this.props.id,
            method: "DELETE", success: (res) => {
                if (!res.error)
                    location.hash = "/advertisers/campaigns";
                else
                    swal("Error", res.message, "error");
            }
        });
    }

    render() {
        return(
            <div className="end-campaign">
                <Alert alert="danger" title="Warning!">
                    Are you sure you want to end this campaign? This action cannot be undone.
                </Alert>
                <Button onClick={() => this.onConfirm()}>End Campaign</Button>
            </div>
        );
    }

}