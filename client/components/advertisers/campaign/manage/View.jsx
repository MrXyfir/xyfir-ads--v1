import React from "react";

// Modules
import dimensions from "lib/../../lib/file/dimensions";
import request from "lib/request";
import round from "lib/../../lib/round";

// Components
import Button from "components/forms/Button";

export default class ViewAdvertiserCampaign extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            name: "", funds: 0, dailyFunds: 0, dailyFundsUsed: 0, ended: false,
            payType: 0, cost: 0, autobid: false, requested: 0,
            provided: 0, available: "", approved: 0,
            ad: {
                type: 0, title: "", description: "", link: "", media: "",
            },
            userTargets: {
                age: "", countries: "", regions: "", genders: "",
            },
            contentTargets: {
                categories: "", keywords: "", sites: ""
            }
        };
    }

    componentWillMount() {
        request({
            url: "api/advertisers/campaigns/" + this.props.id,
            success: (res) => this.setState(res)
        });
    }

    render() {
        if (this.state.name == "") return <div />;

        let c = this.state;

        return(
            <div className="advertisers-campaign">
                <section>
                    <h2 className="campaign-name">{c.name}</h2>
                    {!c.ended ? (
                        <span className="complete">
                            {c.provided == 0
                                ? "0.00" : round(c.requested / c.provided, 2)
                            }% Complete
                        </span>
                    ) : (
                        <span className="hidden" />
                    )}
                </section>

                <section className="statistics">
                    <h3>Statistics</h3>
                    {!c.ended ? (
                        <dl className="campaign-statistics">
                            <dt>Pay Type</dt>
                            <dd>{
                                c.payType == 1 ? "Pay-Per-Click" : "Pay-Per-View"
                            }</dd>
                            
                            <dt>Requested {
                                c.payType == 1 ? "Clicks" : "Views"
                            }</dt>
                            <dd>{c.requested}</dd>
                        
                            <dt>Provided {
                                c.payType == 1 ? "Clicks" : "Views"
                            }</dt>
                            <dd>{c.provided}</dd>
                        
                            <dt>{c.autobid ? "Autobid" : "Bid"}</dt>
                            <dd>{c.autobid ? "Enabled" : '$' + c.cost}</dd>
                        
                            <dt>Funds Available</dt>
                            <dd>{'$' + c.funds}</dd>
                        
                            <dt>Daily Funds Limit</dt>
                            <dd>{c.dailyFunds > 0 ? (
                                '$' + c.dailyFundsUsed + ' of $' + c.dailyFunds
                            ) : (
                                "No Limit"
                            )}</dd>
                        </dl>
                    ) : (
                        <span>Statistics only available for active campaigns.</span>
                    )}
                </section>

                <section className="user-targeting">
                    <h3>User Targeting</h3>
                    <dl className="campaign-user-targeting">
                        <div className="age-ranges">
                            <dt>Ages Ranges</dt>
                            <dd>{c.userTargets.age == 0
                                ? "All Age Ranges"
                                : c.userTargets.age.split(',').map(range => {
                                    return(
                                        <span>{[
                                            '', "18-24", "25-34", "35-44",
                                            "45-54", "55-64", "65+"
                                        ][+range]}</span>
                                    );
                                })
                            }</dd>
                        </div>
                        
                        <div className="genders">
                            <dt>Genders</dt>
                            <dd>{c.userTargets.genders == 0
                                ? "All Genders"
                                : c.userTargets.genders.split(',').map(gender => {
                                    let genders = ['', "Male", "Female", "Other"];
                                    return <span>{genders[+gender]}</span>;
                                })
                            }</dd>
                        </div>
                        
                        <div className="geo">
                            <dt>Countries</dt>
                            <dd><dl>{c.userTargets.countries == '*' ? (
                                <div>
                                    <dt>All Countries</dt>
                                    <dd>All Regions</dd>
                                </div>
                            ) : (
                                c.userTargets.countries.split(',').map((country, i) => {
                                    return (
                                        <div>
                                            <dt>{country}</dt>
                                            <dd>{
                                                c.userTargets.regions.split('|')[i]
                                            }</dd>
                                        </div>
                                    );
                                })
                            )}</dl></dd>
                        </div>
                    </dl>
                </section>

                <section className="content-targeting">
                    <h3>Content Targeting</h3>
                    <dl className="campaign-content-targeting">
                        <dt>Category</dt>
                        <dd className="category">{
                            c.contentTargets.categories
                        }</dd>
                        

                        <dt>Keywords</dt>
                        <dd className="keywords">{
                            c.contentTargets.keywords.split(',').map(kw => {
                                return <span>{kw}</span>;
                            })
                        }</dd>
                        
                        <dt>Sites</dt>
                        <dd className="sites">{c.contentTargets.sites == '*' ? (
                            "All Sites"
                        ) : (
                            c.contentTargets.sites.split(',').map(site => {
                                return <span>{site}</span>;
                            })
                        )}</dd>
                    </dl>
                </section>

                <section className="advertisement">
                    <h3>Advertisement</h3>
                    <dl className="campaign-advertisement">
                        <dt>Type</dt>
                        <dd>{
                            ['', "Text", "Short Text", "Image", "Video"]
                            [c.ad.type]
                        }</dd>
                        
                        <dt>Link</dt>
                        <dd><a target="_blank" href={c.ad.link}>{
                            c.ad.link
                        }</a></dd>
                        
                        <dt>Title</dt>
                        <dd>{c.ad.title}</dd>
                    
                        <dt>Description</dt>
                        <dd>{c.ad.description}</dd>
                        
                        <dt>Media</dt>
                        <dd className="media">{
                            c.ad.media == ''
                            ? "None"
                            : <dl>{c.ad.media.split(',').map((media, i) => {
                                const type = c.ad.type == 3 ? "image" : "video";
                                const link = media.split(':')[1];
                                
                                return(
                                    <div>
                                        <dt>{
                                            dimensions[type][i].width
                                            + "x" + dimensions[type][i].height
                                        }</dt> 
                                        <dd><a href={link} target="_blank">{
                                            link
                                        }</a></dd>
                                    </div>
                                );
                            })}</dl>
                        }</dd>
                    </dl>
                </section>
            </div>
        );
    }

}