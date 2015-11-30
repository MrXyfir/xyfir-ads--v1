module.exports = React.createClass({

    getInitialState: function() {
        return {
            error: false, message: '',
            autobid: campaignData.autobid,
            pricing: {
                base: 0, competitors: 0, average: 0, highest: 0
            }
        };
    },

    componentWillMount: function() {
        // Load pricing info for category+adtype+paytype
        var url = API + "ad/pricing?adType=" + campaignData.type
            + "&payType=" + campaignData.payType + "&category=" + campaignData.category;

        ajax({
            url: URL,
            dataType: "json",
            sucess: function(res) {
                this.setState({ pricing: res });
            }.bind(this)
        });
    },

    next: function () {
        this.step('+');
    },

    back: function() {
        this.step('-');
    },

    step: function(action) {
        // Check if user has enough funds in account
        // Check if bid is valid
        // Check if user can pay for requested at bid
        // Check if dailyFunds > funds

        // Save data

        this.props.step(action);
    },

    toggleBidType: function() {
        this.setState({ autobid: !this.state.autobid });
    },

    render: function () {
        var alert, bidding;
        if (this.state.error) alert = <Alert type="error" title="Error!">{this.state.message}</Alert>;

        // Build 'bidding' based on bid type
        if (this.state.autobid) {

        }
        else {

        }

        return (
            <div className="form-step">
                <div className="form-step-head">
                    <h2>Funding</h2>
                    <p>Add funds to your campaign and determine how much you'll pay.</p>
                </div>

                <div className="form-step-body">
                    {alert}

                    <label>Requested {campaignData.payType == 1 ? "Clicks" : "Views"}</label>
                    <input type="number" step="1000" defaultValue={campaignData.requested} ref="requested" />

                    <label>Allocate Funds</label>
                    <small>Add funds from your account to the ad campaign.</small>
                    <input type="number" min="10.00" defaultValue={campaignData.allocated} ref="funds" />

                    <label>Daily Funds Limit</label>
                    <small>Prevent your campaign from costing more than your set limit per day. (leave at $0.00 for no limit)</small>
                    <input type="number" defaultValue={campaignData.dailyFunds} ref="dailyFunds" />

                    <a onClick={this.toggleBidType}>Switch to {this.state.autobid ? "Manual" : "Automatic"} Bidding</a>
                    {bidding}
                </div>

                <div className="form-step-nav">
                    <Button type="secondary" onClick={this.back}>Back</Button>
                    <Button onClick={this.next}>Next</Button>
                </div>
            </div>
        );
    }

});