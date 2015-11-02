module.exports = React.createClass({

    render: function() {
        return (
            <button className={"btn-" + this.props.type} onClick={this.props.onClick}>
                {this.props.children}
            </button>
        );
    }

});