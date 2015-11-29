module.exports = React.createClass({

    back: function () {
        this.step('+');
    },

    prev: function() {
        this.step('-');
    },

    step: function(action) {
        var genders = this.refs.genders.value, countries = this.refs.countries.value,
            regions = this.refs.regions.value, age = this.refs.age.value;

        // Save data to campaignData even if it's not valid
        campaignData.genders = genders, campaignData.countries = countries,
            campaignData.regions = regions, campaignData.age = age;

        // Validate data
        if (true)
            this.setState({ error: true, message: "Error" });
        else // Next step if data is valid
            this.props.step(action);
    },

    // ut_genders, ut_countries, ut_regions, ut_age
    render: function () {
        var alert;
        if (this.state.error) alert = <Alert type="error" title="Error!">{this.state.message}</Alert>;

        return (
            <div className="form-step">
                {alert}


            </div>
        );
    }

});