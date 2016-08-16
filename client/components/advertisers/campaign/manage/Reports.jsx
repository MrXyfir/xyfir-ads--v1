import React from "react";

// Components
import Button from "components/forms/Button";

// Module
import request from "lib/request";

export default class AdvertiserCampaignReports extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            clicks: 0, views: 0, cost: 0, publishers: "",
            dem_age: "", dem_gender: "", dem_geo: "",
            loading: true
        };
    }

    componentWillMount() {
        const url = "api/advertisers/campaigns/" + this.props.id + "/reports"
            + "?dates=" + (new Date().toISOString().substr(0, 10));

        request({url, success: (res) => {
            res.loading = false;
            this.setState(res, () => { this._idToSite(); });
        }});
    }

    onGenerateReport() {
        let dates = this.refs.start.value;
        if (this.refs.end.value != "")
            dates += '|' + this.refs.end.value;

        const url = "api/advertisers/campaigns/" + this.props.id + "/reports"
            + "?dates=" + dates;

        request({url, success: (res) => {
            this.setState(res, () => { this._idToSite(); });
        }});
    }

    // Take list of pub campaign ids:clicks and convert id to site address
    _idToSite() {
        if (this.state.publishers == "") return;

        let arr = this.state.publishers.split(',');

        const convert = (i) => {
            // Looped through all ids, set state.publishers
            if (arr[i] == undefined) {
                this.setState({ publishers: arr.join(',') });
                return;
            }

            let temp = arr[i].split(':');

            request({
                url: "api/pub/info?id=" + temp[0],
                success: (res) => {
                    arr[i] = res.site + ':' + temp[1];
                    convert(i++);
                }
            });
        };

        convert(0);
    }

    render() {
        if (this.state.loading) return <div />;

        let s = this.state, genders = ["Unknown", "Male", "Female", "Other"], geo = [],
            ages = ["Unknown", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
        
        // Convert {CO:{RE:20,RE:20},CO:{...}...}
        // to [{country:"",regions:[{region:"",clicks:0},...]},...]
        if (s.dem_geo != "") {
            s.dem_geo = JSON.parse(s.dem_geo);
            let temp;

            for (let country in s.dem_geo) {
                if (s.dem_geo.hasOwnProperty(country)) {
                    temp = {};

                    temp.country = country, temp.regions = [];

                    for (let region in s.dem_geo[country]) {
                        if (s.dem_geo[country].hasOwnProperty(region)) {
                            temp.regions.push({
                                region: region, clicks: s.dem_geo[country][region],
                            });
                        }
                    }

                    geo.push(temp);
                }
            }
        }

        return(
            <div className="campaign-reports">
                <h3>Generate Report</h3>

                <label>Start Date</label>
                <input
                    type="text"
                    ref="start"
                    defaultValue={
                        new Date().toISOString().substr(0, 10)
                    }
                />
                
                <label>End Date</label>
                <input type="text" ref="end" />

                <Button onClick={() => this.onGenerateReport()}>Generate</Button>

                <hr />

                <div className="report">
                    <h3>Statistics</h3>
                    <p>Statistics generated over the given time period.</p>
                    <table className="statistics">
                        <tr>
                            <th>Clicks</th><td>{s.clicks}</td>
                        </tr>
                        <tr>
                            <th>Views</th><td>{s.views}</td>
                        </tr>
                        <tr>
                            <th>Cost</th><td>{s.cost}</td>
                        </tr>
                        <tr>
                            <th>CTR</th><td>{s.clicks == 0 ? "0.00" : (s.clicks / s.views)}%</td>
                        </tr>
                    </table>

                    <h3>User Demographics</h3>
                    <p>Demographics are <em>only</em> for clicks received.</p>
                    <table className="demographics">
                        <tr>
                            <th>Ages</th>
                            <td>
                                {
                                    s.dem_age.split(',').map((age) => {
                                        let temp = age.split(':');
                                        return(<span><b>{ages[temp[0]]}:</b> {temp[1]}</span>);
                                    })
                                }
                            </td>
                        </tr>
                        <tr>
                            <th>Genders</th>
                            <td>
                                {
                                    s.dem_gender.split(',').map((gender) => {
                                        let temp = gender.split(':');
                                        return(<span><b>{genders[temp[0]]}:</b> {temp[1]}</span>);
                                    })
                                }
                            </td>
                        </tr>
                    </table>

                    <h3>Countries / Regions</h3>
                    <p>Geographic demographics are <em>only</em> for clicks received.</p>
                    <table className="geo">{
                        geo.map(c => {
                            return(
                                <tr>
                                    <th>{c.country}</th>
                                    <td>{
                                        c.regions.map(r => {
                                            return(
                                                <span>{r.name}({r.clicks})</span>
                                            );
                                        })
                                    }</td>
                                </tr>
                            );
                        })
                    }</table>

                    <h3>Top Publishers</h3>
                    <p>Publishers who are serving your ad the most.</p>
                    <table>
                        {
                            s.publishers.split(',').map(publisher => {
                                return(
                                    <tr>
                                        <th>{publisher.split(':')[0]}</th>
                                        <td>{publisher.split(':')[1]}</td>
                                    </tr>
                                );
                            })
                        }
                    </table>
                </div>
            </div>
        );
    }

}