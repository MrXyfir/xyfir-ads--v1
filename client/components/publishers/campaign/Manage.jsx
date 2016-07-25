import React from "react";

// Components
import Reports from "./manage/Reports";
import View from "./manage/View";
import Edit from "./manage/Edit";
import End from "./manage/End";

export default class ManagePublisherCampaign extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let view, hash = "#/publishers/campaign/" + this.props.id;

        switch (this.props.action) {
            case "end":
                view = <End id={this.props.id} />; break;
            case "view":
                view = <View id={this.props.id} />; break;
            case "edit":
                view = <Edit id={this.props.id} />; break;
            case "reports":
                view = <Reports id={this.props.id} />;
        }

        return (
            <div className="publishers-campaign-manage">
                <nav className="publishers-nav-sub">
                    <a href={hash + "/view"} className="link-lg">View</a>
                    <a href={hash + "/reports"} className="link-lg">Reports</a>
                    <a href={hash + "/edit"} className="link-lg">Edit</a>
                    <a href={hash + "/end" } className="link-lg">End</a>
                </nav>

                {view}
            </div>
        );
    }

}