var Button = require("../../../forms/Button");
var Alert = require("../../../forms/Alert");

module.exports = React.createClass({

    getInitialState: function() {
        return { error: false, message: "", confirm: false };
    },

    confirm: function() {
        ajax({
            url: API + "advertisers/campaigns/" + this.props.id,
            method: "DELETE",
            dataType: "json",
            success: function(res) {
                res.confirm = true;
                this.setState(res);

                // Send user back to their campaigns
                setTimeout(function () {
                    window.location.href = "../../campaigns";
                }, 7 * 1000);
            }.bind(this)
        });
    },

    render: function() {
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
                    <Button onClick={this.confirm}>End Campaign</Button>
                </div>
            );
        }
    }

});