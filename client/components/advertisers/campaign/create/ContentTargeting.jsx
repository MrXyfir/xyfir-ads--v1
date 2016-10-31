import React from "react";

// Components
import Button from "components/forms/Button";

// Modules
import request from "lib/request";

export default class ContentTargeting extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            sites: [], categories: [], categorySearch: [], siteSearch: []
        };
    }

    componentWillMount() {
        // Load categories
        request({
            url: "api/pub/categories", success: (res) => this.setState(res)
        });

        // Load sites
        request({
            url: "api/pub/sites", success: (res) => this.setState(res)
        });
    }

    _step(action) {
        // Ensure user provided a valid category
        if (this.state.categories.indexOf(this.refs.category.value) == -1) {
            swal("Error", "Invalid category provided", "error");
            return;
        }

        // Ensure user only selected sites in our publisher network
        if (!!window.campaignData.sites.length) {
            for (let i = 0; i < window.campaignData.sites.length; i++) {
                if (this.state.sites.indexOf(window.campaignData.sites[i]) == -1) {
                    swal("Error", "Invalid website(s) provided", "error");
                    return;
                }
            }
        }

        // Validate keywords length
        if (this.refs.keywords.value.length > 1500) {
            swal(
                "Error",
                "Too many keywords provided! Limit 1,500 characters",
                "error"
            ); return;
        }

        window.campaignData.category = this.refs.category.value,
        window.campaignData.keywords = this.refs.keywords.value;

        this.props.step(action);
    }

    onAddSite() {
        // Add site if it doesn't exist
        if (window.campaignData.sites.indexOf(this.refs.site.value) == -1)
            window.campaignData.sites.push(this.refs.site.value);

        this.forceUpdate();
    }

    onRemSite() {
        // Remove site if it exists
        let i = window.campaignData.sites.indexOf(this.refs.site.value);

        if (i != -1) window.campaignData.sites.splice(i, 1);

        this.forceUpdate();
    }

    onSearchSites() {
        this.setState({
            siteSearch: this.state.sites.filter(site => {
                return site.indexOf(this.refs.site.value) > -1;
            }).slice(0, 5)
        });
    }

    onSearchCategories() {
        this.setState({
            categorySearch: this.state.categories.filter(category => {
                return category.indexOf(this.refs.category.value) > -1
            }).slice(0, 5)
        });
    }

    render() {
        return (
            <div className="form-step content-targeting">
                <section className="form-step-head">
                    <h2>Content Targeting</h2>
                    <p>
                        Describe the content of your advertisement and the content you would like your ad to appear alongside.
                    </p>
                </section>

                <section className="form-step-body">
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
                        onChange={() => this.onSearchCategories()}
                        defaultValue={window.campaignData.category}
                    />
                    <div className="search-results">{
                        this.state.categorySearch.map(category => {
                            return (
                                <span className="search-result">{category}</span>
                            );
                        })
                    }</div>

                    <label>Sites</label>
                    <small>
                        List sites in our publishers network that you would like your ad to appear on. Leave blank for all sites.
                    </small>
                    
                    <input
                        type="text"
                        ref="site"
                        onChange={() => this.onSearchSites()}
                    />
                    <div className="search-results">{
                        this.state.siteSearch.map(site => {
                            return (
                                <span className="search-result">{site}</span>
                            );
                        })
                    }</div>
                    
                    <Button type="secondary btn-sm" onClick={() => this.onAddSite()}>
                        Add Site
                    </Button>
                    <Button type="red btn-sm" onClick={() => this.onRemSite()}>
                        Remove Site
                    </Button>
                    
                    <div className="target-sites">
                        {window.campaignData.sites.join(", ")}
                    </div>
                </section>

                <section className="form-step-nav">
                    <Button type="secondary" onClick={() => this._step('-')}>
                        Back
                    </Button>
                    <Button onClick={() => this._step('+')}>
                        Next
                    </Button>
                </section>
            </div>
        );
    }

}