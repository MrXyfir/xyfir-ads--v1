import React from "react";

// Modules
import dimensions from "lib/../../lib/file/dimensions";
import request from "lib/request";
import round from "lib/../../lib/round";

// Components
import Button from "components/forms/Button";
import Alert from "components/forms/Alert";

export default class ViewAdvertiserCampaign extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            name: "", funds: 0, dailyFunds: 0, dailyFundsUsed: 0, ended: false,
            payType: 0, cost: 0, autobid: false, requested: 0,
            provided: 0, available: "", approved: false,
            ad: {
                type: 0, title: "", description: "", link: "", media: "",
            },
            userTargets: {
                age: "", countries: "", regions: "", genders: "",
            },
            contentTargets: {
                categories: "", keywords: "", sites: ""
            },
            error: false, message: ""
        };
    }

    componentWillMount() {
        request({
            url: "api/advertisers/campaigns/" + this.props.id,
            success: (res) => this.setState(res)
        });
    }

    render() {
        if (this.state.name == "")
            return <div></div>;

        let c = this.state, status = "", alert;

        if (this.state.error) {
            alert = <Alert type="error" title="Error!">{this.state.message}</Alert>;
        }

        if (c.ended && c.approved) status = "Ended";
        else if (c.ended && !c.approved) status = "Denied";
        else if (!c.ended && c.approved) status = "Active";
        else if (!c.ended && !c.approved) status = "Pending";

        return(
            <div className="advertisers-campaign">
                <h2>{c.name}</h2>
                <p>
                    <b>{status}</b> Campaign
                    <b> | {c.provided == 0 ? "0.00" : round(c.requested / c.provided, 2)}% </b>
                    Complete
                </p>
                
                <hr />

                <h3>Statistics</h3>
                <table className="campaign-statistics">
                    <tr>
                        <th>Pay Type</th>
                        <td>{c.payType == 1 ? "Pay-Per-Click" : "Pay-Per-View"}</td>
                    </tr>
                    <tr>
                        <th>Requested {c.payType == 1 ? "Clicks" : "Views"}</th>
                        <td>{c.requested}</td>
                    </tr>
                    <tr>
                        <th>Provided {c.payType == 1 ? "Clicks" : "Views"}</th>
                        <td>{c.provided}</td>
                    </tr>
                    <tr>
                        <th>{c.autobid ? "Autobid" : "Bid"}</th>
                        <td>{c.autobid ? "Enabled" : '$' + c.cost}</td>
                    </tr>
                    <tr>
                        <th>Funds Available</th><td>{'$' + c.funds}</td>
                    </tr>
                    <tr>
                        <th>Daily Funds Limit</th>
                        <td>{c.dailyFunds > 0 ? (
                            '$' + c.dailyFundsUsed + ' of $' + c.dailyFunds
                        ) : (
                            "No Limit"
                        )}</td>
                    </tr>
                </table>

                <hr />

                <h3>User Targeting</h3>
                <table className="campaign-user-targeting">
                    <tr className="age-ranges">
                        <th>Ages Ranges</th>
                        <td>
                            {
                                c.userTargets.age == 0
                                ? "All Age Ranges"
                                : c.userTargets.age.split(',').map(range => {
                                    return(
                                        <span>{
                                            [
                                                '', "18-24", "25-34", "35-44", "45-54",
                                                 "55-64", "65+"
                                            ][+range]
                                        }</span>
                                    );
                                })
                            }
                        </td>
                    </tr>
                    <tr className="genders">
                        <th>Genders</th>
                        <td>
                            {
                                c.userTargets.genders == 0
                                ? "All Genders"
                                : c.userTargets.genders.split(',').map(gender => {
                                    let genders = ['', "Male", "Female", "Other"];
                                    return(<span>{genders[+gender]}</span>);
                                })
                            }
                        </td>
                    </tr>
                    <tr className="geo">
                        <th>Countries</th>
                        <td>{ c.userTargets.countries == '*' ? (
                            <span><b>All Countries:</b><br /> All Regions</span>
                        ) : (
                            c.userTargets.countries.split(',').map((country, i) => {
                                return (
                                    <span>
                                        <b>{country}:</b><br /> {c.userTargets.regions.split('|')[i]}
                                    </span>
                                );
                            })
                        )}</td>
                    </tr>
                </table>

                <hr />

                <h3>Content Targeting</h3>
                <table className="campaign-content-targeting">
                    <tr className="category">
                        <th>Category</th><td>{c.contentTargets.categories}</td>
                    </tr>
                    <tr className="keywords">
                        <th>Keywords</th>
                        <td>{c.contentTargets.keywords.split(',').map(kw => {
                            return <span>{kw}</span>;
                        })}</td>
                    </tr>
                    <tr className="sites">
                        <th>Sites</th>
                        <td>{c.contentTargets.sites == '*' ? (
                            "All Sites"
                        ) : (
                            c.contentTargets.sites.split(',').map(site => {
                                return(<span>{site}</span>);
                            })
                        )}</td>
                    </tr>
                </table>

                <hr />

                <h3>Advertisement</h3>

                <table className="campaign-advertisement">
                    <tr>
                        <th>Type</th>
                        <td>{
                            ['', "Text", "Short Text", "Image", "Video"][c.ad.type]
                        }</td>
                    </tr>
                    <tr>
                        <th>Link</th>
                        <td><a target="_blank" href={c.ad.link}>{c.ad.link}</a></td>
                    </tr>
                    <tr>
                        <th>Title</th><td>{c.ad.title}</td>
                    </tr>
                    <tr>
                        <th>Description</th><td>{c.ad.description}</td>
                    </tr>
                    <tr className="media">
                        <th>Media</th>
                        <td>
                            {
                                c.ad.media == ''
                                ? "None"
                                : c.ad.media.split(',').map((media, i) => {
                                    const type = c.ad.type == 3 ? "image" : "video";
                                    const link = media.split(':')[1];
                                    
                                    return(
                                        <span>
                                            <b>{dimensions[type][i].width}x{dimensions[type][i].height}:</b> 
                                            <a href={link} target="_blank">{link}</a>
                                        </span>
                                    );
                                })
                            }
                        </td>
                    </tr>
                </table>
            </div>
        );
    }

}