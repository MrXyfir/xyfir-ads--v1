var Button = require("../../../forms/Button");

module.exports = React.createClass({

    getInitialState: function() {
        return {
            clicks: 0, views: 0, cost: 0, publishers: "",
            dem_age: "", dem_gender: "", dem_geo: "",
            loading: true
        };
    },

    componentWillMount: function() {
        var url = API + "advertisers/campaigns/" + this.props.id + "/reports"
            + "?dates=" + (new Date().toISOString().substr(0, 10));

        ajax({
            url: url,
            dataType: "json",
            success: function(res) {
                res.loading = false;
                this.setState(res);
            }.bind(this)
        });
    },

    generateReport: function() {
        var dates = this.refs.start.value;
        if (this.refs.end.value != "")
            dates += '|' + this.refs.end.value;

        var url = API + "advertisers/campaigns/" + this.props.id + "/reports"
            + "?dates=" + dates;

        ajax({
            url: url,
            dataType: "json",
            success: function(res) {
                this.setState(res);
            }.bind(this)
        });
    },

    render: function() {
        if (this.state.loading) return <div></div>;

        var s = this.state, ages = ["Unknown", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"],
            genders = ["Unkown", "Male", "Female", "Other"];

        s.dem_geo = JSON.parse(s.dem_geo);

        /* Populate countries[] and regions[]
        for (var country in s.dem_geo) {
            if (s.dem_geo.hasOwnProperty(country)) {
                countries[i] = country, regions[i] = [];

                for (var region in s.dem_geo[country]) {
                    if (s.dem_geo[country].hasOwnProperty(region)) {
                        regions[i].push([region, s.dem_geo[country][region]]);
                    }
                }

                i++;
            }
        }*/

        return(
            <div className="campaign-reports">
                <h3>Generate Report</h3>

                <label>Start Date</label>
                <input type="text" ref="start" defaultValue={new Date().toISOString().substr(0, 10)} />
                
                <label>End Date</label>
                <input type="text" ref="end" />

                <Button onClick={this.generateReport}>Generate</Button>

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
                                    s.dem_age.split(',').map(function(age) {
                                        var temp = age.split(':');
                                        return(<span><b>{ages[temp[0]]}:</b> {temp[1]}</span>);
                                    })
                                }
                            </td>
                        </tr>
                        <tr>
                            <th>Genders</th>
                            <td>
                                {
                                    s.dem_gender.split(',').map(function(gender) {
                                        var temp = gender.split(':');
                                        return(<span><b>{genders[temp[0]]}:</b> {temp[1]}</span>);
                                    })
                                }
                            </td>
                        </tr>
                    </table>

                    <h3>Countries / Regions</h3>
                    <p>Geographic demographics are <em>only</em> for clicks received.</p>
                    <table className="geo">

                    </table>

                    <h3>Top Publishers</h3>
                    <p>Publishers who are serving your ad the most.</p>
                    <table>
                        {
                            s.publishers.split(',').map(function(publisher) {
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

});