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
                    swal("An error occured. Try again!");
                else
                    swal("Approved");
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
                    swal("An error occured. Try again!");
                else
                    swal("Denied");
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
                <dl>{ad.map(c => {
                    return (
                        <div>
                            <dt>{c[0]}</dt><dd>{c[1]}</dd>
                        </div>
                    );
                })}</dl>

                <div className="action">
                    <Button onClick={() => this.onApprove()}>
                        Approve
                    </Button>

                    <Button type="red" onClick={() => this.onDeny()}>
                        Deny
                    </Button>

                    <label>Reason for Denial</label>
                    <textarea ref="denyReason" />
                </div>
            </div>  
        );
    }

}