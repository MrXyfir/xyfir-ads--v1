/* React Router */
var IndexRoute = window.ReactRouter.IndexRoute;
var Router = window.ReactRouter.Router;
var Route = window.ReactRouter.Route;

/* Route Components */
var Advertisers = require("./advertisers/Advertisers");
var Campaigns = require("./advertisers/Campaigns");
var Campaign = require("./advertisers/Campaign");
var Account = require("./advertisers/Account");
var Manage = require("./advertisers/campaign/Manage");
var Create = require("./advertisers/campaign/Create");

var AdvertisersRoutes = React.createClass({

    render: function () {
        return (
        <Router>
    	    <Route path="advertisers" component={Advertisers}>
		        <IndexRoute path="campaigns" component={Campaigns} />
		        <Route path="campaigns" component={Campaigns} />
		        <Route path="campaign" component={Campaign}>
			        <Route path="create" component={Create} />
			        <Route path=":id" component={Manage} />
		        </Route>
		        <Route path="account" component={Account} />
	        </Route>
        </Router>  
        );
    }

});

ReactDOM.render(<AdvertisersRoutes />, $("#content"));