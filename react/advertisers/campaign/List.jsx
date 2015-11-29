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

                c.link = "campaign/" + c.id;
                c.status = "campaign-status-" + (!!c.approved ? "approved" : "pending");
                c.payType = c.payType == 1 ? "clicks" : "views";
                
                if (c.dailyFunds == 0)
                    c.allocated = <span>No Limit Set</span>;
                else
                    c.allocated = <span><b>{'$' + c.dailyFundsUsed}</b> used of <b>{'$' + c.dailyFunds}</b> daily limit</span>;

                campaigns.push(
                    <div className="advertisers-campaigns-campaign">
                        <div className="campaign-top">
                            <span className={c.status}></span>
                            <span className="campaign-name">
                                <a onClick={this.props.updateRoute.bind(this, c.link)}>{c.name}</a>
                            </span>
                            <span className="campaign-completed">
                                {c.provided == 0 ? "0.00%" :  Number(Math.round((c.provided / c.requested)+'e'+2)+'e-'+2) + '%'}
                            </span>
                        </div>

                        <div className="campaign-bottom">
                            <span><b>{"$" + c.funds}</b> in Campaign</span>
                            {c.allocated}
                            <span><b>{c.provided}</b> {c.payType} received of <b>{c.requested}</b></span>
                        </div>
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