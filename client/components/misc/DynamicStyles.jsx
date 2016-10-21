import React from "react";

export default class DynamicStyles extends React.Component {
	
    constructor(props) {
        super(props);
    }

    _generateStyles() {
        return `
            #content {
                margin-top: ${
                    document.querySelector("header nav").scrollHeight
                }px;
                margin-bottom: ${
                    document.querySelector("footer").scrollHeight
                }px;
            }
        `;
    }

	render() {
		return <style>{this._generateStyles()}</style>;
	}

}