import React from "react";

// Components
import Button from "components/forms/Button";
import Alert from "components/forms/Alert";

// Modules
import request from "lib/request";

export default class PublisherAccount extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            loading: true, paymentMethod: 1, payment: {
                method: 0, info: ""
            },
            earnings: {
                confirmed: 0, pending: 0
            },
            payments: [
                { id: "", amount: 0, tstamp: "" }
            ]
        };
    }

    componentWillMount() {
        // Get account info
        request({
            url: "api/publishers/account",
            success: (response) => {
                if (response.payment.info != "") {
                    response.payment.info = JSON.parse(response.payment.info);
                    response.paymentMethod = response.payment.method;
                }
                
                response.loading = false;

                this.setState(response);
            }
        });
    }

    onUpdatePaymentInfo(e) {
        e.preventDefault();
        
        request({
            url: "api/publishers/account",
            data: {
                paymentMethod: +this.refs.paymentMethod.value,
                paymentInfo: JSON.stringify({
                    name: this.refs.name.value,
                    address: this.refs.address.value,
                    address2: this.refs.address2.value,
                    city: this.refs.city.value,
                    state: this.refs.state.value,
                    zip: +this.refs.zip.value,
                    phone: this.refs.phone.value,
                })
            },
            method: "PUT", success: (res) => {
                if (res.error)
                    swal("Error", res.message, "error");
                else
                    swal("Success", res.message, "success");
            }
        });
    }

    onUpdatePaymentInfoForm() {
        this.setState({ paymentMethod: +this.refs.paymentMethod.value });
    }

    render() {
        if (this.state.loading) return <div />;

        let s = this.state;

        return (
            <div className="publishers-account">
                <section className="earnings">
                    <h3>Earnings</h3>
                    
                    <dl>
                        <dt>Confirmed</dt>
                        <dd>{'$' + this.state.earnings.confirmed}</dd>
                        
                        <dt>Pending</dt>
                        <dd>{'$' + this.state.earnings.pending}</dd>
                    </dl>
                </section>

                <section className="payment-information">
                    <h3>Payment Information</h3>
                    <p>Payments are sent out on the first of every month.</p>
                    
                    <label>Payment Method</label>
                    <select
                        ref="paymentMethod"
                        onChange={() => this.onUpdatePaymentInfoForm()}
                        defaultValue={this.state.paymentMethod}
                    >
                        <option value="1">Check</option>
                        <option value="2" disabled>Bank Wire</option>
                    </select>
                    
                    {this.state.paymentMethod == 1 ? (
                        <form
                            className="check"
                            onSubmit={(e) => this.onUpdatePaymentInfo(e)}
                        >
                            <span className="note">
                                We can currently only send checks to addresses within the United States.
                            </span>

                            <label>Full Name</label>
                            <input
                                defaultValue={this.state.payment.info.name}
                                type="text"
                                ref="name"
                            />

                            <label>Address</label>
                            <input
                                defaultValue={this.state.payment.info.address}
                                type="text"
                                ref="address"
                            />
                            <input
                                defaultValue={this.state.payment.info.address2}
                                type="text"
                                ref="address2"
                            />

                            <label>City</label>
                            <input
                                defaultValue={this.state.payment.info.city}
                                type="text"
                                ref="city"
                            />

                            <label>State</label>
                            <input
                                defaultValue={this.state.payment.info.state}
                                type="text"
                                ref="state"
                            />

                            <label>ZIP Code</label>
                            <input
                                defaultValue={this.state.payment.info.zip}
                                type="number"
                                ref="zip"
                            />

                            <label>Phone #</label>
                            <input
                                defaultValue={this.state.payment.info.phone}
                                type="tel"
                                ref="phone"
                            />

                            <Button>Set Payment Information</Button>
                        </form>  
                    ) : (
                        <div />
                    )}
                </section>
            </div>
        );
    }

}