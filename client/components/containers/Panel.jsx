import React from "react";

// Components
import Awaiting from "components/panel/awaiting/Index";

export default class Panel extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        switch(this.props.hash[2]) {
            case "awaiting":
                return <Awaiting hash={this.props.hash} />;
        }
    }

}