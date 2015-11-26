var Link = window.ReactRouter.Link;

module.exports = React.createClass({

    render: function () {
        return (
            <div className="advertisers">
                <div className="advertisers-nav">
                    <Link to="/campaign/create">Create Campaign</Link>
                    <Link to="/campaigns">View Campaigns</Link>
                    <Link to="/account">My Account</Link>
                </div>

                {this.props.children}
            </div>
        );
    }

});