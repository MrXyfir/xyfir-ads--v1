import React from "react";

// Components
import Button from "components/forms/Button";

export default class BasicInfo extends React.Component {

    constructor(props) {
        super(props);
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

        let error = "";

        // Validate data
        if (!name.match(/^[\w\d -]{3,25}$/))
            error = "Invalid campaign name length / characters";
        else if (type <= 0 || type > 4)
            error = "Invalid ad type chosen";
        else if (payType <= 0 || payType > 2)
            error = "Invalid paytype chosen";
        else if (payType == 1 && type == 4)
            error = "Video ads cannot be pay per click";
        else // Next step if data is valid
            this.props.step('+');

        if (error) swal("Error", error, "error");
    }

    render() {
        return (
            <div className="form-step">
                <section className="form-step-head">
                    <h2>Basic Information</h2>
                    <p>
                        Tell us what type of ad you want and then give your ad campaign a name.
                        <br />
                        <span className="note">
                            Image and video ads are currently disabled until further notice.
                        </span>
                    </p>
                </section>

                <section className="form-step-body">
                    <label>Campaign Name</label>
                    <input
                        type="text"
                        ref="name"
                        defaultValue={window.campaignData.name}
                    />

                    <label>Ad Type</label>
                    <select ref="type" defaultValue={window.campaignData.type}>
                        <option value="1">Text</option>
                        <option value="2">Short</option>
                        <option value="3" disabled>Image</option>
                        <option value="4" disabled>Video</option>
                    </select>

                    <label>Payment Type</label>
                    <select
                        ref="payType"
                        defaultValue={window.campaignData.payType}
                    >
                        <option value="1">Pay Per Click</option>
                        <option value="2">Pay Per View</option>
                    </select>
                </section>

                <section className="form-step-nav">
                    <Button onClick={() => this.onNext()}>Next</Button>
                </section>
            </div>
        );
    }

}