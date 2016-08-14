import React from "react";

// Modules
import dimensions from "lib/../../lib/file/dimensions";

// Components
import Button from "components/forms/Button";
import Alert from "components/forms/Alert";

export default class AdInfo extends React.Component {

    constructor(props) {
        super(props);

        this.state = { error: false, message: '' };
    }

    onNext() {
        this._step('+');
    }

    onBack() {
        this._step('-');
    }

    // ** Debug / test upload
    onUpload(i) {
        const url = "api/upload?type=" + window.campaignData.type - 2 + "&size=" + i
            + "&url=" + this.refs["url-" + i].value;

        // Upload file
        request({
            url, method: "POST", success: (res) => {
                if (res.error) {
                    this.setState(res);
                }
                else {
                    let addMedia = true;

                    // Replace link if it already exists
                    window.campaignData.media.split(',').forEach(link => {
                        if (link.split(':')[0] == i) {
                            window.campaignData.media.replace(link, i + ':' + res.link);
                            addMedia = false;
                        }
                    });

                    // Add media link
                    if (addMedia) window.campaignData.media += ',' + i + ':' + res.link;
                }
            }
        });
    }

    _step(action) {
        // Validate data common to all ad types
        if (!this.refs.link.value.match(/^https?:\/\//) || this.refs.link.value.length > 100) {
            this.setState({
                error: true,
                message: "Invalid link provided: must start with http/https"
                    + " and cannot be more than 100 characters"
            }); return;
        }
        if (!this.refs.title.value.match(/^[\w\d .:;'"!@#$%&()\-+=,/]{3,25}$/)) {
            this.setState({
                error: true,
                message: "Invalid title characters or length"
            }); return;
        }
        if (!this.refs.description.value.match(/^[\w\d .:;'"!@#$%&()\-+=,/]{5,150}$/)) {
            this.setState({
                error: true,
                message: "Invalid description characters or length"
            }); return;
        }
        
        // Validate data for specific ad types
        if (window.campaignData.type == 2) {
            if (this.refs.title.value.length > 15) {
                this.setState({
                    error: true,
                    message: "Short text ad titles cannot be longer than 15 characters"
                }); return;
            }
            if (this.refs.description.value.length > 40) {
                this.setState({
                    error: true,
                    message: "Short text ad descriptions cannot be longer than 40 characters"
                }); return;
            }
        }
        else if (window.campaignData.type == 3 || window.campaignData.type == 4) {
            if (window.campaignData.media.split(',').length != 4) {
                this.setState({
                    error: true,
                    message: "Not all files have been uploaded"
                }); return;
            }
        }

        // Save to window.campaignData
        window.campaignData.title = this.refs.title.value, window.campaignData.link = this.refs.link.value;
        window.campaignData.description = this.refs.description.value;

        this.props.step(action);
    }

    render() {
        let alert, manageMedia;
        if (this.state.error) {
            alert = <Alert type="error" title="Error!">{this.state.message}</Alert>
        };

        // Allow user to upload images/videos for advertisement
        if (window.campaignData.type == 3 || window.campaignData.type == 4) {
            let rows = [], type = window.campaignData.type == 3 ? "image" : "video";
            
            for (let i = 0; i < 4; i++) {
                rows.push(
                    <tr>
                        <td>{dimensions[type][i].width + 'x' + dimensions[type][i].height}</td>
                        <td>{<input type="text" ref={"url-" + i} />}</td>
                        <td>{window.campaignData.type == 3 ? "Image" : "Video"}</td>
                        <td><a onClick={() => this.onUpload(i)}>Upload</a></td>
                    </tr>
                );
            }

            // ** Add link for info about uploading
            manageMedia = (
                <div className="manage-media">
                    <h3>Upload {window.campaignData.type == 3 ? "Images" : "Videos"} for Advertisement</h3>
                    <p>Files can only be uploaded via URL. Click <a href="https://xyfir.com/#/documentation/xyfir-ads/advertisers">here</a> for more information regarding uploading.</p>
                    <table>
                        <tr>
                            <th>Resolution</th><th>File URL</th><th>Type</th><th>Upload</th>
                        </tr>
                        {rows}
                    </table>
                </div>
            );
        }

        return (
            <div className="form-step">
                <div className="form-step-head">
                    <h2>Advertisement</h2>
                    <p>Build your advertisement and provide the content you want to be displayed to viewers.</p>
                </div>

                <div className="form-step-body">
                    {alert}

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

                    {manageMedia}
                </div>

                <div className="form-step-nav">
                    <Button type="secondary" onClick={() => this.onBack()}>
                        Back
                    </Button>
                    <Button onClick={() => this.onNext()}>Next</Button>
                </div>
            </div>
        );
    }

}