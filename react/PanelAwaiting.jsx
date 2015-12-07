/* Route Components */
var PublishersAwaiting = require("./panel/awaiting/Publishers");
var AdsAwaiting = require("./panel/awaiting/Ads");
var Publisher = require("./panel/awaiting/Publisher");
var Ad = require("./panel/awaiting/Ad");

var PanelAwaiting = React.createClass({

    getInitialState: function() {
        return { view: "ads-awaiting", id: 0 };
    },

    componentWillMount: function () {
        // Set view based on current URL
        this.routeUpdated();
    },

    // Update URL and call routeUpdate()
    updateRoute: function(route) {
        route = URL + "panel/awaiting/" + route;
        history.pushState({}, '', route);
        this.routeUpdated();
    },

    // Set state.view based on current URL
    routeUpdated: function() {
        // Parse url
        var a = document.createElement('a');
        a.href = location.href;

        // Set state.view based on route
        switch (a.pathname) {
            case "/panel/awaiting":
                this.setState({ view: "ads-awaiting" }); break;
            case "/panel/awaiting/ads":
                this.setState({ view: "ads-awaiting" }); break;
            case "/panel/awaiting/publishers":
                this.setState({ view: "publishers-awaiting" }); break;
            default:
                // Viewing an ad/publisher
                // match[1] == type, match[2] == id
                var match = a.pathname.match(/\/panel\/awaiting\/(ad|publisher)\/(\d*)/);
                if (!match)
                    this.setState({ view: "ads-awaiting" });
                else
                    this.setState({ view: match[1], id: match[2] });
        }
    },

    render: function () {
        var view;
        switch (this.state.view) {
            case "publishers-awaiting":
                view = <PublishersAwaiting updateRoute={this.updateRoute} />; break;
            case "ads-awaiting":
                view = <AdsAwaiting updateRoute={this.updateRoute} />; break;
            case "publisher":
                view = <Publisher id={this.state.id} />; break;
            case "ad":
                view = <Ad id={this.state.id} />;
        }

        return (
            <div className="panel-waiting">
                <div className="nav">
                    <a onClick={this.updateRoute.bind(this, "ads")} className="link-lg">Advertisements</a>
                    <a onClick={this.updateRoute.bind(this, "publishers")} className="link-lg">Publishers</a>
                </div>

                {view}
            </div>
        );
    }

});

ReactDOM.render(<PanelAwaiting />, $("#content"));