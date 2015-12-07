module.exports = React.createClass({

    getInitialState: function() {
        return {
            publishers: [
                /* { user_id: number, name: string } */
            ]
        };
    },

    componentWillMount: function () {
        ajax({
            url: API + "panel/awaiting/publishers",
            dataType: "json",
            success: function(res) {
                this.setState(res);
            }.bind(this)
        });
    },

    render: function () {
        var publishers = [];

        if (!this.state.publishers.length) {
            return(
                <h3>There are no publishers pending approval at this time.</h3>
            );
        }
        else {
            publishers = this.state.publishers.map(function(pub) {
                pub.link = "publisher/" + pub.user_id;
                
                return(
                    <tr>
                        <td><a onClick={this.props.updateRoute.bind(this,pub.link)}>{pub.name}</a></td>
                    </tr>
                ); 
        }.bind(this));
    }

        return (
            <table className="panel-awaiting-publishers">
                <tr>
                    <th>Publisher</th>
                </tr>
                {publishers}
            </table>
        );
    }

});