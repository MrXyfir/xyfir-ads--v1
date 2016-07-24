module.exports = React.createClass({

    getInitialState: function() {
        return {
            campaigns: [
                /* { id: number, name: string, site: string, type: number } */
            ]
        };
    },

    componentWillMount: function () {
        ajax({
            url: API + "publishers/campaigns",
            dataType: "json",
            success: function(res) {
                console.log(res);
                this.setState(res);
            }.bind(this)
        });
    },

    render: function () {
        var campaigns = [];

        if (!this.state.campaigns.length) {
            return(
                <div className="publishers-campaigns-none">
                    <h3>You do not have any active campaigns!</h3>
                </div>
            );
        }
        else {
            campaigns = this.state.campaigns.map(function(c) {
                c.link = "campaign/" + c.id;
                
                return(
                    <tr className="campaign">
                        <td className="name">
                            <a onClick={this.props.updateRoute.bind(this,c.link)}>{c.name}</a>
                        </td>
                        <td className="site">{c.site}</td>
                        <td className="type">{c.type == 1 ? "Site" : "App"}</td>
                    </tr>
                ); 
            }.bind(this));
        }

        return (
            <table className="publishers-campaigns">
                {campaigns}
            </table>
        );
    }

});