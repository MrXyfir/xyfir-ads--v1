module.exports = React.createClass({

    getInitialState: function() {
        return { error: false, message: '' };
    },

    next: function () {
        this.step('+');
    },

    back: function() {
        this.step('-');
    },

    step: function(action) {
        this.props.step(action);
    },

    render: function () {
        var alert;
        if (this.state.error) alert = <Alert type="error" title="Error!">{this.state.message}</Alert>;

        return (
            <div className="form-step">
                <div className="form-step-head">

                </div>

                <div className="form-step-body">
                    {alert}
                </div>

                <div className="form-step-nav">
                    <Button type="secondary" onClick={this.back}>Back</Button>
                    <Button onClick={this.next}>Next</Button>
                </div>
            </div>
        );
    }

});