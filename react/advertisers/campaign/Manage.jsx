var View = require("./View");
var Edit = require("./Edit");

module.exports = React.createClass({

    render: function () {
        switch (this.props.action) {
            case "view":
                return <View id={this.props.id} updateRoute={this.props.updateRoute} />;
            case "edit":
                return <Edit id={this.props.id} updateRoute={this.props.updateRoute} />;
        }
    }

});