import React from "react";

// Components
import Button from "components/forms/Button";
import Alert from "components/forms/Alert";

export default class BasicInfo extends React.Component {

    constructor(props) {
        super(props);

        this.state = { error: false, message: '' };
    }

    onNext() {
        let name = this.refs.name.value,
            type = this.refs.type.value,
            payType = this.refs.payType.value;

        // Save data to window.campaignData even if it's not valid
        window.campaignData.name = name,
        window.campaignData.type = type,
        window.campaignData.payType = payType;
        window.campaignData.available = Math.round(
            (new Date().getTime() - (86400 * 1000)) / 1000
        ) + '-';

        // Validate data
        if (!name.match(/^[\w\d -]{3,25}$/))
            this.setState({ error: true, message: "Invalid campaign name: 3-25 characters, letters/numbers/spaces/hyphens only" });
        else if (type <= 0 || type > 4)
            this.setState({ error: true, message: "Invalid ad type chosen" });
        else if (payType <= 0 || payType > 2)
            this.setState({ error: true, message: "Invalid paytype chosen" });
        else if (payType == 1 && type == 4)
            this.setState({ error: true, message: "Video ads cannot be pay per click" });
        else // Next step if data is valid
            this.props.step('+');
    }

    // ** Implement ability for user to choose ad availability
    render() {
        let alert;
        if (this.state.error) {
            alert = <Alert type="error" title="Error!">{this.state.message}</Alert>
        };

        return (
            <div className="form-step">
                <div className="form-step-head">
                    <h2>Basic Information</h2>
                    <p>Tell us what type of ad you want and then give your ad campaign a name.</p>
                </div>

                <div className="form-step-body">
                    {alert}

                    <label>Campaign Name</label>
                    <input type="text" ref="name" defaultValue={window.campaignData.name} />

                    <label>Ad Type</label>
                    <select ref="type" defaultValue={window.campaignData.type}>
                        <option value="1">Text</option>
                        <option value="2">Short</option>
                        <option value="3">Image</option>
                        <option value="4">Video</option>
                    </select>

                    <label>Payment Type</label>
                    <select
                        ref="payType"
                        defaultValue={window.campaignData.payType}
                    >
                        <option value="1">Pay Per Click</option>
                        <option value="2">Pay Per View</option>
                    </select>
                </div>

                <div className="form-step-nav">
                    <Button onClick={() => this.onNext()}>Next</Button>
                </div>
            </div>
        );
    }

}