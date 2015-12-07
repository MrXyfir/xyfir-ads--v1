var Button = require("../../forms/Button");

module.exports = React.createClass({

    getInitialState: function() {
        return { loading: true };
    },

    componentWillMount: function() {
        ajax({
            url: API + "panel/awaiting/ads/" + this.props.id,
            dataType: "json",
            success: function(res) {
                res.loading = false;
                this.setState(res);
            }.bind(this)
        });
    },

    approve: function() {
        ajax({
            url: API + "panel/awaiting/ads/" + this.props.id,
            method: "POST",
            dataType: "json",
            success: function(res) {
                if (res.error)
                    alert("An error occured. Try again!");
                else
                    alert("Approved");
            }
        });
    },

    deny: function() {
        ajax({
            url: API + "panel/awaiting/ads/" + this.props.id,
            data: {
                reason: this.refs.denyReason.value
            },
            method: "DELETE",
            dataType: "json",
            success: function(res) {
                if (res.error)
                    alert("An error occured. Try again!");
                else
                    alert("Denied");
            }
        });
    },

    render: function() {
        if (this.state.loading)
            return <div></div>;

        var ad = [];
        for (var prop in this.state) {
            if (this.state.hasOwnProperty(prop) && prop != "loading") {
                ad.push([prop, this.state[prop]]);
            }
        }

        return (
            <div className="panel-awaiting-ad">
                <table>{
                    ad.map(function(c) {
                        return(<tr><th>{c[0]}</th><td>{c[1]}</td></tr>);
                    })
                }</table>

                <div className="action">
                    <Button onClick={this.approve}>Approve Advert</Button>

                    <h3>~ or ~</h3>

                    <Button onClick={this.deny}>Deny Advert</Button>

                    <textarea ref="denyReason"></textarea>
                </div>
            </div>  
        );
    }

});