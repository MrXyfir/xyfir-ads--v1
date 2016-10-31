import React from "react";

// Components
import Button from "components/forms/Button";

// Module
import request from "lib/request";

// ** Allow user to modify their categories
export default class EditPublisherCampaign extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            name: "", categories: "", keywords: "", site: "", type: 0, test: ""
        };
    }

    componentWillMount() {
        request({
            url: "api/publishers/campaigns/" + this.props.id,
            success: (res) => this.setState(res)
        });
    }

    onUpdate(e) {
        e.preventDefault();

        const data = {
            name: this.refs.name.value, keywords: this.refs.keywords.value,
            site: this.refs.site.value, type: +this.refs.type.value,
            categories: this.state.categories
        };

        request({
            url: "api/publishers/campaigns/" + this.props.id,
            data, method: "PUT", success: (res) => {
                if (res.error)
                    swal("Error", res.message, "error");
                else
                    swal("Success", res.message, "success");
            }
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

        let c = this.state;

        return(
            <div className="campaign-edit">
                <section className="edit">
                    <form onSubmit={(e) => this.onUpdate(e)}>
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

                        <Button>Update</Button>
                    </form>
                </section>

                <section className="test-key">
                    <label>Test Key</label>
                    <input
                        type="text"
                        onFocus={(e) => e.target.select()}
                        value={c.test}
                    />
                    
                    <Button
                        type="secondary"
                        onClick={() => this.onGenerateTestKey()}
                    >
                        Generate New Key
                    </Button>
                </section>
            </div>
        );
    }

}