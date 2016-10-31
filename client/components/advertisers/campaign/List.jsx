import React from "react";

// Modules
import request from "lib/request";
import round from "lib/../../lib/round";

export default class AdvertiserCampaignsList extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = { campaigns: [], sort: "active" };
    }

    componentWillMount() {
        request({
            url: "api/advertisers/campaigns",
            success: (response) => this.setState(response)
        });
    }

    render() {
        const campaigns = this.state.campaigns.filter(c => {
            switch (this.state.sort) {
                case "ended":
                    return c.approved == 1 && c.ended;
                case "denied":
                    return c.approved == 2;
                case "active":
                    return c.approved == 1 && !c.ended;
                case "pending":
                    return c.approved == 0;
            }
        });
        
        return (
            <div className="advertisers-campaigns">

                <section className="sort">
                    <label>Sort by Status</label>
                    <select
                        className="sort"
                        default="active"
                        onChange={(e) => this.setState({ sort: e.target.value })}
                    >
                        <option value="active">Active</option>
                        <option value="pending">Pending Approval</option>
                        <option value="ended">Ended/Complete</option>
                        <option value="denied">Denied</option>
                    </select>
                </section>
            
                <section className="campaigns">
                    {!campaigns.length ? (
                        <p className="advertisers-campaigns-none">
                            You do not have any {this.state.sort} campaigns!
                        </p>
                    ) : campaigns.map(c => {
                        return (
                            <div className="advertisers-campaigns-campaign">
                                <div className="campaign-top">
                                    <span className="campaign-name">
                                        <a href={"#/advertisers/campaign/" + c.id}>{
                                            c.name
                                        }</a>
                                    </span>
                                </div>

                                <div className="campaign-middle">
                                    <span className="campaign-completed">
                                        {c.provided == 0
                                            ? "0.00"
                                            : round(c.provided / c.requested, 2)
                                        }% Complete
                                    </span>
                                </div>

                                <div className="campaign-bottom">
                                    <span>${c.funds} in Campaign</span>
                                    
                                    {c.dailyFunds == 0 ? (
                                        <span className="daily-limit">
                                            No Limit Set
                                        </span>
                                    ) : (
                                        <span className="daily-limit">
                                            ${c.dailyFundsUsed} used of ${
                                                c.dailyFunds
                                            } daily limit
                                        </span>
                                    )}
                                    
                                    <span className="provided">
                                        {c.provided} {
                                            c.payType == 1 ? "clicks" : "views"
                                        } received of {c.requested}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </section>
            </div>
        )
    }

}