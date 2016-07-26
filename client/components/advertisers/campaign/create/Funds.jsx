import React from "react";

// Components
import Button from "components/forms/Button";
import Alert from "components/forms/Alert";

// Modules
import request from "lib/request";

export default class Funds extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            error: false, message: '',
            autobid: window.campaignData.autobid,
            pricing: {
                base: 0, competitors: 0, average: 0, highest: 0
            }
        };
    }

    componentWillMount() {
        // Load pricing info for category+adtype+paytype
        const url = "api/ad/pricing?adType=" + window.campaignData.type
            + "&payType=" + window.campaignData.payType + "&category="
            + encodeURIComponent(window.campaignData.category);

        request({
            url, success: (res) => {
                this.setState({
                    pricing: {
                        base: res.base,
                        competitors: res.competitors,
                        average: (res.average == null ? res.base : res.average),
                        highest: (res.highest == null ? res.base : res.highest)
                    }
                });
            }
        });
    }

    onNext() {
        this._step('+');
    }

    onBack() {
        this._step('-');
    }

    _step(action) {
        let funds = +this.refs.funds.value,
            dailyFunds = +this.refs.dailyFunds.value,
            requested = +this.refs.requested.value;

        // Grab funds currently in user's account
        request({url: "api/advertisers/account", success: (res) => {
            // Check if user has enough funds in account
            if (funds > res.funds) {
                this.setState({
                    error: true,
                    message: "You do not have enough funds in your account"
                }); return;
            }

            // Check if bid is valid
            if (!this.state.autobid && +this.refs.bid.value < this.state.pricing.base) {
                this.setState({
                    error: true,
                    message: "Your bid cannot be lower than the category's base price"
                }); return;
            }

            let bid = this.state.autobid ? this.state.pricing.base : this.refs.bid.value;

            // Check if user can pay for requested at bid price
            if ((bid * requested) > funds) {
                this.setState({
                    error: true,
                    message: "Not enough allocated funds to pay for requested "
                        + (window.campaignData.payType == 1 ? "clicks" : "views")
                        + " at bid price of $" + bid
                }); return;
            }

            if (dailyFunds > 0 && (dailyFunds > funds || dailyFunds < 0.50)) {
                this.setState({
                    error: true,
                    message: "Daily funds cannot be greater than allocated funds"
                        + " or less than $0.50"
                }); return;
            }

            // Save data to window.campaignData
            window.campaignData.requested = requested,
            window.campaignData.allocated = funds,
            window.campaignData.dailyFunds = dailyFunds,
            window.campaignData.autobid = this.state.autobid,
            window.campaignData.bid = (this.state.autobid ? 0.00 : bid);

            this.props.step(action);
        }});
    }

    onToggleBidType() {
        this.setState({ autobid: !this.state.autobid });
    }

    render() {
        let alert, bidding;
        
        if (this.state.error) {
            alert = <Alert type="error" title="Error!">{this.state.message}</Alert>;
        }

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
                <div className="form-step-body">
                    <label>Bid</label>
                    <small>Cannot be lower than category's base price.</small>
                    <input
                        type="number"
                        step="0.001"
                        ref="bid"
                        min={this.state.pricing.base}
                        defaultValue={window.campaignData.bid}
                    />
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

                    <label>Requested {window.campaignData.payType == 1 ? "Clicks" : "Views"}</label>
                    <input
                        type="number"
                        step="1000"
                        defaultValue={window.campaignData.requested}
                        ref="requested"
                    />

                    <label>Allocate Funds</label>
                    <small>Add funds from your account to the ad campaign.</small>
                    <input
                        type="number"
                        min="10.00"
                        defaultValue={window.campaignData.allocated}
                        ref="funds"
                    />

                    <label>Daily Funds Limit</label>
                    <small>
                        Prevent your campaign from costing more than your set limit per day.
                        <br />
                        Leave at $0.00 for no limit.
                    </small>
                    <input
                        type="number"
                        defaultValue={window.campaignData.dailyFunds}
                        ref="dailyFunds"
                    />

                    <h3>Ad Pricing for Category</h3>
                    <div className="panels ad-pricing-info">
                        <div className="panel">
                            <div className="panel-title">Base Price</div>
                            <div className="panel-body">{
                                '$' + this.state.pricing.base
                            }</div>
                        </div>
                        <div className="panel">
                            <div className="panel-title">Competitors</div>
                            <div className="panel-body">{
                                this.state.pricing.competitors
                            }</div>
                        </div>
                        <div className="panel">
                            <div className="panel-title">Average Bid</div>
                            <div className="panel-body">{
                                '$' + this.state.pricing.average
                            }</div>
                        </div>
                        <div className="panel">
                            <div className="panel-title">Highest Bid</div>
                            <div className="panel-body">{
                                '$' + this.state.pricing.highest
                            }</div>
                        </div>
                    </div>

                    <a onClick={this.toggleBidType}>
                        Switch to {this.state.autobid ? "Manual" : "Automatic"} Bidding
                    </a>                    
                    
                    {bidding}
                </div>

                <div className="form-step-nav">
                    <Button type="secondary" onClick={() => this.onBack()}>Back</Button>
                    <Button onClick={() => this.onNext()}>Next</Button>
                </div>
            </div>
        );
    }

}