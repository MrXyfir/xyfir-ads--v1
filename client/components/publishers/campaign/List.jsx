import React from "react";

// Modules
import request from "lib/request";

export default class PublisherCampaignsList extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            campaigns: [/* {
                id: number, name: string, site: string, type: number
            } */]
        };
    }

    componentWillMount() {
        request({
            url: "api/publishers/campaigns",
            success: res => this.setState(res)
        });
    }

    render() {
        return (
            <section>
                <table className="publishers-campaigns">{
                    !this.state.campaigns.length ? (
                        <div className="publishers-campaigns-none">
                            <h3>You do not have any active campaigns!</h3>
                        </div>
                    ) : this.state.campaigns.map(c => {
                        c.link = "#/publishers/campaign/" + c.id;
                        
                        return (
                            <tr className="campaign">
                                <td className="name">
                                    <a href={c.link}>{c.name}</a>
                                </td>
                                <td className="site">{c.site}</td>
                                <td className="type">{
                                    c.type == 1 ? "Site" : "App"
                                }</td>
                            </tr>
                        ); 
                    })
                }</table>
            </section>
        );
    }

}