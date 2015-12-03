var Button = require("../../../forms/Button");
var Alert = require("../../../forms/Alert");

module.exports = React.createClass({

    getInitialState: function() {
        return {
            error: false, message: '', countriesRegions: window.campaignData.countriesRegions
        };
    },

    back: function () {
        this.step('-');
    },

    next: function() {
        this.step('+');
    },

    componentWillMount: function () {
        // Add country-region-selector to page
        var crs = document.createElement("script");
        crs.setAttribute("src", URL + "js/crs.js");
        document.head.appendChild(crs);
    },

    step: function(action) {
        // Set checkbox values of genders
        for (var i = 1; i < 4; i++)
            window.campaignData.genders[i] = this.refs["gender-" + i].checked;
        // Set checkbox values of age ranges
        for (var i = 1; i < 7; i++)
            window.campaignData.age[i] = this.refs["age-" + i].checked;

        if (this.state.countriesRegions == '')
            window.campaignData.countriesRegions = "*:*";
        else
            window.campaignData.countriesRegions = this.state.countriesRegions;

        this.props.step(action);
    },

    crAdd: function(action) {
        // Split this.state.countriesRegions by '|'
        var crs = this.state.countriesRegions.split('|');
        var countryExists = false, regionExists = false;

        // Loop through each country:region,... and split by ':'
        crs.forEach(function(cr) {
            // Look for country
            if (cr.split(':')[0] == this.refs.country.value) {
                countryExists = true;

                // Look for region
                cr.split(':')[1].split(',').forEach(function(region) {
                    if (region == this.refs.region.value) {
                        regionExists = true;
                    }
                }.bind(this));
            }
        }.bind(this));

        // Add the country and region
        if (!countryExists) {
            this.setState({
                countriesRegions: this.state.countriesRegions + (this.state.countriesRegions == '' ? '' : '|')
                    + (!this.refs.country.value ? '*' : this.refs.country.value) + ':'
                    + (!this.refs.region.value ? '*' : this.refs.region.value)
            });
        }
        // Add region to the country
        else if (!regionExists) {
            for (var i = 0; i < crs.length; i++) {
                if (crs[i].split(':')[0] == this.refs.country.value) {
                    crs[i] += ',' + (!this.refs.region.value ? '*' : this.refs.region.value);
                    this.setState({ countriesRegions: crs.join('|') });

                    break;
                }
            }
        }
    },

    crReset: function() {
        this.setState({ countriesRegions: '' });
        window.campaignData.countriesRegions = '';
    },

    render: function() {
        var alert;
        if (this.state.error) alert = <Alert type="error" title="Error!">{this.state.message}</Alert>;

        // Build crList
        var crList = [];
        if (this.state.countriesRegions != '') {

            this.state.countriesRegions.split('|').forEach(function(cr) {
                var temp = cr.split(':');

                crList.push(
                    <span>
                        <br /><b>{temp[0].replace('*', "All Countries")}:</b>
                        <br /> {temp[1].replace('*', "All Regions")}
                    </span>
                );
            });
        }

        return (
            <div className="form-step">
                <div className="form-step-head">
                    <h2>User Targeting</h2>
                    <p>Determine the user demographics you would like your ad targeted to.</p>
                </div>

                <div className="form-step-body">
                    {alert}

                    <label>Genders</label>
                    <input type="checkbox" ref="gender-1" defaultChecked={window.campaignData.genders[1]} />Male
                    <input type="checkbox" ref="gender-2" defaultChecked={window.campaignData.genders[2]} />Female
                    <input type="checkbox" ref="gender-3" defaultChecked={window.campaignData.genders[3]} />Other

                    <label>Age Ranges</label>
                    <input type="checkbox" ref="age-1" defaultChecked={window.campaignData.age[1]} />18-24
                    <input type="checkbox" ref="age-2" defaultChecked={window.campaignData.age[2]} />25-34
                    <input type="checkbox" ref="age-3" defaultChecked={window.campaignData.age[3]} />35-44
                    <input type="checkbox" ref="age-4" defaultChecked={window.campaignData.age[4]} />45-54
                    <input type="checkbox" ref="age-5" defaultChecked={window.campaignData.age[5]} />55-64
                    <input type="checkbox" ref="age-6" defaultChecked={window.campaignData.age[6]} />65+

                    <label>Countries / Regions</label>
                    <small>
                        Leave 'Country' selector blank to target all countries.
                        <br />
                        Leave 'Region' selector blank to target all regions in a country.
                    </small>
                    <div className="country-region-selector">
                        <select className="crs-country" ref="country" data-region-id="crs-region" data-value="shortcode">
                            <option value="*">All Countries</option>
                        </select>
                        <select id="crs-region" ref="region" data-value="shortcode">
                            <option value="*">All Regions</option>
                        </select>
                        
                        <a className="link-sm" onClick={this.crAdd}>Add to List</a>
                        <a className="link-sm" onClick={this.crReset}>Reset List</a>

                        <div className="country-region-list">
                            {crList}
                        </div>
                    </div>
                </div>

                <div className="form-step-nav">
                    <Button type="secondary" onClick={this.back}>Back</Button>
                    <Button onClick={this.next}>Next</Button>
                </div>
            </div>
        );
    }

});