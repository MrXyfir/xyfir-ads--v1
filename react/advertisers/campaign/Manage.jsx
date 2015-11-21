var CampaignView = require("./View");
var CampaignEdit = require("./Edit");

module.exports = React.createClass({

    getInitialState: function () {
        return { editing: false }
    },

    render: function () {
        return <div>{this.state.editing ? CampaignEdit : CampaignView}</div>;
    }

});