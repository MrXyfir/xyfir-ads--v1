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
        ajax({
            url: URL + "api/advertisers/account",
            method: "GET",
            dataType: "JSON",
            success: function (response) {
                this.setState(response);
            }.bind(this)
        });
    },

    addFunds: function () {
        this.setState({ purchaseActive: true });

        if (+this.refs.amount.value < 10) {
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
                url: URL + "api/advertisers/account/funds",
                method: "POST",
                dataType: "JSON",
                data: {
                    amount: this.refs.amount.value,
                    stripeToken: response.id
                },
                success: function (response) {
                    response.purchaseActive = false;
                    this.setState(response);
                }.bind(this)
            });
        });
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
					<input type="text" data-stripe="exp-month" placeholder="07"/>
					<span> / </span>
					<input type="text" data-stripe="exp-year" placeholder="2020" />
					
					<label>Amount</label>
                    <input type="number" placeholder="10.00" ref="amount" />
					
					<Button onClick={this.addFunds} disabled={this.state.purchaseActive}>Complete Purchase</Button>
				</form>  
            );
        }
        else {
            addFunds = <Button onClick={this.addFunds}>Add Funds</Button>;
        }

        /* Error/Success Alert */
        if (this.state.message) {
            if (this.state.error) var type = "danger", title = "Error!";
            else var type = "info", title = "Success!";

            alert = <Alert type={type} title={title}>{this.state.message}</Alert>
        }

        /* Previous Payments Array */
        this.state.payments.forEach(function (payment) {
            payments.push(
                <h4>#{payment.id} | {'$' + payment.amount} added on {payment.tstamp}</h4>
            );
        });

        return (
          <div className="advertisers-account">
              <h2>{"$" + this.state.funds} in Account</h2>

              {alert}
              {addFunds}
              
              <div className="advertisers-account-payments">
                  {payments}
              </div>
          </div>  
        );
    }

});