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
                        blacklisted: this.state.blacklisted.filter(a => a.id == id)
                    });
                }
            }
        });
    }

    render() {
        return(
            <div className="campaign-blacklist">
                <section className="add-to">
                    <h3>Add Advert to Blacklist</h3>
                    <input
                        ref="search"
                        type="search"
                        onChange={() => this.onSearch()}
                        placeholder="Search"
                    />
                    
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

                <section className="blacklisted-ads">{
                    this.state.blacklisted.map(ad => {
                        return (
                            <div className="ad">
                                <span className="title">{ad.title}</span>
                                <span className="description">{ad.description}</span>
                                <a
                                    onClick={() => this.onRemove(ad.id)}
                                    className="icon-remove"
                                >Remove From Blacklist</a>
                            </div>
                        )
                    })
                }</section>
            </div>
        );
    }

}