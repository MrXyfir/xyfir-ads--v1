import React from "react";

// Components
import PublishersAwaiting from "components/panel/awaiting/Publishers";
import AdsAwaiting from "components/panel/awaiting/Ads";
import Publisher from "components/panel/awaiting/Publisher";
import Ad from "components/panel/awaiting/Ad";

export default class PanelAwaiting extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let view;
        switch (this.props.hash[3]) {
            case "ads":
                view = <AdsAwaiting />; break;
            case "publishers":
                view = <PublishersAwaiting />; break;
            case "ad":
                view = <Ad id={this.props.hash[4]} />; break;
            case "publisher":
                view = <Publisher id={this.props.hash[4]} />;
        }

        return (
            <div className="panel-waiting old">
                <nav className="nav">
                    <a href="#/panel/awaiting/ads" className="link-lg">Advertisements</a>
                    <a href="#/panel/awaiting/publishers" className="link-lg">Publishers</a>
                </nav>

                {view}
            </div>
        );
    }

}