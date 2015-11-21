var Advertisers = require("./advertisers/Advertisers");
var Campaigns = require("./advertisers/Campaigns");

var AdvertisersRoutes = React.createClass({

    return: function () {
        return (
        <Router>
    	    <Route path="advertisers" component={Advertisers}>
		        <IndexRoute path="campaigns" component={Campaigns} />
		        <Route path="campaigns" component={Campaigns} />
		        <Route path="campaign" component={Campaign}>
			        <Route path="create" component={CampaignCreate} />
			        <Route path=":id" component={CampaignManage} />
		        </Route>
		        <Route path="account" component={Account} />
	        </Route>
        </Router>  
        );
    }

});

ReactDOM.render(<AdvertisersRoutes />, $("#content"));