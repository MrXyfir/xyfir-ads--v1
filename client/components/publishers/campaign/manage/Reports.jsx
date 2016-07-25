import React from "react";

// Components
import Button from "components/forms/Button";

// Module
import request from "lib/request";

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
            this.setState(res, () => this._idToAd());
        }});
    }

    onGenerateReport() {
        let dates = this.refs.start.value;
        if (this.refs.end.value != "")
            dates += '|' + this.refs.end.value;

        const url = "api/publishers/campaigns/" + this.props.id + "/reports"
            + "?dates=" + dates;

        request({url, success: res => {
            this.setState(res, () => this._idToAd());
        }});
    }

    // Take list of ad campaign ids:clicks and convert id to ad's title
    _idToSite() {
        if (this.state.ads == "")
            return;

        let arr = this.ads.publishers.split(',');

        const convert = (i) => {
            // Looped through all ids, set state.ads
            if (arr[i] == undefined) {
                this.setState({ ads: arr.join(',') });
                return;
            }

            let temp = arr[i].split(':');

            request({
                url: "api/ad/info?id=" + temp[0],
                success: (res) => {
                    arr[i] = res.title + ':' + temp[1];
                    convert(i++);
                }
            });
        };

        convert(0);
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
                            <th>CTR</th><td>{s.clicks == 0 ? "0.00" : (s.clicks / s.views)}%</td>
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
                    <table className="top-advertisers">{
                        s.ads.split(',').map(ad => {
                            return(
                                <tr>
                                    <th>{ad.split(':')[0]}</th>
                                    <td>{ad.split(':')[1]}</td>
                                </tr>
                            );
                        })
                    }</table>
                </div>
            </div>
        );
    }

}