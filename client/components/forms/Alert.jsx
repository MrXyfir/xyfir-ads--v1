import React from "react";

export default class Alert extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = { type: this.props.type || "info" };
    }
	
    render() {
        return (
			<div className={"alert alert-" + this.state.type}>
				<h3>{this.props.title}</h3>
				<p>{this.props.children}</p>
			</div>
		);
    }

}