﻿import React from "react";

// Components
import Button from "components/forms/Button";

// Module
import request from "lib/request";

// ** Allow user to edit other variables accepted by API
export default class EditAdvertiserCampaign extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            name: "", ended: false, available: "", approved: 0, payType: 0,
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
            loading: true
        };
    }

    componentWillMount() {
        // Campaign data
        request({
            url: "api/advertisers/campaigns/" + this.props.id,
            success: (res) => {
                res.loading = false;

                this.setState(res, () => {
                    const url = "api/ad/pricing?adType=" + this.state.ad.type
                        + "&payType=" + this.state.payType + "&category="
                        + encodeURIComponent(this.state.contentTargets.categories);

                    // Get pricing data
                    request({url, success: (res) => {
                        this.setState({
                            pricing: {
                                base: res.base,
                                competitors: res.competitors,
                                average: (res.average == null ? res.base : res.average),
                                highest: (res.highest == null ? res.base : res.highest)
                            }
                        });
                    }});
                });
            }
        });
    }

    // Add or remove funds from campaign
    onModifyFunds(e) {
        e.preventDefault();

        request({
            url: "api/advertisers/campaigns/" + this.props.id + "/funds",
            data: {
                action: this.refs.addFundsAction.value,
                amount: this.refs.addFundsAmount.value
            }, method: "PUT", success: (res) => this._alert(res)
        });
    }

    // Set daily allocated funds limit
    onDailyBudget() {
        request({
            url: "api/advertisers/campaigns/" + this.props.id + "/budget",
            data: { dailyBudget: +this.refs.dailyBudget.value },
            method: "PUT", success: (res) => this._alert(res)
        });
    }

    onToggleBidType() {
        this.setState({ autobid: !this.state.autobid });
    }

    // Enable autobid / set bid
    onUpdateBid() {
        let data = {};
        
        if (this.state.autobid)
            data.autobid = true;
        else
            data.bid = +this.refs.bid.value;

        request({
            url: "api/advertisers/campaigns/" + this.props.id + "/bid",
            data, method: "PUT", success: (res) => this._alert(res)
        });
    }

    // Update name/requested/keywords
    onUpdate() {
        const data = {
            name: this.refs.name.value, requested: +this.refs.requested.value,
            available: this.state.available, ut_age: this.state.userTargets.age,
            ct_keywords: this.refs.keywords.value, ct_sites: this.state.contentTargets.sites,
            ut_genders: this.state.userTargets.genders, ut_countries: this.state.userTargets.countries,
            ut_regions: this.state.userTargets.regions
        };

        request({
            url: "api/advertisers/campaigns/" + this.props.id,
            data, method: "PUT", success: (res) => this._alert(res)
        });
    }

    _alert(alert) {
        if (alert.error)
            swal("Error", alert.message, "error");
        else
            swal("Success", alert.message, "success");
    }

    render() {
        if (this.state.loading) {
            return <div />;
        }
        
        if (this.state.ended || this.state.approved != 1) {
            return (
                <p>You can only edit approved and active campaigns.</p>
            );
        }

        let c = this.state;

        return(
            <div className="campaign-edit">
                <section className="basic-info">
                    <label>Campaign Name</label>
                    <input type="text" ref="name" defaultValue={c.name} />

                    <label>Requested</label>
                    <span className="input-description">
                        Add amount to requested {
                            c.payType == 1 ? "clicks" : "views"
                        }.
                    </span>
                    <input type="number" ref="requested" step="1000" />

                    <label>Keywords</label>
                    <textarea
                        ref="keywords"
                        defaultValue={c.contentTargets.keywords}
                    />

                    <Button onClick={() => this.onUpdate()}>Update</Button>
                </section>
                
                <section className="add-funds">
                    <label>Funds</label>
                    <select ref="addFundsAction">
                        <option value="add">Add Funds to Campaign</option>
                        <option value="rem">Remove Funds From Campaign</option>
                    </select>
                    <input ref="addFundsAmount" type="number" step="5.00" />
                    
                    <Button onClick={() => this.onModifyFunds()}>
                        Update Funds
                    </Button>
                </section>

                <section className="daily-budget">
                    <label>Daily Budget</label>
                    <span className="input-description">
                        Set a limit on how much you can be charged per day. Leave at $0.00 for no limit.
                    </span>

                    <input
                        type="number"
                        ref="dailyBudget"
                        defaultValue={c.dailyFunds}
                        max={c.funds}
                        step="1.00"
                    />
                    <Button onClick={() => this.onDailyBudget()}>Set Daily Budget</Button>
                </section>

                <section className="bid-cost">
                    <label>Bid Cost</label>
                    <span className="input-description">
                        Determine how much you'll pay per {
                            c.payType == 1 ? "click" : "view"
                        }.
                    </span>

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
                    
                    <a onClick={() => this.onToggleBidType()}>
                        Switch to {c.autobid ? "Manual" : "Automatic"} Bidding
                    </a>
                    
                    {c.autobid ? (
                        <div className="auto-bidding">
                            <h4>Automatic Bidding Enabled</h4>
                            <p>
                                <b>Lowest Possible Bid:</b> {'$' + c.pricing.base}
                                <br />
                                <b>Average Bid:</b> {'$' + c.pricing.average}
                            </p>
                        </div>
                    ) : (
                        <div className="manual-bidding">
                            <label>Bid</label>
                            <span className="input-description">
                                Cannot be lower than category's base price.
                            </span>
                            <input
                                type="number"
                                step="0.001"
                                ref="bid"
                                min={c.pricing.base}
                                defaultValue={c.cost}
                            />
                        </div>
                    )}
                    
                    <Button onClick={() => this.updateBid()}>Update Bid</Button>
                </section>
            </div>
        );
    }

}