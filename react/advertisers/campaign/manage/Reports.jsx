var Button = require("../../../forms/Button");

module.exports = React.createClass({

    getInitialState: function() {
        return {
            clicks: 0, views: 0, cost: 0, publishers: "",
            dem_age: "", dem_gender: "", dem_geo: ""
        };
    },

    componentWillMount: function() {
        var url = API + "advertisers/campaigns/" + this.props.id + "/reports"
            + "?dates=" + (new Date().toISOString().substr(0, 10));

        ajax({
            url: url,
            dataType: "json",
            success: function(res) {
                this.setState(res);
            }.bind(this)
        });
    },

    generateReport: function() {
        var dates = this.refs.start.value;
        if (this.refs.end.value != "")
            dates += '|' + this.refs.end.value;

        ajax({
            url: API + "advertisers/campaigns/" + this.props.id + "/reports"
                + "?dates=" + dates,
            dataType: "json",
            success: function(res) {
                this.setState(res);
            }.bind(this)
        });
    },

    render: function() {
        var s = this.state, ages = ["Unknown", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"],
            genders = ["Unkown", "Male", "Female", "Other"], countries = [], regions = [], geo = [];

        s.dem_geo = JSON.parse(s.dem_geo);

        // Populate countries[] and regions[]
        for (var country in s.dem_geo) {
            if (s.dem_geo.hasOwnProperty(country)) {
                countries.push(country);

                for (var region in country) {
                    if (country.hasOwnProperty(region)) {
                        regions.push(<span><b>{region}</b>({country[region]})</span>);
                    }
                }
            }
        }

        // Build geo from countries[] and regions[]
        for (var i = 0; i < countries.length; i++) {
            geo.push(
                <tr>
                    <th>{counties[i]}</th>
                    <td>{regions[i]}</td>
                </tr>
            );
        }

        return(
            <div className="campaign-reports">
                <h3>Generate Report</h3>

                <label>Start Date</label>
                <input type="text" ref="start" defaultValue={new Date().toISOString().substr(0, 10)} />
                
                <label>End Date</label>
                <input type="text" ref="end" />

                <Button onClick={this.generateReport}>Generate</Button>

                <hr />

                <h2>Report</h2>
                <div className="report">
                    <h3>Statistics</h3>
                    <table className="statistics">
                        clicks / views / cost / ctr
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
                        {geo}
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