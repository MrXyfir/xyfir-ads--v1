import React from "react";

// Components
import Button from "components/forms/Button";

// Module
import request from "lib/request";
import round from "lib/../../lib/round";

export default class PublisherCampaignReports extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            clicks: 0, views: 0, earnings: 0,
            pending: 0, ads: "", loading: true
        };
    }

    componentWillMount() {
        const url = "api/publishers/campaigns/" + this.props.id + "/reports"
            + "?dates=" + (new Date().toISOString().substr(0, 10));

        request({url, success: (res) => {
            res.loading = false;
            this.setState(res, () => this._buildAds());
        }});
    }

    onGenerateReport() {
        let dates = this.refs.start.value;
        if (this.refs.end.value != "")
            dates += '|' + this.refs.end.value;

        const url = "api/publishers/campaigns/" + this.props.id + "/reports"
            + "?dates=" + dates;

        request({url, success: res => {
            this.setState(res, () => this._buildAds());
        }});
    }

    // Convert list of "ad_id:clicks,..." into array of objects
    // containing { id, title, clicks }
    _buildAds() {
        let ads = this.state.ads.split(',').map(a => {
            a = a.split(':');
            return { id: a[0], clicks: a[1] };
        });
        const ids = ads.map(a => a.id).join(',');

        request({
            url: "api/ad/info?ids=" + ids,
            success: (res) => {
                ads.forEach((a, i) => {
                    ads[i] = a;
                    ads[i].title = res[a.id].title;
                });

                this.setState({ ads });
            }
        });
    }

    render() {
        if (this.state.loading) return <div />;

        const s = this.state;

        return(
            <div className="campaign-reports">
                <h3>Generate Report</h3>

                <label>Start Date</label>
                <input type="text" ref="start" defaultValue={new Date().toISOString().substr(0, 10)} />
                
                <label>End Date</label>
                <input type="text" ref="end" />

                <Button onClick={() => this.onGenerateReport()}>Generate</Button>

                <hr />

                <div className="report">
                    <h3>Statistics</h3>
                    <table className="statistics">
                        <tr>
                            <th>Clicks</th><td>{s.clicks}</td>
                        </tr>
                        <tr>
                            <th>Views</th><td>{s.views}</td>
                        </tr>
                        <tr>
                            <th>CTR</th>
                            <td>
                                {s.clicks == 0
                                    ? "0.00" : round(s.clicks / s.views, 4)
                                }%
                            </td>
                        </tr>
                    </table>

                    <h3>Earnings</h3>
                    <table className="earnings">
                        <tr>
                            <th>Pending</th><td>{'$' + s.pending}</td>
                        </tr>
                        <tr>
                            <th>Confirmed</th><td>{'$' + s.earnings}</td>
                        </tr>
                    </table>

                    <h3>Top Advertisements</h3>
                    <p>Advertisements your users are clicking most.</p>
                    <table className="top-advertisements">{
                        s.ads.map(ad => {
                            return (
                                <tr className="advertisement">
                                    <th>{ad.title}</th>
                                    <td>{ad.clicks}</td>
                                </tr>
                            );
                        })
                    }</table>
                </div>
            </div>
        );
    }

}