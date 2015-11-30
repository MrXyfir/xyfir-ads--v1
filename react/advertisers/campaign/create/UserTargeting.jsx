/*
    Allows advertiser to target user demographics and locations
    TODO
        Improve display for countries/regions user is targeting
        Add ability for user to remove a country/region from list
*/
module.exports = React.createClass({

    getInitialState: function() {
        return { error: false, message: '' };
    },

    back: function () {
        this.step('+');
    },

    prev: function() {
        this.step('-');
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
            campaignData.gender[i] = this.refs["gender-" + i].checked;
        // Set checkbox values of age ranges
        for (var i = 1; i < 7; i++)
            campaignData.age[i] = this.refs["age-" + i].checked;

        // Validate
        if (!!campaignData.countriesRegions)
            this.setState({ error: true, message: "You must target at least one country / region" });
        else
            this.props.step(action);
    },

    crAdd: function(action) {
        // Split campaignData.countriesRegions by '|'
        var crs = campaignData.countriesRegions.split('|');
        var countryExists = false, regionExists = false;

        // Loop through each country:region,... and split by ':'
        crs.forEach(function (cr) {
            // Look for country
            if (cr.split(':')[0] == this.refs.country.value) {
                countryExists = true;

                // Look for region
                cr.split(':')[1].split(',').forEach(function (region) {
                    if (region == this.refs.region.value) {
                        regionExists = true;
                    }
                });
            }
        });

        // Add the country and region
        if (!countryExists) {
            campaignData.countriesRegions += ',' + this.refs.country.value + ':' + this.refs.region.value;
        }
        // Add region to the country
        else if (!regionExists) {
            for (var i = 0; i < crs.length; i++) {
                if (crs[i].split(':')[0] == this.refs.country.value) {
                    crs[i] += ',' + this.refs.region.value;
                    break;
                }
            }
        }
    },

    render: function () {
        var alert;
        if (this.state.error) alert = <Alert type="error" title="Error!">{this.state.message}</Alert>;

        // Build crList
        var crList = [];
        if (!!campaignData.countriesRegions) {
            campaignData.countriesRegions.split('|').forEach(function (cr) {
                var temp = cr.split(':');

                crList.push(
                    <span><b>{temp[0]}:</b> {temp[1]}</span>
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

                    <h4>Genders</h4>
                    <input type="checkbox" ref="gender-1" defaultChecked={campaignData.gender[1]} />Male
                    <input type="checkbox" ref="gender-2" defaultChecked={campaignData.gender[2]} />Female
                    <input type="checkbox" ref="gender-3" defaultChecked={campaignData.gender[3]} />Other

                    <h4>Age Ranges</h4>
                    <input type="checkbox" ref="age-1" defaultChecked={campaignData.age[1]} />18-24
                    <input type="checkbox" ref="age-2" defaultChecked={campaignData.age[2]} />25-34
                    <input type="checkbox" ref="age-3" defaultChecked={campaignData.age[3]} />35-44
                    <input type="checkbox" ref="age-4" defaultChecked={campaignData.age[4]} />45-54
                    <input type="checkbox" ref="age-5" defaultChecked={campaignData.age[5]} />55-64
                    <input type="checkbox" ref="age-6" defaultChecked={campaignData.age[6]} />65+

                    <h4>Countries / Regions</h4>
                    <div className="country-region-selector">
                        <select className="crs-country" ref="country" data-region-id="crs-region" data-value="shortcode">
                            <option value="*">All Countries</option>
                        </select>
                        <select id="crs-region" ref="region" data-value="shortcode">
                            <option value="*">All Regions</option>
                        </select>
                        
                        <a className="link-sm" onClick={this.crAdd}>Add to List</a>

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