/* Route Components */
var Campaigns = require("./advertisers/Campaigns");
var Account = require("./advertisers/Account");

var Advertisers = React.createClass({

    getInitialState: function() {
        return { view: "campaigns" };
    },

    componentWillMount: function () {
        // Set view based on current URL
        routeUpdated();
    },

    /*
        Update URL and call routeUpdate()
    */
    updateRoute: function(route) {
        route = URL + "advertisers/" + route;
        history.pushState({}, '', route);
        routeUpdated();
    },

    /*
        Set state.view based on current URL
    */
    routeUpdated: function() {
        // Parse url
        var a = document.createElement('a');
        a.href = location.href;

        // Set state.view based on route
        switch (a.pathname) {
            case "/advertisers":
                this.setState({ view: "account" }); break;
            case "/advertisers/account":
                this.setState({ view: "account" }); break;
            case "/advertisers/campaigns":
                this.setState({ view: "campaign-list" }); break;
            case "/advertisers/campaign/create":
                this.setState({ view: "campaign-create" }); break;
            default:
                // User is viewing/editing/etc a single campaign
                if (a.pathname.indexOf("/advertisers/campaign/") == 0)
                    this.setState({ view: "campaign-manage" });
        }
    },

    render: function () {
        var view;
        if (this.state.view.indexOf("campaign") == 0) {
            view = <Campaigns view={this.state.view} updateRoute={this.updateRoute} />;
        }
        else if (this.state.view == "account") {
            view = <Account view={this.state.view} updateRoute={this.updateRoute} />;
        }

        return (
            <div className="advertisers">
                <div className="advertisers-nav">
                    <a onClick={this.updateRoute.bind(this, "campaign/create")} className="link-lg">Create Campaign</a>
                    <a onClick={this.updateRoute.bind(this, "campaigns")} className="link-lg">View Campaigns</a>
                    <a onClick={this.updateRoute.bind(this, "account")} className="link-lg">My Account</a>
                </div>

                {view}
            </div>
        );
    }

});

ReactDOM.render(<Advertisers />, $("#content"));