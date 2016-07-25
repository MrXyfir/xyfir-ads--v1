import React from "react";

// Components
import Button from "components/forms/Button";

// Modules
import request from "lib/request";

export default class Publisher extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: true, user_id: 0, name: "", application: "", email: ""
        };

        this.onApprove = this.onApprove.bind(this);
        this.onDeny = this.onDeny.bind(this);
    }

    componentWillMount() {
        request({
            url: "api/panel/awaiting/publishers/" + this.props.id,
            success: (res) => {
                res.loading = false;
                this.setState(res);
            }
        });
    }

    onApprove() {
        request({
            url: "api/panel/awaiting/publishers/" + this.props.id,
            data: { email: this.state.email },
            method: "POST", success: (res) => {
                if (res.error)
                    alert("An error occured. Try again!");
                else
                    alert("Approved");
            }
        });
    }

    onDeny() {
        request({
            url: "api/panel/awaiting/publishers/" + this.props.id,
            data: {
                reason: this.refs.denyReason.value,
                email: this.state.email
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

        let pub = [];
        for (let prop in this.state) {
            if (this.state.hasOwnProperty(prop) && prop != "loading") {
                pub.push([prop, this.state[prop]]);
            }
        }

        return (
            <div className="panel-awaiting-publisher">
                <table>{
                    pub.map(c => {
                    return(
                        <tr><th>{c[0]}</th><td>{c[1]}</td></tr>);
                    })
                }</table>

                <div className="action">
                    <Button onClick={this.onApprove}>Approve Publisher</Button>

                    <h3>~ or ~</h3>

                    <Button onClick={this.onDeny}>Deny Publisher</Button>

                    <textarea ref="denyReason"></textarea>
                </div>
            </div>  
        );
}

}