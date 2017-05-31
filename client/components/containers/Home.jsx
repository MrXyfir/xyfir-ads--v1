import request from 'superagent';
import React from 'react';

// react-md
import Button from 'react-md/lib/Buttons/Button';
import Paper from 'react-md/lib/Papers';

// Components
import RegisterAdvertiser from 'components/home/RegisterAdvertiser';
import RegisterPublisher from 'components/home/RegisterPublisher';

// Constants
import { XACC } from 'constants/config';

export default class Home extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      registerAdv: false, registerPub: false,
      account: {
        loggedIn: false, admin: false, advertiser: false,
        publisher: false
      }
    };
  }

  componentWillMount() {
    request
      .get('api/account/status')
      .end((err, res) =>
        !err && this.setState({ account: res.body })
      );
  }

  render() {
    return (
      <div className='home'>
        {!this.state.account.loggedIn ? (
          <Paper zDepth={1} className='login section'>
            <Button
              primary raised
              label='Login'
              onClick={() => location.href = XACC + 'login/service/11'}
            />
            <Button
              secondary raised
              label='Register'
              onClick={() => location.href = XACC + 'register/service/11'}
            />
          </Paper>
        ) : (
          <Paper zDepth={1} className='dashboards section'>
            <h2>Dashboards</h2>

            {this.state.account.advertiser ? (
              <Button
                raised
                label='Advertiser'
                onClick={() => location.hash = '#/advertisers'}
              />
            ) : null}
            
            {this.state.account.publisher ? (
              <Button
                raised
                label='Publisher'
                onClick={() => location.hash = '#/publishers'}
              />
            ) : null}
            
            {!this.state.account.publisher &&
            !this.state.account.advertiser ? (
              <span>
                You are not registered as a publisher or advertiser.
              </span>
            ) : null}
          </Paper>
        )}

        <Paper zDepth={1} className='advertisers section'>
          <h2>For Advertisers</h2>
          <p>
            Many web-users today are tired of the current state of online advertising. They have to worry about ads eating into their bandwidth caps, slowing down their browser, distracting them from the content they want to see, or even distributing malware. Users are blocking ads more than ever before and this hurts publishers and advertisers alike. These problems are all solvable with native ads.
          </p>

          <h3>What are native ads?</h3>
          <p>
            Native advertisements are simply put: ads that are <em>built</em> into the content that the user is viewing. A publisher requests for example, a text ad: instead of us building our own text ad and then forcing that version upon the publisher, we send the information of the text ad (link, title, description, etc) to the publisher and <b>they</b> can decide how to <em>build</em> the ad into their content. The result is a much cleaner ad that looks like it belongs within the content it is being displayed alongside.
          </p>

          <h3>What are the benefits to native advertising?</h3>
          <p>
            Users are more likely to pay attention to an ad that becomes part of the content.
            <br />
            Another benefit to native advertising is that ads are much less likely to be blocked by ad blocking plugins for multiple reasons. Ad blockers work by finding a common method of displaying ads utilized by ad networks; since the actual ad displaying is determined by the publishers the chances of someone blocking that specific method is much lower. In addition to this, ads that aren't annoying and obtrusive simply won't be blocked in most cases.
          </p>

          {this.state.registerAdv ? (
            <RegisterAdvertiser {...this.props} />
          ) : !this.state.account.advertiser ? (
            <div>
              <h3>How do I become an advertiser?</h3>
              <p>
                While anyone can become an advertiser, all advertisement campaigns will be verified before going live.
              </p>

              <Button
                raised secondary
                label='Register'
                onClick={() => this.setState({ registerAdv: true })}
              />
            </div>
          ) : null}

          <a
            href='https://xyfir.com/#/documentation/xyfir-ads/advertisers'
            target='_blank'
          >
            Documentation
          </a>
        </Paper>

        <Paper zDepth={1} className='publishers section'>
          <h2>For Publishers</h2>
          <p>
            Native ads allow you to integrate advertising any way you want. Control exactly where, what, and how ads display. You tell us what kind of ads you want and we find ads relevant to your content and return not the ad itself, but the ad information. We give you the link, title, description, image, etc and let you (or your developers) decide how to display that content. The result is a multitude of benefits for both you <b>and</b> your users: cleaner site, faster page loads, no intrusive user tracking, less blocked ads, and more!
          </p>

          {this.state.registerPub ? (
            <RegisterPublisher {...this.props} />
          ) : !this.state.account.publisher ? (
            <div>
              <h3>How do I become a publisher?</h3>
              <p>
                Registration does not come with guaranteed acceptance. All publishers must be verified prior to being able to use our services.
              </p>

              <Button
                raised secondary
                label='Register'
                onClick={() => this.setState({ registerPub: true })}
              />
            </div>
          ) : null}

          <a
            target='_blank'
            href='https://xyfir.com/#/documentation/xyfir-ads/publishers'
          >
            Documentation
          </a>
        </Paper>

        <Paper zDepth={1} className='developers section'>
          <h2>For Developers</h2>

          <a
            target='_blank'
            href='https://xyfir.com/#/documentation/xyfir-ads/developers'
          >
            Documentation
          </a>
        </Paper>
      </div>
    );
  }

}