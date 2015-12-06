var Button = require("../../forms/Button");
var Alert = require("../../forms/Alert");

module.exports = React.createClass({

    getInitialState: function() {
        return {
            categories: [], categorySearchResults: [], selectedCategories: [],
            error: false, message: ""
        };
    },

    componentWillMount: function() {
        ajax({
            url: API + "pub/categories",
            dataType: "json",
            success: function(res) {
                this.setState(res);
            }.bind(this)
        })
    },

    categorySearch: function() {
        // Save first 5 matches
        var categorySearchResults = [];
        this.state.categories.forEach(function(category) {
            if (category.indexOf(this.refs.category.value) != -1 && categorySearchResults.length < 6) {
                categorySearchResults.push(<span className="search-result">{category}</span>);
            }
        }.bind(this));

        this.setState({ categorySearchResults: categorySearchResults });
    },

    addCategory: function() {
        // Add category if it doesn't exist in selected categories
        if (this.state.selectedCategories.indexOf(this.refs.category.value) == -1 && this.state.selectedCategories.length < 3)
            this.setState({ selectedCategories: this.state.selectedCategories.concat(this.refs.category.value) });
    },

    createCampaign: function() {
        var create = true;

        // Validate that all selected categories exists
        this.state.selectedCategories.map(function(category) {
            if (this.state.categories.indexOf(category) == -1) {
                this.setState({ error: true, message: "Invalid category provides" });
                create = false;
            }
        }.bind(this));

        // User must select at least one but no more than 3 categories
        if (this.state.selectedCategories.length == 0 || this.state.selectedCategories.length > 3) {
            this.setState({ error: true, message: "You must select 1-3 categories" });
            create = false;
        }

        if (!create) return;

        ajax({
            url: API + "publishers/campaigns",
            data: {
                name: this.refs.name.value,
                site: this.refs.site.value,
                type: this.refs.type.value,
                keywords: this.refs.keywords.value,
                categories: this.state.selectedCategories.join(',')
            },
            method: "POST",
            dataType: "json",
            success: function(res) {
                this.setState(res);
            }.bind(this)
        });
    },

    render: function() {
        var alert;

        if (this.state.error)
            alert = <Alert type="error" title="Error!">{this.state.message}</Alert>
        else if (this.state.message != "")
            alert = <Alert type="success" title="Success!">{this.state.message}</Alert>

        return (
            <div className="publishers-campaign-create form-step">
                <div className="form-step-head">
                    <h2>Create Campaign</h2>
                </div>

                <div className="form-step-body">
                    {alert}

                    <label>Campaign Name</label>
                    <input type="text" ref="name" />

                    <label>Website</label>
                    <input type="text" ref="site" placeholder="https://yoursite.com/" />

                    <label>Campaign Type</label>
                    <select ref="type">
                        <option value="1">Website</option>
                        <option value="2">App / Web App</option>
                    </select>

                    <label>Keywords</label>
                    <small>
                        Describe your site and its content/targets/categories with keywords and phrases.
                        <br />
                        List is comma delimited.
                    </small>
                    <textarea ref="keywords" defaultValue="keyword1,keyword2,keyword phrase,keyword4"></textarea>
                    
                    <label>Category</label>
                    <input type="text" ref="category" onChange={this.categorySearch} />
                    <Button type="primary btn-sm" onClick={this.addCategory}>Add Category</Button>

                    <div className="search-results">{
                        this.state.categorySearchResults.map(function(category) {
                            return(<span className="search-result">{category}</span>);
                        })
                    }</div>

                    <div className="category-selected">{
                        this.state.selectedCategories.map(function(category) {
                            return(<span>{category}</span>);
                        })
                    }</div>
                </div>

                <div className="form-step-nav">
                    <Button onClick={this.createCampaign}>Create Campaign</Button>
                </div>
            </div>
        );
    }

});