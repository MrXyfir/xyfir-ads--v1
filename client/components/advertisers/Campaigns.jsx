var Manage = require("./campaign/Manage");
var Create = require("./campaign/Create");
var List = require("./campaign/List");

module.exports = React.createClass({

    render: function () {
        // Determine campaign ID and action if user
        // is accessing a single campaign
        if (this.props.view == "campaign-manage") {
            var a = document.createElement('a');
            a.href = location.href;

            // /advertisers/campaign/:id[/:action]
            var routes = a.pathname.split('/');

            var id = routes[3], action = "view";

            if (routes[4] != undefined)
                action = routes[4];
        }

        switch (this.props.view) {
            case "campaign-list":
                return (<List updateRoute={this.props.updateRoute} />);
            case "campaign-create":
                return (<Create updateRoute={this.props.updateRoute} />);
            case "campaign-manage":
                return (<Manage updateRoute={this.props.updateRoute} id={id} action={action} />);
        }
    }

});