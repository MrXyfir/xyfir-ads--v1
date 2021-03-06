﻿import React from "react";

// Components
import Button from "components/forms/Button";

// Module
import request from "lib/request";
import round from "lib/../../lib/round";

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
            this.setState(res, () => { this._buildPublishers(); });
        }});
    }

    onGenerateReport() {
        let dates = this.refs.start.value;
        if (this.refs.end.value != "")
            dates += '|' + this.refs.end.value;

        const url = "api/advertisers/campaigns/" + this.props.id + "/reports"
            + "?dates=" + dates;

        request({url, success: (res) => {
            this.setState(res, () => { this._buildPublishers(); });
        }});
    }

    // Convert list of "pub_id:clicks,..." into array of objects
    // containing { id, site, clicks }
    _buildPublishers() {
        if (!this.state.publishers) {
            this.setState({ publishers: [] });
            return;
        }

        let publishers = this.state.publishers.split(',').map(p => {
            p = p.split(':');
            return { id: p[0], clicks: p[1] };
        });
        const ids = publishers.map(p => p.id).join(',');

        request({
            url: "api/pub/info?ids=" + ids,
            success: (res) => {
                publishers.forEach((p, i) => {
                    publishers[i] = p;
                    publishers[i].site = res[p.id].site;
                });

                this.setState({ publishers });
            }
        });
    }

    render() {
        if (this.state.loading || typeof this.state.publishers == "string")
            return <div />;

        let s = this.state, genders = [
                "Unknown", "Male", "Female", "Other"
            ], geo = [], ages = [
                "Unknown", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"
            ];
        
        // Convert {CO:{RE:20,RE:20},CO:{...}...}
        // to [{country:"",regions:[{region:"",clicks:0},...]},...]
        Object.keys(s.dem_geo).forEach(country => {
            let temp = {};

            temp.country = country;
            
            temp.regions = Object.keys(s.dem_geo[country]).map(region => {
                return {
                    region, clicks: s.dem_geo[country][region]
                };
            });

            geo.push(temp);
        });

        return (
            <div className="campaign-reports">
                <section className="generate-report">
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

                    <Button onClick={() => this.onGenerateReport()}>
                        Generate
                    </Button>
                </section>

                <div className="report">
                    <section className="statistics">
                        <h3>Statistics</h3>
                        <span>
                            Statistics generated over the given time period.
                        </span>
                        
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
                                <th>CTR</th>
                                <td>
                                    {s.clicks == 0
                                        ? "0.00" : round(s.clicks / s.views, 4)
                                    }%
                                </td>
                            </tr>
                        </table>
                    </section>

                    <section className="user-demographics">
                        <h3>User Demographics</h3>
                        <span>
                            Demographics are only for clicks received.
                        </span>
                        
                        <table className="demographics">
                            <tr>
                                <th>Ages</th>
                                <td><dl>{
                                    s.dem_age.split(',').map((age) => {
                                        let temp = age.split(':');
                                        return (
                                            <div>
                                                <dt>{ages[temp[0]]}</dt>
                                                <dd>{temp[1]}</dd>
                                            </div>
                                        );
                                    })
                                }</dl></td>
                            </tr>
                            <tr>
                                <th>Genders</th>
                                <td><dl>{
                                    s.dem_gender.split(',').map((gender) => {
                                        let temp = gender.split(':');
                                        return (
                                            <div>
                                                <dt>{genders[temp[0]]}</dt>
                                                <dd>{temp[1]}</dd>
                                            </div>
                                        );
                                    })
                                }</dl></td>
                            </tr>
                        </table>
                    </section>

                    <section className="countries-regions">
                        <h3>Countries / Regions</h3>
                        <span>
                            Geographic demographics are only for clicks received.
                        </span>
                        
                        <table className="geo">{
                            geo.map(c => {
                                return (
                                    <tr className="country">
                                        <th>{c.country}</th>
                                        <td><dl className="regions">{
                                            c.regions.map(r => {
                                                return (
                                                    <div>
                                                        <dt>{r.region}</dt>
                                                        <dd>{r.clicks}</dd>
                                                    </div>
                                                );
                                            })
                                        }</dl></td>
                                    </tr>
                                );
                            })
                        }</table>
                    </section>

                    <section className="top-publishers">
                        <h3>Top Publishers</h3>
                        <span>
                            Publishers who are serving your ad the most.
                        </span>
                        
                        <table className="top-publishers">{
                            s.publishers.map(publisher => {
                                return (
                                    <tr className="publisher">
                                        <th>{publisher.site}</th>
                                        <td>{publisher.clicks}</td>
                                    </tr>
                                );
                            })
                        }</table>
                    </section>
                </div>
            </div>
        );
    }

}