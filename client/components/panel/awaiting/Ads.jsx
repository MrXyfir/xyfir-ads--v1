import React from "react";

// Modules
import request from "lib/request";

export default class Ads extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            ads: [
                /* { id: number, ad_title: string, ad_type: number, funds: number } */
            ]
        };
    }

    componentWillMount() {
        request({
            url: "api/panel/awaiting/ads",
            success: (res) => this.setState(res)
        });
    }

    render() {
        let ads = [];

        if (!this.state.ads.length) {
            return(
                <h3>There are no ads pending approval at this time.</h3>
            );
        }
        else {
            ads = this.state.ads.map(ad => {
                ad.link = "#/panel/awaiting/ad/" + ad.id;
                
                return(
                    <tr>
                        <td><a href={ad.link}>{ad.ad_title}</a></td>
                        <td>{'$' + ad.funds}</td>
                        <td>{["", "Text", "Short", "Image", "Video"][ad.ad_type]}</td>
                    </tr>
                ); 
            });
        }

        return (
            <table className="panel-awaiting-ads">
                <tr>
                    <th>Title</th><th>Funds</th><th>Type</th>
                </tr>
                {ads}
            </table>
        );
    }

}