import React from "react";

// Modules
import request from "lib/request";

export default class Publishers extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            publishers: [
                /* { user_id: number, name: string } */
            ]
        };
    }

    componentWillMount() {
        request({
            url: "api/panel/awaiting/publishers",
            success: (res) => this.setState(res)
        });
    }

    render() {
        let publishers = [];

        if (!this.state.publishers.length) {
            return(
                <h3>There are no publishers pending approval at this time.</h3>
            );
        }
        else {
            publishers = this.state.publishers.map(pub => {
                pub.link = "#/panel/awaiting/publisher/" + pub.user_id;
                
                return(
                    <tr>
                        <td><a href={pub.link}>{pub.name}</a></td>
                    </tr>
                ); 
            });
        }

        return (
            <table className="panel-awaiting-publishers">
                <tr>
                    <th>Publisher</th>
                </tr>
                {publishers}
            </table>
        );
    }

}