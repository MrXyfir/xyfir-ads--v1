import { render } from 'react-dom';
import request from 'superagent';
import React from 'react';

// Components
import Advertisers from 'components/containers/Advertisers';
import Publishers from 'components/containers/Publishers';
import Panel from 'components/containers/Panel';
import Home from 'components/containers/Home';

// Modules
import parseQuery from 'lib/parse-hash-query';

// react-md
import Subheader from 'react-md/lib/Subheaders';
import ListItem from 'react-md/lib/Lists/ListItem';
import Snackbar from 'react-md/lib/Snackbars';
import Toolbar from 'react-md/lib/Toolbars';
import Divider from 'react-md/lib/Dividers';
import Drawer from 'react-md/lib/Drawers';
import Button from 'react-md/lib/Buttons/Button';

// Constants
import { XACC } from 'constants/config';

class App extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {
      hash: location.hash.split('?')[0].split('/'), query: parseQuery(),
      drawer: false, toasts: [], loading: true
    };

    window.onhashchange = () =>
      this.setState({
        hash: location.hash.split('?')[0].split('/'),
        query: parseQuery()
      });
    
    this._alert = this._alert.bind(this);
  }

  /**
   * Handle login / account initialization.
   */
  componentWillMount() {
    const q = this.state.query;

    // Attempt to login using XID/AUTH
    if (q.xid && q.auth) {
      request
        .post('api/account/login')
        .send(q)
        .end((err, res) => {
          if (err || res.body.error) {
            location.replace(XACC + 'login/service/11');
          }
          else {
            // Clear query string
            this.setState({ loading: false });
            location.hash = location.hash.split('?')[0];
          }
        });
    }
    else {
      request
        .get('api/account/status')
        .end((err, res) => {
          // User must be logged in if anywhere but home page
          if (err || (location.hash.length > 2 && !res.body.loggedIn))
            location.replace(XACC + 'login/service/11');
          else
            this.setState({ loading: false });
        });
    }
  }

  /**
   * Remove first element from toasts array.
   */
  onDismissAlert() {
    const [, ...toasts] = this.state.toasts;
    this.setState({ toasts });
  }

  /**
   * Creates a 'toast' for react-md Snackbar component.
   * @param {string} message - The text content of the toast.
   */
  _alert(message) {
    this.setState({
      toasts: this.state.toasts.concat([{ text: message }])
    });
  }
  
  render() {
    if (this.state.loading) return <div />;

    const view = (() => {
      const props = {
        hash: this.state.hash, query: this.state.query, alert: this._alert
      };

      switch (this.state.hash[1]) {
        case 'advertisers':
          return <Advertisers {...props} />;
        case 'publishers':
          return <Publishers {...props} />;
        case 'panel':
          return <Panel {...props} />;
        default:
          return <Home {...props} />;
      }
    })();

    return (
      <div className='xyfir-ads'>
        <Toolbar
          colored fixed
          actions={[
            <Button
              icon
              key='home'
              onClick={() => location.hash = '#/'}
            >home</Button>
          ]}
          title='Xyfir Ads'
          nav={
            <Button
              icon
              onClick={() => this.setState({ drawer: true })}
            >menu</Button>
          }
        />

        <Drawer
          onVisibilityToggle={
            v => this.setState({ drawer: v })
          }
          autoclose={true}
          navItems={[
            <Subheader primary primaryText='Advertisers' />,
            <a href='#/advertisers/account'>
              <ListItem primaryText='Account' />
            </a>,
            <a href='#/advertisers/campaigns'>
              <ListItem primaryText='View Campaigns' />
            </a>,
            <a href='#/advertisers/campaign/create'>
              <ListItem primaryText='Create Campaign' />
            </a>,
            
            <Divider />,

            <Subheader primary primaryText='Publishers' />,
            <a href='#/publishers/account'>
              <ListItem primaryText='Account' />
            </a>,
            <a href='#/publishers/campaigns'>
              <ListItem primaryText='View Campaigns' />
            </a>,
            <a href='#/publishers/campaign/create'>
              <ListItem primaryText='Create Campaign' />
            </a>
          ]}
          visible={this.state.drawer}
          header={
            <Toolbar
              colored
              nav={
                <Button
                  icon
                  onClick={() => this.setState({ drawer: false })}
                >arrow_back</Button>
              }
            />
          }
          type={Drawer.DrawerTypes.TEMPORARY}
        />

        <div className='main md-toolbar-relative'>{view}</div>

        <Snackbar
          toasts={this.state.toasts}
          onDismiss={() => this.onDismissAlert()}
        />
      </div>
    );
  }
  
}

render(<App />, window.content);