import React from "react";

// Components
import Button from "components/forms/Button";

// Modules
import request from "lib/request";

// Constants
import { STRIPE_KEY } from "constants/config";

export default class AdvertiserAccount extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            funds: 0, purchaseActive: false
        };
    }

    componentWillMount() {
        // Get account info
        request({
            url: "api/advertisers/account",
            success: (response) => this.setState(response)
        });

        // Add Stripe.js to page
        let stripe = document.createElement("script");
        stripe.setAttribute("src", "https://js.stripe.com/v2/");
        document.head.appendChild(stripe);
    }

    onAddFunds() {
        this.setState({ purchaseActive: true });

        Stripe.setPublishableKey(STRIPE_KEY);

        if (+this.refs.amount.value < 10) {
            swal("Error", "Amount cannot be less than $10.00", "error");
            this.setState({ purchaseActive: false });
            return;
        }

        Stripe.card.createToken(this.refs.stripeForm, (status, response) => {
            // Error when trying to create charge token
            if (response.error) {
                swal("Error", response.error.message, "error");
                this.setState({ purchaseActive: false });
                return;
            }

            // Send token + amount to XAd API to finish purchase
            request({
                url: "api/advertisers/account/funds",
                method: "POST", data: {
                    amount: this.refs.amount.value,
                    stripeToken: response.id
                }, success: (response) => {
                    this.setState({ purchaseActive: false });
                    
                    if (response.error)
                        swal("Error", response.message, "error");
                    else
                        swal("Success", response.message, "success");
                }
            });
        });
    }

    render() {
        return (
            <div className="advertisers-account">
                <section className="info">
                    <dl>
                        <dt>Account Balance</dt>
                        <dd>{"$" + this.state.funds}</dd>
                    </dl>
                </section>

                <section className="add-funds">
                    <h3>Add Funds to Account</h3>
                    <form ref="stripeForm" className="stripe-form">
                        <label>Card Number</label>
                        <input type="text" data-stripe="number"/>

                        <label>CVC</label>
                        <input type="text" data-stripe="cvc" />

                        <label>Expiration (MM/YYYY)</label>
                        <div>
                            <input
                                type="text"
                                data-stripe="exp-month"
                                placeholder="07"
                                className="card-exp-month"
                            />
                            <input
                                type="text"
                                data-stripe="exp-year"
                                placeholder="2020"
                                className="card-exp-year"
                            />
                        </div>
                        
                        <label>Amount</label>
                        <input type="number" placeholder="10.00" ref="amount" />
                        
                        <Button
                            onClick={() => this.onAddFunds()}
                            disabled={this.state.purchaseActive}
                        >
                            Complete Purchase
                        </Button>
                    </form>
                </section>
            </div>  
        );
    }

}