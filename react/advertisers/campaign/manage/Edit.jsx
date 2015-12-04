var Button = require("../../../forms/Button");
var Alert = require("../../../forms/Alert");

// ** Allow user to edit other variables accepted by API
module.exports = React.createClass({

    getInitialState: function () {
        return {
            name: "", ended: false, available: "", approved: false, payType: 0,
            dailyFunds: 0, funds: 0, autobid: false, cost: 0,
            userTargets: {
                age: "", countries: "", regions: "", genders: "",
            },
            contentTargets: {
                categories: "", keywords: "", sites: ""
            },
            pricing: {
                base: 0, competitors: 0, average: 0, highest: 0
            },
            ad: {
                type: 0
            },
            error: false, message: "", loading: true
        };
    },

    componentWillMount: function() {
        // Campaign data
        ajax({
            url: API + "advertisers/campaigns/" + this.props.id,
            dataType: "json",
            success: function(res) {
                res.loading = false;

                this.setState(res, function() {
                    var url = API + "ad/pricing?adType=" + this.state.ad.type
                        + "&payType=" + this.state.payType + "&category="
                        + encodeURIComponent(this.state.contentTargets.categories);

                    // Get pricing data
                    ajax({
                        url: url,
                        dataType: "json",
                        success: function(res) {
                            this.setState({
                                pricing: {
                                    base: res.base,
                                    competitors: res.competitors,
                                    average: (res.average == null ? res.base : res.average),
                                    highest: (res.highest == null ? res.base : res.highest)
                                }
                            });
                        }.bind(this)
                    });
                }.bind(this));
            }.bind(this)
        });
    },

    // Add or remove funds from campaign
    modifyFunds: function () {
        ajax({
            url: API + "advertisers/campaigns/" + this.props.id + "/funds",
            data: {
                action: this.refs.addFundsAction.value,
                amount: this.refs.addFundsAmount.value
            },
            method: "PUT",
            dataType: "json",
            success: function (res) {
                this.setState(res);
            }.bind(this)
        });
    },

    // Set daily allocated funds limit
    dailyBudget: function() {
        ajax({
            url: API + "advertisers/campaigns/" + this.props.id + "/budget",
            data: {
                dailyBudget: +this.refs.dailyBudget.value
            },
            method: "PUT",
            dataType: "json",
            success: function(res) {
                this.setState(res);
            }.bind(this)
        });
    },

    toggleBidType: function() {
        this.setState({ autobid: !this.state.autobid });
    },

    // Enable autobid / set bid
    updateBid: function() {
        var data = {};
        
        if (this.state.autobid)
            data.autobid = true;
        else
            data.bid = +this.refs.bid.value;

        ajax({
            url: API + "advertisers/campaigns/" + this.props.id + "/bid",
            data: data,
            method: "PUT",
            dataType: "json",
            success: function(res) {
                this.setState(res);
            }.bind(this)
        });
    },

    // Update name/requested/keywords
    update: function() {
        var data = {
            name: this.refs.name.value, requested: +this.refs.requested.value,
            available: this.state.available, ut_age: this.state.userTargets.age,
            ct_keywords: this.refs.keywords.value, ct_sites: this.state.contentTargets.sites,
            ut_genders: this.state.userTargets.genders, ut_countries: this.state.userTargets.countries,
            ut_regions: this.state.userTargets.regions
        };

        ajax({
            url: API + "advertisers/campaigns/" + this.props.id,
            data: data,
            method: "PUT",
            dataType: "json",
            success: function (res) {
                this.setState(res);
            }.bind(this)
        });
    },

    render: function() {
        if (this.state.loading) {
            return <div></div>;
        }
        else if (this.state.ended || !this.state.approved) {
            return <Alert type="error" title="Error!">You cannot edit pending or ended campaigns.</Alert>;
        }

        var c = this.state, alert, bidding;

        // Alert
        if (c.error || c.message != "") {
            alert = (
                <Alert type={c.error ? "error" : "success"} title={c.error ? "Error!" : "Success!"}>{c.message}</Alert>
            );
        }

        // Build 'bidding' based on bid type
        if (c.autobid) {
            bidding = (
                <div>
                    <h4>Automatic Bidding Enabled</h4>
                    <p>
                        <b>Lowest Possible Bid:</b> {'$' + c.pricing.base}
                        <br />
                        <b>Average Bid:</b> {'$' + c.pricing.average}
                    </p>
                </div>
            );
        }
        else {
            bidding = (
                <div>
                    <h3>Bid</h3>
                    <small>Cannot be lower than category's base price.</small>
                    <input type="number" step="0.001" ref="bid" min={c.pricing.base} defaultValue={c.cost} />
                </div>
            );
        }

        return(
            <div className="campaign-edit">
                {alert}

                <div className="form-group basic-info">
                    <h3>Campaign Name</h3>
                    <input type="text" ref="name" defaultValue={c.name} />

                    <h3>Requested</h3>
                    <small>Add amount to requested {c.payType == 1 ? "clicks" : "views"}.</small>
                    <input type="number" ref="requested" step="1000" />

                    <h3>Keywords</h3>
                    <textarea ref="keywords" defaultValue={c.contentTargets.keywords}></textarea>

                    <Button onClick={this.update}>Update</Button>
                </div>
                
                <hr />

                <h3>Funds</h3>
                <div className="form-group add-funds">
                    <select ref="addFundsAction">
                        <option value="add">Add Funds to Campaign</option>
                        <option value="rem">Remove Funds From Campaign</option>
                    </select>
                    <input ref="addFundsAmount" type="number" step="5.00" />
                    <Button onClick={this.modifyFunds}>Update Funds</Button>
                </div>

                <hr />

                <h3>Daily Budget</h3>
                <p>Set a limit on how much you can be charged per day. Leave at $0.00 for no limit.</p>
                <div className="form-group daily-budget">
                    <input type="number" ref="dailyBudget" defaultValue={c.dailyFunds} max={c.funds} step="1.00" />
                    <Button onClick={this.dailyBudget}>Set Daily Budget</Button>
                </div>

                <hr />

                <h3>Bid Cost</h3>
                <p>Determine how much you'll pay per {c.payType == 1 ? "click" : "view"}.</p>
                <div className="form-group bid-cost">
                    <div className="panels ad-pricing-info">
                        <div className="panel">
                            <div className="panel-title">Base Price</div>
                            <div className="panel-body">{'$' + c.pricing.base}</div>
                        </div>
                        <div className="panel">
                            <div className="panel-title">Competitors</div>
                            <div className="panel-body">{c.pricing.competitors}</div>
                        </div>
                        <div className="panel">
                            <div className="panel-title">Average Bid</div>
                            <div className="panel-body">{'$' + c.pricing.average}</div>
                        </div>
                        <div className="panel">
                            <div className="panel-title">Highest Bid</div>
                            <div className="panel-body">{'$' + c.pricing.highest}</div>
                        </div>
                    </div>
                    
                    <a onClick={this.toggleBidType}>Switch to {c.autobid ? "Manual" : "Automatic"} Bidding</a>
                    
                    {bidding}
                    
                    <Button onClick={this.updateBid}>Update Bid</Button>
                </div>
            </div>
        );
    }

});