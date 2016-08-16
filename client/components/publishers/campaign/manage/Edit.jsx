import React from "react";

// Components
import Button from "components/forms/Button";
import Alert from "components/forms/Alert";

// Module
import request from "lib/request";

// ** Allow user to modify their categories
export default class EditPublisherCampaign extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            name: "", categories: "", keywords: "", site: "", type: 0, test: "",
            error: false, message: ""
        };
    }

    componentWillMount() {
        request({
            url: "api/publishers/campaigns/" + this.props.id,
            success: (res) => this.setState(res)
        });
    }

    onUpdate() {
        const data = {
            name: this.refs.name.value, type: +this.refs.type.value, site: this.refs.site.value,
            keywords: this.refs.keywords.value, categories: this.state.categories
        };

        request({
            url: "api/publishers/campaigns/" + this.props.id,
            data, method: "PUT", success: (res) => this.setState(res)
        });
    }

    onGenerateTestKey() {
        request({
            url: "api/publishers/campaigns/" + this.props.id + "/test",
            method: "PUT", success: (res) => {
                if (res.key != "") {
                    this.setState({ test: res.key });
                }
            }
        });
    }

    render() {
        if (this.state.name == "") return <div />

        let c = this.state, alert;

        if (this.state.error)
            alert = <Alert type="error" title="Error!">{this.state.message}</Alert>
        else if (this.state.message != "")
            alert = <Alert type="success" title="Success!">{this.state.message}</Alert>

        return(
            <div className="campaign-edit">
                {alert}

                <label>Campaign Name</label>
                <input type="text" ref="name" defaultValue={c.name} />

                <label>Site</label>
                <input type="text" ref="site" defaultValue={c.site} />

                <label>Keywords</label>
                <textarea ref="keywords" defaultValue={c.keywords} />

                <label>Type</label>
                <select ref="type" defaultValue={c.type}>
                    <option value="1">Website</option>
                    <option value="2">App / Web App</option>
                </select>

                <Button onClick={() => this.onUpdate()}>Update</Button>

                <hr />

                <label>Test Key</label>
                <input type="text" onFocus={(e) => e.target.select()} value={c.test} />
                <Button type="secondary" onClick={() => this.onGenerateTestKey()}>
                    Generate New Key
                </Button>
            </div>
        );
    }

}