import React from "react";

// Components
import Button from "components/forms/Button";
import Alert from "components/forms/Alert";

// Module
import request from "lib/request";

export default class EndAdvertiserCampaign extends React.Component {

    constructor(props) {
        super(props);

        this.state = { error: false, message: "", confirm: false };
    }

    onConfirm() {
        request({
            url: "api/advertisers/campaigns/" + this.props.id,
            method: "DELETE", success: (res) => {
                res.confirm = true;
                this.setState(res);

                // Send user back to their campaigns
                setTimeout(function () {
                    location.hash = "/advertisers/campaigns";
                }, 7 * 1000);
            }
        });
    }

    render() {
        if (this.state.confirm) {
            return(
                <div className="end-campaign">
                    <Alert type={this.state.error ? "error" : "success"} title={this.state.error ? "Error!" : "Success!"}>
                        {this.state.message}
                    </Alert>
                </div>
            );
        }
        else {
            return(
                <div className="end-campaign">
                    <Alert alert="danger" title="Warning!">
                        Are you sure you want to end this campaign? Any funds in the campaign will be lost!
                    </Alert>
                    <Button onClick={() => this.onConfirm}>End Campaign</Button>
                </div>
            );
        }
    }

}