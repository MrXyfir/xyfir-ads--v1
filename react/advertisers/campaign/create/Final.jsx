module.exports = React.createClass({

    getInitialData: function() {
        return {
            loading: true, error: false, message: ""
        };
    },

    // Build data object from campaignData for api
    // Send data to api and process response
    componentWillMount: function() {

    },

    back: function() {
        this.props.step('-');
    },

    render: function () {
        if (!this.state.loading) {
            var back;
            if (this.state.error) {
                var type = "error", title = "Error!";
                back = <Button onClick={this.back}>Back</Button>
            }
            else {
                var type = "success", title = "Success!";
            }

            return (
                <div>
                    <Alert type={type} title={title}>{this.state.message}</Alert>

                    {back}
                </div>
            );
        }
        else {
            return (
                <h2>Creating campaign...</h2> 
            );
        }
    }

});