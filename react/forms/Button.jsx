module.exports = React.createClass({

    getDefaultProps: function() {
        return {
            type: "primary", disabled: false
        };
    },

    render: function () {
        var classn = "btn-" + this.props.type;
        return (
            <button className={classn} onClick={this.props.onClick} disabled={this.props.disabled}>
                {this.props.children}
            </button>
        );
    }

});