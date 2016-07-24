module.exports = React.createClass({

    getInitialState: function() {
        return {
            ads: [
                /* { id: number, ad_title: string, ad_type: number, funds: number } */
            ]
        };
    },

    componentWillMount: function () {
        ajax({
            url: API + "panel/awaiting/ads",
            dataType: "json",
            success: function(res) {
                this.setState(res);
            }.bind(this)
        });
    },

    render: function () {
        var ads = [];

        if (!this.state.ads.length) {
            return(
                <h3>There are no ads pending approval at this time.</h3>
            );
        }
        else {
            ads = this.state.ads.map(function(ad) {
                ad.link = "ad/" + ad.id;
                
                return(
                    <tr>
                        <td><a onClick={this.props.updateRoute.bind(this,ad.link)}>{ad.ad_title}</a></td>
                        <td>{'$' + ad.funds}</td>
                        <td>{["", "Text", "Short", "Image", "Video"][ad.ad_type]}</td>
                    </tr>
                ); 
            }.bind(this));
        }

        return (
            <table className="panel-awaiting-ads">
                <tr>
                    <th>Title</th><th>Funds</th><th>Type</th>
                </tr>
                {ads}
            </table>
        );
    }

});