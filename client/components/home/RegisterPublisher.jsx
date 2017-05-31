import request from 'superagent';
import React from 'react';

// react-md
import TextField from 'react-md/lib/TextFields';
import Button from 'react-md/lib/Buttons/Button';
import Paper from 'react-md/lib/Papers';

export default class RegisterPublisher extends React.Component {

  constructor(props) {
    super(props);
  }

  onRegister() {
    const data = {
      name: this.refs.name.getField().value,
      email: this.refs.email.getField().value,
      application: this.refs.info.getField().value
    };

    if (data.name.length > 25)
      this.props.alert('Name cannot be over 25 characters.');
    else if (data.email.length > 50)
      this.props.alert('Email cannot be over 50 characters.');
    else if (data.application.length > 1500)
      this.props.alert('Application cannot be over 1,500 characters.');
    else {
      request
        .post('api/publishers/account/register')
        .send(data)
        .end((err, res) => this.props.alert(res.body.message));
    }
  }

  render() {
    return (
      <Paper zDepth={2} className='register-publisher section flex'>
        <h3>Publisher Application</h3>
        <p>
          Interested in utilizing Xyfir Ads on your site or app? Not all publishers who apply will be accepted, but it can't hurt to try. Once you apply, a staff member will manually approve or deny your application. If you're denied, you can apply again every 3 months.
        </p>
        <p>
          <b>Information we're looking for in your application:</b>
          <br />
          a brief description of and links to sites, apps, or other service that you plan to integrate Xyfir Ads with
          <br />
          current and estimated unique and total views, downloads, etc
          <br />
          categories your sites/applications/etc target
          <br />
          any information you believe will help improve your application
        </p>

        <TextField
          id='text--name'
          ref='name'
          type='text'
          label='Name'
          className='md-cell'
        />

        <TextField
          id='email--email'
          ref='email'
          type='email'
          label='Email'
          className='md-cell'
        />

        <TextField
          id='textarea--info'
          ref='info'
          rows={2}
          type='text'
          label='Publisher Application'
          className='md-cell'
        />

        <Button
          raised primary
          label='Submit'
          onClick={() => this.onRegister()}
        />
      </Paper>
    );
  }

}