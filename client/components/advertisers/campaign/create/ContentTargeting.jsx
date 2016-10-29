var categorySearchResults = [], siteSearchResults = [];

import React from "react";

// Components
import Button from "components/forms/Button";
import Alert from "components/forms/Alert";

// Modules
import request from "lib/request";

// ** Replace category textbox with scrollable selector
export default class ContentTargeting extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            error: false, message: '', trigger: false,
            sites: [], categories: []
        };
    }

    componentWillMount() {
        // Load categories
        request({
            url: "api/pub/categories",
            success: (res) => this.setState(res)
        });

        // Load sites
        request({
            url: "api/pub/sites",
            success: (res) => this.setState(res)
        });
    }

    onNext() {
        this._step('+');
    }

    onBack() {
        this._step('-');
    }

    _step(action) {
        // Ensure user provided a valid category
        if (this.state.categories.indexOf(this.refs.category.value) == -1) {
            this.setState({ error: true, message: "Invalid category provided" });
            return;
        }

        // Ensure user only selected sites in our publisher network
        if (!!window.campaignData.sites.length) {
            for (let i = 0; i < window.campaignData.sites.length; i++) {
                if (this.state.sites.indexOf(window.campaignData.sites[i]) == -1) {
                    this.setState({
                        error: true, message: "Invalid website(s) provided"
                    }); return;
                }
            }
        }

        // Validate keywords length
        if (this.refs.keywords.value.length > 1500) {
            this.setState({
                error: true,
                message: "Too many keywords provided! Limit 1,500 characters"
            }); return;
        }

        window.campaignData.category = this.refs.category.value, window.campaignData.keywords = this.refs.keywords.value;

        this.props.step(action);
    }

    onAddSite() {
        // Add site if it doesn't exist
        if (window.campaignData.sites.indexOf(this.refs.site.value) == -1)
            window.campaignData.sites.push(this.refs.site.value);

        this.setState({ trigger: !this.state.trigger });
    }

    onRemSite() {
        // Remove site if it exists
        let i = window.campaignData.sites.indexOf(this.refs.site.value);

        if (i != -1) window.campaignData.sites.splice(i, 1);

        this.setState({ trigger: !this.state.trigger });
    }

    onSearchSites() {
        // Save first 5 matches
        siteSearchResults = [];
        this.state.sites.forEach(site => {
            if (site.indexOf(this.refs.site.value) != -1 && siteSearchResults.length < 6) {
                siteSearchResults.push(
                    <span className="search-result">{site}</span>
                );
            }
        });

        this.setState({ trigger: !this.state.trigger });
    }

    onSearchCategories() {
        // Save first 5 matches
        categorySearchResults = [];
        this.state.categories.forEach(category => {
            if (
                category.indexOf(this.refs.category.value) != -1 &&
                categorySearchResults.length < 6
            ) {
                categorySearchResults.push(
                    <span className="search-result">{category}</span>
                    );
            }
        });

        this.setState({ trigger: !this.state.trigger });
    }

    render() {
        let alert;
        if (this.state.error) {
            alert = <Alert type="error" title="Error!">{this.state.message}</Alert>;
        }

        return (
            <div className="form-step">
                <div className="form-step-head">
                    <h2>Content Targeting</h2>
                    <p>
                        Describe the content of your advertisement and the content you would like your ad to appear alongside.
                    </p>
                </div>

                <div className="form-step-body">
                    {alert}

                    <label>Keywords</label>
                    <small>
                        A comma delimited list of keywords that describe your advertisement and its targets.
                    </small>
                    <textarea
                        defaultValue={window.campaignData.keywords}
                        ref="keywords"
                    />

                    <label>Category</label>
                    <input
                        type="text"
                        ref="category"
                        onKeyDown={() => this.onSearchCategories()}
                        defaultValue={window.campaignData.category}
                    />
                    <div className="search-results">
                        {categorySearchResults}
                    </div>

                    <label>Sites</label>
                    <small>
                        List sites in our publishers network that you would like your ad to appear on. Leave blank for all sites.
                    </small>
                    
                    <input type="text" ref="site" onKeyDown={() => this.onSearchSites()} />
                    <div className="search-results">
                        {siteSearchResults}
                    </div>
                    
                    <Button type="secondary btn-sm" onClick={() => this.onAddSite()}>
                        Add Site
                    </Button>
                    <Button type="red btn-sm" onClick={() => this.onRemSite()}>
                        Remove Site
                    </Button>
                    
                    <div className="target-sites">
                        {window.campaignData.sites.join(", ")}
                    </div>
                </div>

                <div className="form-step-nav">
                    <Button type="secondary" onClick={() => this.onBack()}>
                        Back
                    </Button>
                    <Button onClick={() => this.onNext()}>
                        Next
                    </Button>
                </div>
            </div>
        );
    }

}