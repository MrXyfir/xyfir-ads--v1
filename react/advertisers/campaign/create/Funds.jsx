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
        var funds = +this.refs.funds.value, dailyFunds = +this.refs.dailyFunds.value, requested = +this.refs.requested.value;

        // Grab funds currently in user's account
        ajax({
            url: API + "advertisers/account",
            dataType: "json",
            sucess: function(res) {
                // Check if user has enough funds in account
                if (funds > res.funds) {
                    this.setState({ error: true, message: "You do not have enough funds in your account" });
                    return;
                }

                // Check if bid is valid
                if (!this.state.autobid && +this.refs.bid.value < this.state.pricing.base) {
                    this.setState({ error: true, message: "Your bid cannot be lower than the category's base price" });
                    return;
                }

                var bid = this.state.autobid ? this.state.pricing.base : this.refs.bid.value;

                // Check if user can pay for requested at bid price
                if ((bid * requested) > funds) {
                    this.setState({
                        error: true,
                        message: "Not enough allocated funds to pay for requested " + (campaignData.payType == 1 ? "clicks" : "views")
                            + " at bid price of $" + bid
                    });
                    return;
                }

                if (dailyFunds > funds || dailyFunds < 0.50) {
                    this.setState({ error: true, message: "Daily funds cannot be greater than allocated funds or less than $0.50" });
                    return;
                }

                // Save data to campaignData
                campaignData.requested = requested, campaignData.allocated = funds, campaignData.dailyFunds = dailyFunds;
                campaignData.autobid = this.state.autobid, campaignData.bid = (this.state.autobid ? 0.00 : bid);

                this.props.step(action);
            }.bind(this)
        });
    },

    toggleBidType: function() {
        this.setState({ autobid: !this.state.autobid });
    },

    render: function () {
        var alert, bidding;
        if (this.state.error) alert = <Alert type="error" title="Error!">{this.state.message}</Alert>;

        // Build 'bidding' based on bid type
        if (this.state.autobid) {
            bidding = (
                <div>
                    <h4>Automatic Bidding Enabled</h4>
                    <p>
                        <b>Lowest Possible Bid:</b> {'$' + this.state.pricing.base}
                        <br />
                        <b>Average Bid:</b> {'$' + this.state.pricing.average}
                    </p>
                </div>
            );
        }
        else {
            bidding = (
                <div>
                    <label>Bid</label>
                    <small>Cannot be lower than category's base price.</small>
                    <input type="number" step="0.001" ref="bid" min={this.state.pricing.base} defaultValue={campaignData.bid} />
                </div>
            );
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

                    <h3>Ad Pricing for Category</h3>
                    <div className="panels ad-pricing-info">
                        <div className="panel">
                            <span className="panel-head">Base Price</span>
                            <span className="panel-body">{'$' + this.state.pricing.base}</span>
                        </div>
                        <div className="panel">
                            <span className="panel-head">Competitors</span>
                            <span className="panel-body">{this.state.pricing.competitors}</span>
                        </div>
                        <div className="panel">
                            <span className="panel-head">Average Bid</span>
                            <span className="panel-body">{'$' + this.state.pricing.average}</span>
                        </div>
                        <div className="panel">
                            <span className="panel-head">Highest Bid</span>
                            <span className="panel-body">{'$' + this.state.pricing.highest}</span>
                        </div>
                    </div>

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