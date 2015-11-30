module.exports = React.createClass({

    next: function () {
        var name = this.refs.name.value, type = this.refs.type.value, payType = this.refs.payType.value;

        // Save data to campaignData even if it's not valid
        campaignData.name = name, campaignData.type = type, campaignData.payType = payType;
        campaignData.available = new Date().getTime() - (86400 * 1000) + '-';

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
    },

    // ** Implement ability for user to choose ad availability
    render: function () {
        var alert;
        if (this.state.error) alert = <Alert type="error" title="Error!">{this.state.message}</Alert>;

        return (
            <div className="form-step">
                <div className="form-step-head">
                    <h2>Basic Information</h2>
                    <p>Tell us what type of ad you want and then give your ad campaign a name.</p>
                </div>

                <div className="form-step-body">
                    {alert}

                    <label>Campaign Name</label>
                    <input ref="name" defaultValue={campaignData.name} />

                    <label>Ad Type</label>
                    <select ref="type" defaultValue={campaignData.type}>
                        <option value="1">Text</option>
                        <option value="2">Short</option>
                        <option value="3">Image</option>
                        <option value="4">Video</option>
                    </select>

                    <label>Payment Type</label>
                    <select ref="payType" defaultValue={campaignData.payType}>
                        <option value="1">Pay Per Click</option>
                        <option value="2">Pay Per View</option>
                    </select>
                </div>

                <div className="form-step-nav">
                    <Button onClick={this.next}>Next</Button>
                </div>
            </div>
        );
    }

});