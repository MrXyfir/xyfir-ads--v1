var Button = require("../forms/Button");
var Alert = require("../forms/Alert");

module.exports = React.createClass({

    getInitialState: function () {
        return {
            error: false, message: "", paymentMethod: 1,
            payment: {
                method: 0, info: ""
            },
            earnings: {
                confirmed: 0, pending: 0
            },
            payments: [
                { id: "", amount: 0, tstamp: "" }
            ]
        };
    },

    componentWillMount: function () {
        // Get account info
        ajax({
            url: API + "publishers/account",
            method: "GET",
            dataType: "json",
            success: function(response) {
                if (response.payment.info != "")
                    response.payment.info = JSON.parse(response.payment.info);
                this.setState(response);
            }.bind(this)
        });
    },

    updatePaymentInfo: function () {
        ajax({
            url: API + "publishers/account",
            data: {
                paymentMethod: +this.refs.paymentMethod.value,
                paymentInfo: JSON.stringify({
                    name: this.refs.name.value,
                    address: this.refs.address.value,
                    address2: this.refs.address2.value,
                    zip: +this.refs.zip.value,
                    country: this.refs.country.value
                })
            },
            method: "PUT",
            dataType: "json",
            success: function(res) {
                this.setState(res);
            }.bind(this)
        });
    },

    updatePaymentInfoForm: function() {
        this.setState({ paymentMethod: +this.refs.paymentMethod.value });
    },

    render: function () {
        var alert, payments = [], paymentInfoForm, s = this.state;

        /* Error/Success Alert */
        if (this.state.message) {
            if (this.state.error) var type = "error", title = "Error!";
            else var type = "info", title = "Success!";

            alert = <Alert type={type} title={title}>{this.state.message}</Alert>
        }

        /* Previous Payments Array */
        if (!!this.state.payments.length) {
            this.state.payments.forEach(function(payment) {
                if (payment.id != "") {
                    payments.push(
                        <tr>
                            <td>{payment.id}</td><td>{'$' + payment.amount}</td><td>{payment.tstamp}</td>
                        </tr>
                    );
                }
            });
        }

        /* Build Payment Info Form */
        if (this.state.paymentMethod == 1) {
            // For some reason React is completely incapable of accepting
            // variables for value of defaultValue={} attributes ONLY here
            paymentInfoForm = (
                <div className="payment-info-check">
                    <label>Full Name</label>
                    <input type="text" ref="name" />

                    <label>Address</label>
                    <input type="text" ref="address" />
                    <input type="text" ref="address2" />

                    <label>ZIP Code</label>
                    <input type="text" ref="zip" />

                    <label>Country</label>
                    <select ref="country">
                        <option value="US">United States</option>
                    </select>
                </div>  
            );
        }
        else {
            paymentInfoForm = (
                <div className="payment-info-bank">
                    <p>This payment method is currently not supported yet.</p>
                </div>  
            );
        }

        return (
            <div className="publishers-account">
                <h3>Earnings</h3>
                <span>
                    <b>{'$' + this.state.earnings.confirmed}</b> Confirmed
                    <b> | {'$' + this.state.earnings.pending}</b> Pending
                </span>
              
                <h3>Recent Payments</h3>
                <div className="publishers-account-payments">
                    <table>
                        <tr>
                            <th>ID</th><th>Amount</th><th>Date</th>
                        </tr>
                      
                        {payments}
                    </table>
                </div>

                {alert}

                <h3>Payment Information</h3>
                <select ref="paymentMethod" onChange={this.updatePaymentInfoForm}>
                    <option value="1">Check (US ONLY)</option>
                    <option value="2">Bank Wire</option>
                </select>
                {paymentInfoForm}

                <Button onClick={this.updatePaymentInfo}>Update</Button>
            </div>
        );
    }

});