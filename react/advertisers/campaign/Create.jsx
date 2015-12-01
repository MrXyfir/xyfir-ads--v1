var ContentTargeting = require("./create/ContentTargeting");
var UserTargeting = require("./create/UserTargeting");
var BasicInfo = require("./create/BasicInfo");
var AdInfo = require("./create/AdInfo");
var Funds = require("./create/Funds");
var Final = require("./create/Final");

/* Available to and Modified by All 'Step' Components */
var campaignData = {
    name: "", type: 0, payType: 0, available: "",
    genders: [false, true, true, true], countriesRegions: "", age: [false, true, true, true, true, true, true],
    category: "", keywords: "", sites: [],
    requested: 0, allocated: 10.00, dailyFunds: 0.00, autobid: false, bid: 0.00,
    title: "", link: "", description: "", media: ""
};

module.exports = React.createClass({

    getInitialState: function() {
        return { step: 1 };
    },

    step: function(action) {
        this.setState({
            step: action == '+' ? step++ : step--
        });
    },

    render: function () {
        var step;

        switch (this.state.step) {
            case 1:
                step = <BasicInfo step={this.step} />; break;
            case 2:
                step = <UserTargeting step={this.step} />; break;
            case 3:
                step = <ContentTargeting step={this.step} />; break;
            case 4:
                step = <Funds step={this.step} />; break;
            case 5:
                step = <AdInfo step={this.step} />; break;
            case 6:
                step = <Final step={this.step} />;
        }

        return(
            <div className="advertisers-campaign-create">
                {step}
            </div>
        );
    }

});