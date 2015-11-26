var Link = window.ReactRouter.Link;

module.exports = React.createClass({

    getInitialState: function() {
        return {
            campaigns: []
        };
    },

    componentWillMount: function () {
        ajax({
            url: URL + "api/advertisers/campaigns",
            method: "GET",
            dataType: "json",
            success: function (response) {
                this.setState(response);
            }.bind(this)
        });
    },

    render: function () {
        var campaigns = [];

        if (!this.state.campaigns.length) {
            campaigns.push(
                <div className="advertisers-campaigns-none">
                    <h3>You do not have any active campaigns!</h3>
                </div>
            );
        }
        else {
            var c;

            for (var i = 0; i < this.state.campaigns.length; i++) {
                c = this.state.campaigns[i];

                c.link = URL + "advertisers/campaign/" + c.id;
                c.status = "campaign-status-" + (!!c.approved ? "approved" : "pending");
                c.payType = c.payType == 1 ? "clicks" : "views";
                
                if (c.dailFunds == 0)
                    c.allocated = "No Limit Set";
                else
                    c.allocated = '$' + c.dailFundsUsed + " used of " + '$' + c.dailFunds + " limit";

                campaigns.push(
                    <div className="advertisers-campaigns-campaign">
                        <h3>
                            <Link to={c.link}>{c.name}</Link>
                            <span className={c.status}></span>
                        </h3>

                        <h4>{"$" + c.funds + " Funds Available"}</h4>

                        <h5>{c.provided + ' ' + c.payType + " Received of " + c.requested}</h5>

                        <p><b>Daily Allocated Funds:</b> {c.allocated}</p>
                    </div>
                );
            }
        }

        return (
        <div className="advertisers-campaigns">
            {campaigns}
        </div>  
        );
    }

});