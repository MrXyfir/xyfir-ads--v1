import request from 'superagent';
import React from 'react';

export default class RegisterAdvertiser extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    request
      .post('api/advertisers/account/register')
      .end((err, res) =>
        err || res.body.error
          ? this.props.alert(res.body.message)
          : location.hash = '#/advertisers'
      )
  }

  render() {
    return <div />;
  }

}