import React from "react";

// Modules
import request from "lib/request";
import round from "lib/../../lib/round";

export default class AdvertiserCampaignsList extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            campaigns: []
        };
    }

    componentWillMount() {
        request({
            url: "api/advertisers/campaigns",
            success: (response) => this.setState(response)
        });
    }

    render() {
        let campaigns = [];

        if (!this.state.campaigns.length) {
            campaigns.push(
                <div className="advertisers-campaigns-none">
                    <h3>You do not have any active campaigns!</h3>
                </div>
            );
        }
        else {
            let c;

            for (let i = 0; i < this.state.campaigns.length; i++) {
                c = this.state.campaigns[i];

                c.link = "#/advertisers/campaign/" + c.id;
                c.payType = c.payType == 1 ? "clicks" : "views";
                
                if (c.dailyFunds == 0)
                    c.allocated = <span>No Limit Set</span>;
                else
                    c.allocated = <span><b>{'$' + c.dailyFundsUsed}</b> used of <b>{'$' + c.dailyFunds}</b> daily limit</span>;

                campaigns.push(
                    <div className="advertisers-campaigns-campaign">
                        <div className="campaign-top">
                            {!!c.approved ? (
                                <span
                                    title="Approved Campaign"
                                    className="icon-ok"
                                />
                            ) : (
                                <span
                                    title="Campaign Approval Pending"
                                    className="icon-pending"
                                />
                            )}
                            <span className="campaign-name">
                                <a href={c.link}>{c.name}</a>
                            </span>
                            <span className="campaign-completed">{c.provided == 0 ? (
                                "0.00%"
                            ) : (
                                round(c.provided / c.requested, 2) + '%'
                            )}</span>
                        </div>

                        <div className="campaign-bottom">
                            <span><b>{"$" + c.funds}</b> in Campaign</span>
                            {c.allocated}
                            <span><b>{c.provided}</b> {c.payType} received of <b>{c.requested}</b></span>
                        </div>
                    </div>
                );
            }
        }

        return (
            <div className="advertisers-campaigns">
                {campaigns}
            </div>
        );
    }

}