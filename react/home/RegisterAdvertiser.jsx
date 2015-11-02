var Button = require('../forms/Button');

module.exports = React.createClass({

    register: function() {
        ajax({
            url: 'api/advertisers/account/register',
            method: 'POST',
            dataType: 'json',
            data: {

            },
            success: function(response) {
                if (response.error)
                    alert(response.message);
                else
                    location.href = 'advertisers';
            }
        });
    },

    render: function() {
        return (
            <div className="home-register-advertiser">
                <h3>Become an Advertiser</h3>
                <Button type="primary" onClick={this.register}>Register</Button>
            </div>
        );
    }

});
