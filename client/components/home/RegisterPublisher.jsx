import React from "react";

// Components
import Button from "components/forms/Button";

// Modules
import request from "lib/request";

export default class RegisterPublisher extends React.Component {

    constructor(props) {
        super(props);
    }

    onRegister() {
        const data = {
            name: this.refs.name.value,
            email: this.refs.email.value,
            application: this.refs.info.value
        };

        if (data.name.length > 25)
            alert("Name cannot be over 25 characters.");
        else if (data.email.length > 50)
            alert("Email cannot be over 50 characters.");
        else if (data.application.length > 1500)
            alert("Application cannot be over 1,500 characters.");
        else {
            request({
                url: "api/publishers/account/register",
                method: "POST", data, success: (response) => {
                    alert(response.message);
                }
            });
        }
    }

    render() {
        return (
            <div className="home-register-publisher">
                <h3>Publisher Application</h3>
                <p>
                    Interested in utilizing Xyfir Ads on your site or app? Not all publishers who apply will be accepted, but it can't hurt to try. Once you apply a staff member will manually approve or deny your application. If you're denied, you can apply again every 3 months.
                </p>
                <p>
	                <b>Information we're looking for in your application:</b>
	                <br />
                    a brief description of and links to sites, apps, or other service that you plan to integrate Xyfir Ads with
	                <br />
                    current and estimated unique and total views, downloads, etc
	                <br />
                    categories your service(s) target
	                <br />
                    any information you believe will help improve your application
                </p>

                <input type="text" placeholder="Name or Business" ref="name" />
                <input type="text" placeholder="Contanct Email" ref="email" />
                <textarea ref="info" defaultValue="Publisher application" />

                <Button type="primary" onClick={() => this.onRegister()}>Register</Button>
            </div>
        );
    }

}