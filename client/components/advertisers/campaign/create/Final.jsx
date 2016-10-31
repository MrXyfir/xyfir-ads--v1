import React from "react";

// Components
import Button from "components/forms/Button";
import Alert from "components/forms/Alert";

// Modules
import request from "lib/request";

export default class Final extends React.Component {

    constructor(props) {
        super(props);

        this.state = { loading: true, error: false, message: '' };
    }

    componentWillMount() {
        // Build data object from campaignData for 
        let cd = window.campaignData;

        let data = {
            c_name: cd.name, a_type: cd.type, a_paytype: cd.payType, c_availability: cd.available,
            ct_category: cd.category, ct_keywords: cd.keywords,
            ct_sites: (!cd.sites[0] ? '*' : cd.sites.join(',')),
            a_requested: cd.requested, f_allocated: cd.allocated, f_autobid: +cd.autobid,
            f_bid: cd.bid, f_daily: cd.dailyFunds, a_link: cd.link, a_title: cd.title,
            a_description: cd.description, a_media: cd.media, ut_genders: 0,
            ut_age: 0, ut_countries: "", ut_regions: ""
        };

        // If all values in cd.genders/cd.age are the same, ut_value = 0
        let allGenders = true, allAges = true;
        for (let i = 1; i < 4; i++)
            if (cd.genders[i] != cd.genders[1]) allGenders = false;
        
        for (let i = 1; i < 7; i++)
            if (cd.age[i] != cd.age[1]) allAges = false;

        if (!allGenders) {
            data.ut_genders = '';
            
            for (let i = 1; i < 4; i++)
                if (cd.genders[i]) data.ut_genders += i + ','

            data.ut_genders = data.ut_genders.substr(0, data.ut_genders.length - 1);
        }

        if (!allAges) {
            data.ut_age = '';
            
            for (let i = 1; i < 7; i++)
                if (cd.age[i]) data.ut_age += i + ','
            
            data.ut_age = data.ut_age.substr(0, data.ut_age.length - 1);
        }

        // Build ut_countries and ut_regions
        if (cd.countriesRegions.indexOf('*') == 0) {
            data.ut_regions = data.ut_countries = '*';
        }
        else {
            cd.countriesRegions.split('|').forEach(cr => {
                // cr == US:CA,FL,OR,...
                let temp = cr.split(':');

                data.ut_countries += ',' + temp[0];
                data.ut_regions += '|' + temp[1];
            });

            // Remove '|' from beginning of strings
            data.ut_countries = data.ut_countries.substr(1);
            data.ut_regions = data.ut_regions.substr(1);
        }

        // Send campaign to API
        request({
            url: "api/advertisers/campaigns",
            data, method: "POST", success: (res) => {
                res.loading = false;
                this.setState(res);
            }
        });
    }

    render() {
        if (this.state.loading) {
            return <p>Creating campaign...</p>;
        }
        else if (this.state.error) {
            return (
                <section>
                    <Alert type="error" title="Error">{
                        this.state.message
                    }</Alert>
                    
                    <Button onClick={() => this.props.step('-')}>
                        Back
                    </Button>
                </section>
            )
        }
        else {
            return (
                <Alert type="success" title="Success">{
                    this.state.message
                }</Alert>
            )
        }
    }

}