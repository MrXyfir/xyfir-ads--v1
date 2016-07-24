var Button = require("../../forms/Button");

module.exports = React.createClass({

    getInitialState: function() {
        return {
            loading: true, user_id: 0, name: "", application: "", email: ""
        };
    },

    componentWillMount: function() {
        ajax({
            url: API + "panel/awaiting/publishers/" + this.props.id,
            dataType: "json",
            success: function(res) {
                res.loading = false;
                this.setState(res);
            }.bind(this)
        });
    },

    approve: function() {
        ajax({
            url: API + "panel/awaiting/publishers/" + this.props.id,
            data: {
                email: this.state.email
            },
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
            url: API + "panel/awaiting/publishers/" + this.props.id,
            data: {
                reason: this.refs.denyReason.value,
                email: this.state.email
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

        var pub = [];
        for (var prop in this.state) {
            if (this.state.hasOwnProperty(prop) && prop != "loading") {
                pub.push([prop, this.state[prop]]);
            }
        }

        return (
            <div className="panel-awaiting-publisher">
                <table>{
                    pub.map(function(c) {
                    return(
                        <tr><th>{c[0]}</th><td>{c[1]}</td></tr>);
                    })
                }</table>

                <div className="action">
                    <Button onClick={this.approve}>Approve Publisher</Button>

                    <h3>~ or ~</h3>

                    <Button onClick={this.deny}>Deny Publisher</Button>

                    <textarea ref="denyReason"></textarea>
                </div>
            </div>  
        );
}

});