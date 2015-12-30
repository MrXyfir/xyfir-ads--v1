var Button = require("../../../forms/Button");
var Alert = require("../../../forms/Alert");

// ** Allow user to modify their categories
module.exports = React.createClass({

    getInitialState: function () {
        return {
            name: "", categories: "", keywords: "", site: "", type: 0, test: "",
            error: false, message: ""
        };
    },

    componentWillMount: function () {
        ajax({
            url: API + "publishers/campaigns/" + this.props.id,
            dataType: "json",
            success: function (res) {
                this.setState(res);
            }.bind(this)
        });
    },

    update: function() {
        var data = {
            name: this.refs.name.value, type: +this.refs.type.value, site: this.refs.site.value,
            keywords: this.refs.keywords.value, categories: this.state.categories
        };

        ajax({
            url: API + "publishers/campaigns/" + this.props.id,
            data: data,
            method: "PUT",
            dataType: "json",
            success: function (res) {
                this.setState(res);
            }.bind(this)
        });
    },

    generateTestKey: function() {
        ajax({
            url: API + "publishers/campaigns/" + this.props.id + "/test",
            method: "PUT",
            dataType: "json",
            success: function (res) {
                if (res.key != "") {
                    this.setState({ test: res.key });
                }
            }.bind(this)
        });
    },

    render: function() {
        if (this.state.name == "") {
            return <div></div>;
        }

        var c = this.state, alert;

        if (this.state.error)
            alert = <Alert type="error" title="Error!">{this.state.message}</Alert>
        else if (this.state.message != "")
            alert = <Alert type="success" title="Success!">{this.state.message}</Alert>

        return(
            <div className="campaign-edit">
                {alert}

                <h3>Campaign Name</h3>
                <input type="text" ref="name" defaultValue={c.name} />

                <h3>Site</h3>
                <input type="text" ref="site" defaultValue={c.site} />

                <h3>Keywords</h3>
                <textarea ref="keywords" defaultValue={c.keywords}></textarea>

                <h3>Type</h3>
                <select ref="type" defaultValue={c.type}>
                    <option value="1">Website</option>
                    <option value="2">App / Web App</option>
                </select>

                <Button onClick={this.update}>Update</Button>

                <hr />

                <h3>Test Key</h3>
                <input type="text" onclick="this.select()" value={c.test} />
                <Button type="secondary" onClick={this.generateTestKey}>Generate New Key</Button>
            </div>
        );
    }

});