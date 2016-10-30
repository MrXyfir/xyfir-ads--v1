import React from "react";

// Components
import Button from "components/forms/Button";

// Module
import request from "lib/request";

export default class PublisherCampaignAdBlacklist extends React.Component {

    constructor(props) {
        super(props);

        this.state = { blacklisted: [], search: [] };
    }

    componentWillMount() {
        request({
            url: "api/publishers/campaigns/" + this.props.id + "/blacklist",
            success: (res) => {
                this.setState({ blacklisted: res.ads });
            }
        });
    }

    onAdd(id) {
        request({
            url: `api/publishers/campaigns/${this.props.id}/blacklist/${id}`,
            method: "POST", success: (res) => {
                if (!res.error) {
                    this.setState({
                        blacklisted: this.state.blacklisted.concat([
                            this.state.search.find(a => a.id == id)
                        ])
                    });
                }
            }
        });
    }

    onSearch() {
        clearTimeout(this.searchTimeout);

        const search = this.refs.search.value;

        this.searchTimeout = setTimeout(() => {
            request({
                url: "api/ad/search?search=" + search,
                success: (res) => {
                    this.setState({ search: res.ads });
                }
            });
        }, 200);
    }

    onRemove(id) {
        request({
            url: `api/publishers/campaigns/${this.props.id}/blacklist/${id}`,
            method: "DELETE", success: (res) => {
                if (!res.error) {
                    this.setState({
                        blacklisted: this.state.blacklisted.filter(a => a.id != id)
                    });
                }
            }
        });
    }

    render() {
        return(
            <div className="ad-blacklist">
                <p>
                    Ads in your blacklist will not be available to your campaign.
                </p>

                <h3>Search Advertisements</h3>
                <section className="add-to">
                    <input
                        ref="search"
                        type="text"
                        onChange={() => this.onSearch()}
                        placeholder="Search"
                    />
                    
                    <span className="note">
                        Some ads in this list may not be eligible for output to your campaign due to targeting incompatibilities.
                    </span>
                    <div className="search-ads">{
                        this.state.search.map(ad => {
                            return (
                                <div className="ad">
                                    <span className="title">{ad.title}</span>
                                    <span className="description">{ad.description}</span>
                                    <a
                                        onClick={() => this.onAdd(ad.id)}
                                        className="icon-add"
                                    >Add to Blacklist</a>
                                </div>
                            )
                        })
                    }</div>
                </section>

                <hr />

                <h3>Blacklisted Ads</h3>
                <section className="blacklisted-ads">{
                    this.state.blacklisted.map(ad => {
                        return (
                            <div className="ad">
                                <span className="title">{ad.title}</span>
                                <span className="description">{ad.description}</span>
                                <a
                                    onClick={() => this.onRemove(ad.id)}
                                    className="icon-delete"
                                >Remove From Blacklist</a>
                            </div>
                        )
                    })
                }</section>
            </div>
        );
    }

}