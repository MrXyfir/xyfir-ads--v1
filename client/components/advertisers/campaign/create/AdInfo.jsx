import React from "react";

// Components
import Button from "components/forms/Button";

export default class AdInfo extends React.Component {

    constructor(props) {
        super(props);
    }

    _step(action) {
        // Validate data common to all ad types
        if (
            !this.refs.link.value.match(/^https?:\/\//)
            || this.refs.link.value.length > 100
        ) {
            swal(
                "Error",
                "Invalid link provided: must start with http/https"
                + " and cannot be more than 100 characters",
                "error"
            ); return;
        }
        if (!this.refs.title.value.match(/^[\w\d .:;'"!@#$%&()\-+=,/]{3,25}$/)) {
            swal("Error", "Invalid title characters or length", "error");
            return;
        }
        if (
            !this.refs.description.value
                .match(/^[\w\d .:;'"!@#$%&()\-+=,/]{5,150}$/)
        ) {
            swal("Error", "Invalid description characters or length", "error");
            return;
        }
        
        // Validate data for specific ad types
        if (window.campaignData.type == 2) {
            if (this.refs.title.value.length > 15) {
                swal(
                    "Error",
                    "Short text ad titles cannot be longer than 15 characters",
                    "error"
                ); return;
            }
            if (this.refs.description.value.length > 40) {
                swal(
                    "Error",
                    "Short text ad descriptions cannot be longer than 40 characters",
                    "error"
                ); return;
            }
        }

        // Save to window.campaignData
        window.campaignData.link = this.refs.link.value,
        window.campaignData.title = this.refs.title.value,
        window.campaignData.description = this.refs.description.value;

        this.props.step(action);
    }

    render() {
        return (
            <div className="form-step ad-info">
                <section className="form-step-head">
                    <h2>Advertisement</h2>
                    <p>
                        Build your advertisement and provide the content you want to be displayed to viewers.
                    </p>
                </section>

                <section className="form-step-body">
                    <label>Link</label>
                    <small>
                        Where users will be taken to when the click on your advertisement.
                    </small>
                    <input
                        type="text"
                        ref="link"
                        defaultValue={window.campaignData.link}
                    />

                    <label>Title</label>
                    <small>The main title for your advertisement that users will see.</small>
                    <input
                        type="text"
                        ref="title"
                        defaultValue={window.campaignData.title}
                    />

                    <label>Description</label>
                    <small>
                        Describe your advertisement in a short, descriptive way to engage users.
                    </small>
                    <textarea
                        ref="description"
                        defaultValue={window.campaignData.description}
                    />
                </section>

                <section className="form-step-nav">
                    <Button type="secondary" onClick={() => this._step('-')}>
                        Back
                    </Button>
                    <Button onClick={() => this._step('+')}>
                        Next
                    </Button>
                </section>
            </div>
        );
    }

}