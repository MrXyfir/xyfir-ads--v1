var Button = require("../../../forms/Button");
var Alert = require("../../../forms/Alert");

var categorySearchResults = [], siteSearchResults = [];

// ** Replace category textbox with scrollable selector
module.exports = React.createClass({

    getInitialState: function() {
        return { error: false, message: '', trigger: false, sites: [], categories: [] };
    },

    componentWillMount: function() {
        // Load categories
        ajax({
            url: API + "pub/categories",
            dataType: "json",
            success: function(res) {
                this.setState(res);
            }.bind(this)
        });

        // Load sites
        ajax({
            url: API + "pub/sites",
            dataType: "json",
            success: function(res) {
                this.setState(res);
            }.bind(this)
        });
    },

    next: function () {
        this.step('+');
    },

    back: function() {
        this.step('-');
    },

    step: function(action) {
        // Ensure user provided a valid category
        if (this.state.categories.indexOf(this.refs.category.value) == -1) {
            this.setState({ error: true, message: "Invalid category provided" });
            return;
        }

        // Ensure user only selected sites in our publisher network
        if (!!window.campaignData.sites.length) {
            for (var i = 0; i < window.campaignData.sites.length; i++) {
                if (this.state.sites.indexOf(window.campaignData.sites[i]) == -1) {
                    this.setState({ error: true, message: "Invalid website(s) provided" });
                    return;
                }
            }
        }

        // Validate keywords length
        if (this.refs.keywords.value.length > 1500) {
            this.setState({ error: true, message: "Too many keywords provided! Limit 1,500 characters" });
            return;
        }

        window.campaignData.category = this.refs.category.value, window.campaignData.keywords = this.refs.keywords.value;

        this.props.step(action);
    },

    addSite: function() {
        // Add site if it doesn't exist
        if (window.campaignData.sites.indexOf(this.refs.site.value) == -1)
            window.campaignData.sites.push(this.refs.site.value);

        this.setState({ trigger: !this.state.trigger });
    },

    remSite: function() {
        // Remove site if it exists
        var i = window.campaignData.sites.indexOf(this.refs.site.value);

        if (i != -1) window.campaignData.sites.splice(i, 1);

        this.setState({ trigger: !this.state.trigger });
    },

    searchSites: function() {
        // Save first 5 matches
        siteSearchResults = [];
        this.state.sites.forEach(function(site) {
            if (site.indexOf(this.refs.site.value) != -1 && siteSearchResults.length < 6) {
                siteSearchResults.push(<span className="search-result">{site}</span>);
            }
        }.bind(this));

        this.setState({ trigger: !this.state.trigger });
    },

    searchCategories: function() {
        // Save first 5 matches
        categorySearchResults = [];
        this.state.categories.forEach(function(category) {
            if (category.indexOf(this.refs.category.value) != -1 && categorySearchResults.length < 6) {
                categorySearchResults.push(<span className="search-result">{category}</span>);
            }
        }.bind(this));

        this.setState({ trigger: !this.state.trigger });
    },

    render: function () {
        var alert;
        if (this.state.error) alert = <Alert type="error" title="Error!">{this.state.message}</Alert>;

        return (
            <div className="form-step">
                <div className="form-step-head">
                    <h2>Content Targeting</h2>
                    <p>Describe the content of your advertisement and the content you would like your ad to appear alongside.</p>
                </div>

                <div className="form-step-body">
                    {alert}

                    <label>Keywords</label>
                    <small>A comma delimited list of keywords that describe your advertisement and its targets.</small>
                    <textarea defaultValue={window.campaignData.keywords} ref="keywords"></textarea>

                    <label>Category</label>
                    <input type="text" ref="category" onKeyDown={this.searchCategories} defaultValue={window.campaignData.category} />
                    <div className="search-results">
                        {categorySearchResults}
                    </div>

                    <label>Sites</label>
                    <small>List sites in our publishers network that you would like your ad to appear on. Leave blank for all sites.</small>
                    <input type="text" ref="site" onKeyDown={this.searchSites} />
                    <div className="search-results">
                        {siteSearchResults}
                    </div>
                    <Button type="primary btn-sm" onClick={this.addSite}>Add Site</Button>
                    <Button type="primary btn-sm" onClick={this.remSite}>Remove Site</Button>
                    <div className="target-sites">
                        {window.campaignData.sites.join(", ")}
                    </div>
                </div>

                <div className="form-step-nav">
                    <Button type="secondary" onClick={this.back}>Back</Button>
                    <Button onClick={this.next}>Next</Button>
                </div>
            </div>
        );
    }

});