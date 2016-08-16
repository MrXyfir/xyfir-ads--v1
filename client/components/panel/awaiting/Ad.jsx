import React from "react";

// Components
import Button from "components/forms/Button";

// Modules
import request from "lib/request";

export default class Ad extends React.Component {

    constructor(props) {
        super(props);

        this.state = { loading: true };
    }

    componentWillMount() {
        request({
            url: "api/panel/awaiting/ads/" + this.props.id,
            success: (res) => {
                res.loading = false;
                this.setState(res);
            }
        });
    }

    onApprove() {
        request({
            url: "api/panel/awaiting/ads/" + this.props.id,
            method: "POST",
            success: (res) => {
                if (res.error)
                    alert("An error occured. Try again!");
                else
                    alert("Approved");
            }
        });
    }

    onDeny() {
        request({
            url: "api/panel/awaiting/ads/" + this.props.id,
            data: {
                reason: this.refs.denyReason.value
            },
            method: "DELETE", success: (res) => {
                if (res.error)
                    alert("An error occured. Try again!");
                else
                    alert("Denied");
            }
        });
    }

    render() {
        if (this.state.loading) return <div />;

        let ad = [];
        for (let prop in this.state) {
            if (this.state.hasOwnProperty(prop) && prop != "loading") {
                ad.push([prop, this.state[prop]]);
            }
        }

        return (
            <div className="panel-awaiting-ad">
                <table>{
                    ad.map(c => {
                        return(<tr><th>{c[0]}</th><td>{c[1]}</td></tr>);
                    })
                }</table>

                <div className="action">
                    <Button onClick={() => this.onApprove()}>Approve Advert</Button>

                    <h3>~ or ~</h3>

                    <Button onClick={() => this.onDeny()}>Deny Advert</Button>

                    <textarea ref="denyReason" />
                </div>
            </div>  
        );
    }

}