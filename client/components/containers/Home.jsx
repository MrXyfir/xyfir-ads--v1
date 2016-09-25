import React from "react";

// Components
import RegisterAdvertiser from "components/home/RegisterAdvertiser";
import RegisterPublisher from "components/home/RegisterPublisher";
import Button from "components/forms/Button";

// Constants
import { XACC } from "constants/config";

// Modules
import request from "lib/request";

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
        request({
            url: "api/account/status",
            success: (res) => {
                this.setState({ account: res });
            }
        });
    }

    onRegisterAdv() {
        this.setState({ registerAdv: true });
    }

    onRegisterPub() {
        this.setState({ registerPub: true });
    }

    render() {
        return (
        <div className="home">
            <section className="home-section-main">
                <h1>Xyfir Ads</h1>
                <p className="subtitle">Advertising for the modern web.</p>
                <p>
                    We've done away with everything that's given online advertising a bad name: intrusive tracking, high bandwidth usage, high resource usage, flashy and distractive ads, and more. Our advertisers and publishers are all hand picked and approved by an actual human to ensure quality. Xyfir Ads has the ability to seamlessly integrate with content due to our 'native ad' system. In other words: we give the ad content to the publisher, and they decide how to implement it into their site, app, etc.
                </p>
            </section>

            <hr />

            <section className="home-section-dashboards">
                <h2>Dashboards</h2>
                {!this.state.account.loggedIn ? (
                    <a className="link-lg" href={XACC + "login/11"}>
                        LOGIN WITH XYFIR ACCOUNT
                    </a>
                ) : (
                    <div>
                        {this.state.account.advertiser ? (
                            <a href="#/advertisers" className="link-lg">
                                Advertiser
                            </a>
                        ) : (<span />)}
                        {this.state.account.publisher ? (
                            <a href="#/publishers" className="link-lg">
                                Publisher
                            </a>
                        ) : (<span />)}
                        {!this.state.account.publisher && !this.state.account.advertiser ? (
                            <span>You are not registered as a publisher or advertiser.</span>
                        ) : (<span />)}
                    </div>
                )}
            </section>

            <hr />

            <section className="home-section-advertisers">
	            <h2>For Advertisers</h2>
	            <p className="subtitle">Capture a wider audience with native ads.</p>
	            <p>
	                Many users today are growing tired of the current state of online advertising. They have to worry about ads eating into their bandwidth caps, slowing down their browser, distracting them from the content they want to see, or even distributing malware. Due to this, users are blocking ads more than ever before and this hurts publishers and advertisers alike. It's time we change the way people feel about online advertising. How do we do that? Native ads.
	            </p>

	            <h3>What are native ads?</h3>
	            <p>
	                Native ads are simply put: ads that are <em>built</em> into the content that the user is viewing. A publisher requests for example, a text ad: instead of us building our own text ad and then forcing that version upon the publisher, we send the information of the text ad (link, title, description, etc) to the publisher and <b>they</b> can decide how to <em>build</em> the ad into their content. The result is a much cleaner ad that looks like it belongs within the content it is being displayed alongside.
	            </p>

	            <h3>What are the benefits to native advertising?</h3>
	            <p>
	                Users are more likely to pay attention to an ad that becomes part of the content.
		            <br />
	                Another benefit to native advertising is that they are much less likely to be blocked by ad-blocking plugins, and for multiple reasons. Ad-blockers work by finding a common method of displaying ads utilized by ad networks; since the actual ad displaying is determined by the publishers the chances of someone blocking that specific method is much lower. In addition to this, ads that aren't annoying and obtrusive simply won't be blocked in most cases.
	            </p>

                {this.state.account.advertiser ? (
                    <span />
                ) : this.state.registerAdv ? (
                    <RegisterAdvertiser />
                ) : (
                    <div>
                        <h3>How do I become an advertiser?</h3>
                        <p>
                            While anyone can become an advertiser, all advertisement campaigns will be verified before going live.
                        </p>
                        <Button type="primary" onClick={() => this.onRegisterAdv()}>
                            Register
                        </Button>
                    </div>
                )}

	            <h3 className="header-doc-resources">Documentation / Resources</h3>
	            <a href="https://xyfir.com/#/documentation/xyfir-ads/advertisers" target="_blank" className="link-lg">https://xyfir.com/#/documentation/xyfir-ads/advertisers</a>
            </section>

            <hr />

            <section className="home-section-publishers">
	            <h2>For Publishers</h2>
	            <p className="subtitle">Increase your ad revenue while keeping your users happy.</p>

	            <h3>How?</h3>
	            <p>
	                Native ads allow you to integrate advertising any way you want. Control exactly where, what, and how ads display. You tell us what kind of ads you want and we find ads relevant to your content and return not the ad itself, but the ad information. We give you the link, title, description, image, etc and let you (or your developers) decide how to display that content. The result is a multitude of benefits for both you <b>and</b> your users: cleaner site, faster page loads, no intrusive user tracking, more personalized ads, less blocked ads, and more!
	            </p>

                {this.state.account.publisher ? (
                    <span />
                ) : this.state.registerPub ? (
                    <RegisterPublisher />
                ) : (
                    <div>
                        <h3>How do I become a publisher?</h3>
                        <p>
                            Registration does not come with guaranteed acceptance. All publishers must be verified prior to being able to use our services.
                        </p>
                        <Button type="primary" onClick={() => this.onRegisterPub()}>
                            Register
                        </Button>
                    </div>
                )}

	            <h3 className="header-doc-resources">Documentation / Resources</h3>
	            <a className="link-lg" target="_blank" href="https://xyfir.com/#/documentation/xyfir-ads/publishers">https://xyfir.com/#/documentation/xyfir-ads/publishers</a>
            </section>

            <hr />

            <section className="home-section-developers">
	            <h2>For Developers</h2>
	            <p className="subtitle">A simple-to-use API built with developers in mind.</p>

	            <h3 className="header-doc-resources">Documentation / Resources</h3>
	            <a className="link-lg" target="_blank" href="https://xyfir.com/#/documentation/xyfir-ads/developers">https://xyfir.com/#/documentation/xyfir-ads/developers</a>
            </section>
        </div>
        );
    }

}