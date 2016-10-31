import React from "react";

// Components
import Button from "components/forms/Button";

// Modules
import request from "lib/request";

export default class CreatePublisherCampaign extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            categories: [], categorySearchResults: [], selectedCategories: []
        };
    }

    componentWillMount() {
        request({
            url: "api/pub/categories",
            success: (res) => this.setState(res)
        })
    }

    onResetCategories() {
        this.setState({ selectedCategories: [] });
    }

    onCategorySearch() {
        this.setState({
            categorySearchResults: this.state.categories.filter(category => {
                return category.indexOf(this.refs.category.value) > -1
            }).slice(0, 5)
        });
    }

    onAddCategory() {
        // Add category if it doesn't exist in selected categories
        if (
            this.state.selectedCategories.indexOf(this.refs.category.value) == -1
            && this.state.selectedCategories.length < 3
        ) {
            this.setState({
                selectedCategories: this.state.selectedCategories.concat(
                    this.refs.category.value
                )
            });
        }
    }

    onCreateCampaign() {
        let create = true;

        // Validate that all selected categories exists
        this.state.selectedCategories.map((category) => {
            if (this.state.categories.indexOf(category) == -1) {
                swal("Error", "Invalid category provided", "error");
                create = false;
            }
        });

        // User must select at least one but no more than 3 categories
        if (
            this.state.selectedCategories.length == 0
            || this.state.selectedCategories.length > 3
        ) {
            swal("Error", "You must select 1-3 categories", "error");
            create = false;
        }

        if (!create) return;

        request({
            url: "api/publishers/campaigns",
            data: {
                name: this.refs.name.value,
                site: this.refs.site.value,
                type: this.refs.type.value,
                keywords: this.refs.keywords.value,
                categories: this.state.selectedCategories.join(',')
            },
            method: "POST", success: (res) => {
                if (res.error)
                    swal("Error", res.message, "error");
                else
                    swal("Success", res.message, "success");
            }
        });
    }

    render() {
        return (
            <div className="publishers-campaign-create form-step">
                <section className="form-step-head">
                    <h2>Create Campaign</h2>
                </section>

                <section className="form-step-body">
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
                    <textarea
                        ref="keywords"
                        defaultValue="keyword1,keyword2,keyword phrase,keyword4"
                    />
                    
                    <label>Category</label>
                    <input
                        type="text"
                        ref="category"
                        onChange={() => this.onCategorySearch()}
                    />
                    <Button type="primary btn-sm" onClick={() => this.onAddCategory()}>
                        Add Category
                    </Button>
                    <Button type="red btn-sm" onClick={() => this.onResetCategories()}>
                        Reset Categories
                    </Button>

                    <div className="search-results">{
                        this.state.categorySearchResults.map(category => {
                            return(
                                <span className="search-result">{category}</span>
                            );
                        })
                    }</div>

                    <div className="category-selected">{
                        this.state.selectedCategories.map(category => {
                            return <span>{category}</span>;
                        })
                    }</div>
                </section>

                <section className="form-step-nav">
                    <Button onClick={() => this.onCreateCampaign()}>
                        Create Campaign
                    </Button>
                </section>
            </div>
        );
    }

}