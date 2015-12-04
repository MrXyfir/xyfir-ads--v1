var dimensions = require("../../../../lib/file/dimensions");
var Button = require("../../../forms/Button");
var Alert = require("../../../forms/Alert");

module.exports = React.createClass({

    getInitialState: function() {
        return {
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
    },

    componentWillMount: function() {
        ajax({
            url: API + "advertisers/campaigns/" + this.props.id,
            dataType: "json",
            success: function(res) {
                this.setState(res);
            }.bind(this)
        });
    },

    render: function() {
        if (this.state.name == "")
            return <div></div>;

        var c = this.state, status = "", alert;

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
                    <b> | {c.provided == 0 ? "0.00" : Number(Math.round((c.requested / c.provided) + 'e' + 2) + 'e-' + 2)}% </b>
                    Complete
                </p>
                
                <hr />

                <h3>Statistics</h3>
                <table className="campaign-statistics">
                    <tr>
                        <th>Pay Type</th><td>{c.payType == 1 ? "Pay-Per-Click" : "Pay-Per-View"}</td>
                    </tr>
                    <tr>
                        <th>Requested {c.payType == 1 ? "Clicks" : "Views"}</th><td>{c.requested}</td>
                    </tr>
                    <tr>
                        <th>Provided {c.payType == 1 ? "Clicks" : "Views"}</th><td>{c.provided}</td>
                    </tr>
                    <tr>
                        <th>{c.autobid ? "Autobid" : "Bid"}</th><td>{c.autobid ? "Enabled" : '$' + c.cost}</td>
                    </tr>
                    <tr>
                        <th>Funds Available</th><td>{'$' + c.funds}</td>
                    </tr>
                    <tr>
                        <th>Daily Funds Limit</th>
                        <td>{c.dailyFunds > 0 ? ('$' + c.dailyFundsUsed + ' of $' + c.dailyFunds) : "No Limit"}</td>
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
                                : c.userTargets.age.split(',').map(function(range) {
                                    var ranges = ['', "18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
                                    return(<span>{ranges[+range]}</span>);
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
                                : c.userTargets.genders.split(',').map(function(gender) {
                                    var genders = ['', "Male", "Female", "Other"];
                                    return(<span>{genders[+gender]}</span>);
                                })
                            }
                        </td>
                    </tr>
                    <tr className="geo">
                        <th>Countries</th>
                        <td>
                            {
                                c.userTargets.countries == '*'
                                ? <span><b>All Countries:</b><br /> All Regions</span>
                                : c.userTargets.countries.split(',').map(function(country, i) {
                                    return(<span><b>{country}:</b><br /> {c.userTargets.regions.split('|')[i]}</span>);
                                })
                            }
                        </td>
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
                        <td>{c.contentTargets.keywords.split(',').map(function(kw) { return(<span>{kw}</span>); })}</td>
                    </tr>
                    <tr className="sites">
                        <th>Sites</th>
                        <td>{
                            c.contentTargets.sites == '*'
                            ? "All Sites"
                            : c.contentTargets.sites.split(',').map(function(site) { return(<span>{site}</span>); })
                        }</td>
                    </tr>
                </table>

                <hr />

                <h3>Advertisement</h3>

                <table className="campaign-advertisement">
                    <tr>
                        <th>Type</th><td>{['', "Text", "Short Text", "Image", "Video"][c.ad.type]}</td>
                    </tr>
                    <tr>
                        <th>Link</th><td><a target="_blank" href={c.ad.link}>{c.ad.link}</a></td>
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
                                : c.ad.media.split(',').map(function(media, i) {
                                    var type = c.ad.type == 3 ? "image" : "video";
                                    var link = media.split(':')[1];
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

});