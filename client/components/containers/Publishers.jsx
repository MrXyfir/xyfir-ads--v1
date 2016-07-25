// Components
import Campaigns from "components/publishers/Campaigns";
import Account from "components/publishers/Account";

export default class Publishers extends React.Component {

    constructor(props) {
        super(props);
        this.state = { view: "account" };
    }

    routeUpdated() {
        // Parse url
        var a = document.createElement('a');
        a.href = location.href;

        // Set state.view based on route
        switch (a.pathname) {
            case "/publishers":
                this.setState({ view: "account" }); break;
            case "/publishers/account":
                this.setState({ view: "account" }); break;
            case "/publishers/campaigns":
                this.setState({ view: "campaign-list" }); break;
            case "/publishers/campaign/create":
                this.setState({ view: "campaign-create" }); break;
            default:
                // User is viewing/editing/etc a single campaign
                if (a.pathname.indexOf("/publishers/campaign/") == 0)
                    this.setState({ view: "campaign-manage" });
        }
    }

    render() {
        let view;
        switch (this.props.hash[2]) {
            case "campaigns":
            case "campaign":
                view = <Campaigns {...this.props} />; break;
            default:
                view = <Account {...this.props} />;
        }

        return (
            <div className="publishers">
                <nav className="publishers-nav">
                    <a href="#/publishers/campaign/create" className="link-lg">Create Campaign</a>
                    <a href="#/publishers/campaigns" className="link-lg">View Campaigns</a>
                    <a href="#/publishers/account" className="link-lg">My Account</a>
                </nav>

                {view}
            </div>
        );
    }

}