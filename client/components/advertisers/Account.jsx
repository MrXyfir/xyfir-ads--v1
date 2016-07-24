var Button = require("../forms/Button");
var Alert = require("../forms/Alert");

module.exports = React.createClass({

    getInitialState: function () {
        return {
            funds: 0, payments: [], purchaseActive: false,
            error: false, message: "", addFunds: false
        };
    },

    componentWillMount: function () {
        // Get account info
        ajax({
            url: API + "advertisers/account",
            method: "GET",
            dataType: "json",
            success: function (response) {
                this.setState(response);
            }.bind(this)
        });

        // Add Stripe.js to page
        var stripe = document.createElement("script");
        stripe.setAttribute("src", "https://js.stripe.com/v2/");
        document.head.appendChild(stripe);
    },

    addFunds: function () {
        if (!this.state.addFunds) {
            this.setState({ addFunds: true });
            return;
        }

        this.setState({ purchaseActive: true });

        Stripe.setPublishableKey("pk_test_jOclCjtuiGoSuz36gJ8BxWqk");

        if (+$("#amount").value < 10) {
            this.setState({ purchaseActive: false, error: true, message: "Amount cannot be less than $10.00" });
            return;
        }

        Stripe.card.createToken(this.refs.stripeForm, function (status, response) {
            // Error when trying to create charge token
            if (response.error) {
                this.setState({
                    error: true, purchaseActive: false, message: response.error.message
                });
                return;
            }

            // Send token + amount to XAd API to finish purchase
            ajax({
                url: API + "advertisers/account/funds",
                method: "POST",
                dataType: "json",
                data: {
                    amount: $("#amount").value,
                    stripeToken: response.id
                },
                success: function (response) {
                    response.purchaseActive = false;
                    response.addFunds = false;
                    console.log(response);
                    this.setState(response);
                }.bind(this)
            });
        }.bind(this));
    },

    render: function () {
        var addFunds, alert, payments = [];

        /* Add Funds Button/Form */
        if (this.state.addFunds) {
            // Payment form
            addFunds = (
              <form ref="stripeForm" className="advertisers-account-addfunds">
					<label>Card Number</label>
					<input type="text" data-stripe="number"/>
	
					<label>CVC</label>
					<input type="text" data-stripe="cvc" />
				
					<label>Expiration (MM/YYYY)</label>
                    <div>
                        <input type="text" data-stripe="exp-month" placeholder="07" className="card-exp-month" />
					    <input type="text" data-stripe="exp-year" placeholder="2020" className="card-exp-year" />
                    </div>
					
					<label>Amount</label>
                    <input type="number" placeholder="10.00" id="amount" />
					
					<Button onClick={this.addFunds} disabled={this.state.purchaseActive}>Complete Purchase</Button>
				</form>  
            );
        }
        else {
            addFunds = <Button onClick={this.addFunds}>Add Funds</Button>;
        }

        /* Error/Success Alert */
        if (this.state.message) {
            if (this.state.error) var type = "error", title = "Error!";
            else var type = "info", title = "Success!";

            alert = <Alert type={type} title={title}>{this.state.message}</Alert>
        }

        /* Previous Payments Array */
        if (!!this.state.payments.length) {
            this.state.payments.forEach(function (payment) {
                payments.push(
                    <tr>
                        <td>{payment.id}</td><td>{'$' + payment.amount}</td><td>{payment.tstamp}</td>
                    </tr>
                );
            });
        }

        return (
          <div className="advertisers-account">
              <h2>{"$" + this.state.funds} in Account</h2>

              {alert}
              {addFunds}
              
              <div className="advertisers-account-payments">
                  <h3>Recent Payments</h3>
                  <table>
                      <tr>
                          <th>ID</th><th>Amount</th><th>Date</th>
                      </tr>
                      
                      {payments}
                  </table>
              </div>
          </div>  
        );
    }

});