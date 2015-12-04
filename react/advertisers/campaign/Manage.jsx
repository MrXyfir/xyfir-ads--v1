var Reports = require("./manage/Reports");
var View = require("./manage/View");
var Edit = require("./manage/Edit");
var End = require("./manage/End");

module.exports = React.createClass({

    render: function () {
        var step, route = "campaign/" + this.props.id;

        switch (this.props.action) {
            case "end":
                step = <End id={this.props.id} />;
            case "view":
                step = <View id={this.props.id} />;
            case "edit":
                step = <Edit id={this.props.id} />;
            case "reports":
                step = <Reports id={this.props.id} />;
        }

        return (
            <div className="advertisers-campaign-manage">
                <div className="advertisers-nav-sub">
                    <a onClick={this.props.updateRoute.bind(this, route)} className="link-lg">View</a>
                    <a onClick={this.props.updateRoute.bind(this, route + "/reports")} className="link-lg">Reports</a>
                    <a onClick={this.props.updateRoute.bind(this, route + "/edit")} className="link-lg">Edit</a>
                    <a onClick={this.props.updateRoute.bind(this, route + "/end" )} className="link-lg">End</a>
                </div>

                {step}
            </div>
        );
    }

});