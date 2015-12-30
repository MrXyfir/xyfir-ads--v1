var Button = require("../../../forms/Button");
var Alert = require("../../../forms/Alert");

module.exports = React.createClass({

    getInitialState: function() {
        return {
            name: "", categories: "", keywords: "", site: "",
            type: 0, clicks: 0, views: 0, test: "",
            earnings: 0, pending: 0
        };
    },

    componentWillMount: function() {
        ajax({
            url: API + "publishers/campaigns/" + this.props.id,
            dataType: "json",
            success: function(res) {
                this.setState(res);
            }.bind(this)
        });
    },

    render: function() {
        if (this.state.name == "")
            return <div></div>;

        var c = this.state;

        return(
            <div className="publishers-campaign">
                <h2><a href={c.site} target="_blank">{c.name}</a></h2>

                <h3>Statistics</h3>
                <table className="campaign-statistics">
                    <tr>
                        <th>Type</th><td>{c.type == 1 ? "Website" : "App / Web App"}</td>
                    </tr>
                    <tr>
                        <th>Clicks</th><td>{c.clicks == 0 ? "None" : c.clicks}</td>
                    </tr>
                    <tr>
                        <th>Views</th><td>{c.views == 0 ? "None" : c.views}</td>
                    </tr>
                    <tr>
                        <th>CTR</th><td>{c.clicks == 0 ? "0.00" : c.clicks / c.views}%</td>
                    </tr>
                </table>

                <hr />

                <h3>Earnings</h3>
                <table className="campaign-earnings">
                    <tr>
                        <th>Confirmed</th><td>{'$' + c.earnings}</td>
                    </tr>
                    <tr>
                        <th>Pending</th><td>{'$' + c.pending}</td>
                    </tr>
                </table>

                <hr />

                <h4>Keywords</h4>
                <div className="keywords">{
                    c.keywords.split(',').map(function(kw) {
                        return(<span>{kw}</span>);
                    })
                }</div>

                <h4>Categories</h4>
                <div className="category-selected">{
                    c.categories.split(',').map(function(cat) {
                        return(<span>{cat}</span>);
                    })
                }</div>

                <hr />

                <h4>Test Mode Key</h4>
                <p>
                    Read more about Test Mode in our <a href="https://xyfir.github.io/ads/developers#TestMode" target="_blank">developer documentation.</a>
                </p>
                <input type="text" onclick="this.select()" value={c.test} />
            </div>
        );
    }

});