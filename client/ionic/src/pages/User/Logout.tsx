import React from 'react';
import Auth from '../../Auth';

interface Props {
  auth: Auth;
}

export default class Logout extends React.Component<Props, {}> {
  render() {
    this.props.auth.logout();
    this.props.auth.redirectToLogin();
    return (<></>);
  }
}
