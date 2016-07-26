import React from "react";

// Components
import ContentTargeting from "components/advertisers/create/ContentTargeting";
import UserTargeting from "components/advertisers/create/UserTargeting";
import BasicInfo from "components/advertisers/create/BasicInfo";
import AdInfo from "components/advertisers/create/AdInfo";
import Funds from "components/advertisers/create/Funds";
import Final from "components/advertisers/create/Final";

export default class CreateAdvertiserCampaign extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = { step: 1 };

        // Available to and Modified by All 'Step' Components
        window.campaignData = {
            name: "", type: 0, payType: 0, available: "",
            genders: [false, true, true, true], countriesRegions: "",
            age: [false, true, true, true, true, true, true],
            category: "", keywords: "", sites: [],
            requested: 0, allocated: 10.00, dailyFunds: 0.00, autobid: false,
            bid: 0.00, title: "", link: "", description: "", media: ""
        };
    }

    _step(action) {
        this.setState({
            step: action == '+' ? this.state.step + 1 : this.state.step - 1
        });
    }

    render() {
        let step;

        switch (this.state.step) {
            case 1:
                step = <BasicInfo step={this._step} />; break;
            case 2:
                step = <UserTargeting step={this._step} />; break;
            case 3:
                step = <ContentTargeting step={this._step} />; break;
            case 4:
                step = <Funds step={this._step} />; break;
            case 5:
                step = <AdInfo step={this._step} />; break;
            case 6:
                step = <Final step={this._step} />;
        }

        return(
            <div className="advertisers-campaign-create">
                {step}
            </div>
        );
    }

}