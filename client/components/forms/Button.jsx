import React from "react";

export default class Button extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            type: this.props.type || "primary",
            disabled: this.props.disabled || false
        };
    }

    render() {
        return (
            <button
                className={"btn-" + this.props.type}
                onClick={this.props.onClick}
                disabled={this.state.disabled}
            >{
                this.props.children
            }</button>
        );
    }

}