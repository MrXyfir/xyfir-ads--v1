import React from "react";

// Components
import RegisterAdvertiser from "components/home/RegisterAdvertiser";
import RegisterPublisher from "components/home/RegisterPublisher";
import Button from "components/forms/Button";

export default class Home extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            registerAdv: false,
            registerPub: false
        };

        this.registerAdv = this.registerAdv.bind(this);
        this.registerPub = this.registerPub.bind(this);
    }

    registerAdv() {
        this.setState({ registerAdv: true });
    }

    registerPub() {
        this.setState({ registerPub: true });
    }

    render() {
        let registerAdvertiser;
        if (this.state.registerAdv) {
            registerAdvertiser = <RegisterAdvertiser />;
        }
        else {
            registerAdvertiser = (
                <div>
                    <h3>How do I become an advertiser?</h3>
                    <Button type="primary" onClick={this.registerAdv}>Register</Button>
                </div>
            );
        }

        let registerPublisher;
        if (this.state.registerPub) {
            registerPublisher = <RegisterPublisher />;
        }
        else {
            registerPublisher = (
                <div>
                    <h3>How do I become a publisher?</h3>
                    <p>Registration does not come with guaranteed acceptance. All publishers must be verified prior to being able to use our services.</p>
                    <Button type="primary" onClick={this.registerPub}>Register</Button>
                </div>
            );
        }

        return (
        <div className="home">
            <div className="home-section-main">
                <h1>Xyfir Ads</h1>
                <p className="subtitle">Advertising for the modern web.</p>
                <p>
                    A better advertising network for advertisers, publishers, developers, and users alike. We've done away with everything that's given online advertising a bad name: intrusive tracking, high bandwidth usage, high resource usage, flashy and distractive ads, and more.Our advertisers and publishers are all hand picked and approved by an actual human to ensure quality. Xyfir Ads has the ability to seamlessly integrate with content due to our 'native ad' system. In other words: we give the ad content to the publisher, and they decide how to implement it into their site, app, etc. We give our advertisers, publishers, and users more control than anywhere else.
                </p>
            </div>

            <hr />

            <div className="home-section-dashboards">
                <h2>Dashboards</h2>
                <a href="#/advertisers" className="btn btn-lg btn-primary">Advertiser</a>
                <a href="#/publishers" className="btn btn-lg btn-primary">Publisher</a>
                <a className="link-lg" href={XACC + "login/11"}>LOGIN WITH XYFIR ACCOUNT</a>
            </div>

            <hr />

            <div className="home-section-advertisers">
	            <h2>For Advertisers</h2>
	            <p className="subtitle">Capture a wider audience with native ads.</p>
	            <p>
	                Many users today are growing tired of the current state of online advertising. They have to worry about ads eating into their bandwidth caps, slowing down their browser, distracting them from the content they want to see, or even distributing malware. Due to this, users are blocking ads more than ever before and this hurts publishers and advertisers alike. It's time we change the way people feel about online advertising. How do we do that? Native ads.
	            </p>

	            <h3>What are native ads?</h3>
	            <p>
	                Native ads are simply put: ads that are <i>built</i> into the site, app, etc that the user is using. A publisher requests for example, a text ad: instead of us building our own text ad and then forcing that version upon the publisher's site, we send the information of the text ad (link, title, description, etc) to the publisher and <b>they</b> can decide how to <i>build</i> the ad into their content. The result is a much cleaner ad that looks like it belongs within the content it is being displayed alongside.
	            </p>

	            <h3>What are the benefits to native advertising?</h3>
	            <p>
	                Native ads receive more views, clicks, and conversions than normal web advertising. Users are more likely to pay attention to an ad that becomes part of the content.
		            <br />
	                Another benefit to native advertising is that they are much less likely to be blocked by ad-blocking plugins, and for multiple reasons. Ad-blockers work by finding a common method of displaying ads utilized by ad networks; since the actual ad displaying is determined by the publishers they chances of someone blocking that specific method is much lower. In addition to this, ads that aren't annoying and obtrusive simply won't be blocked.
	            </p>

                {registerAdvertiser}

	            <h3 className="header-doc-resources">Documentation / Resources</h3>
	            <a className="link-lg">https://xyfir.github.io/ads/advertisers</a>
            </div>

            <hr />

            <div className="home-section-publishers">
	            <h2>For Publishers</h2>
	            <p className="subtitle">Increase your ad revenue while keeping your users happy.</p>

	            <h3>Increased revenue? Happy users? How?</h3>
	            <p>
	                Xyfir Ads brings unprecedented customization and control to publishers. Native ads allow you to integrate advertising any way you want. Control exactly where, what, and how ads display. You tell us what kind of ads you want and we find ads relevant to your content and return not the ad itself, but the ad information. We give you the link, title, description, image, etc and let you (or your developers) decide how to display that content. The result is a multitude of benefits for both you <b>and</b> your users: cleaner site, faster page loads, no intrusive user tracking, more personalized ads, less blocked ads, and more!
	            </p>

                {registerPublisher}

	            <h3 className="header-doc-resources">Documentation / Resources</h3>
	            <a className="link-lg">https://xyfir.github.io/ads/publishers</a>
            </div>

            <hr />

            <div className="home-section-developers">
	            <h2>For Developers</h2>
	            <p className="subtitle">Gain the control over ads that you've always wanted.</p>

	            <h3>Simple API</h3>
	            <p>
	                Call our API whenever you want, tell us exactly what ads you need, and we'll return a JSON object containing ads as relevant as possible. You then get to determine what, how, and where those ads are displayed. No longer are the limits of your control determining where the advertisements will display.
	            </p>

	            <h3 className="header-doc-resources">Documentation / Resources</h3>
	            <a className="link-lg">https://xyfir.github.io/ads/api</a>
            </div>
        </div>
        );
    }

}