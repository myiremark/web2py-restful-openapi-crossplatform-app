import {AxiosResponse} from 'axios';

import {
  userTokenKey,
  userIdKey,
  userTokenExpirationKey,
  userTokenAllowedDiffMinutes,
  userTokenExpirationMinutes,
  userIdHeaderKey,
} from './constants';
import API from './api';
import AppRoutes from './routes';

const axios = require('axios').default;

class Auth {
  redirectToLogin = () => {
    const url = AppRoutes.userLogin();
    window.location.href = url;
  };

  authenticatedDefaultRoute = ()=>{
    return AppRoutes.entityIndexByType("inventoryItem")
  }

  isAuthenticated = () => {
    const user_token = localStorage.getItem(userTokenKey);
    const tokenValue = user_token ? user_token : '';
    return Boolean(tokenValue.length > 0);
  };

  setUserToken = (token: string) => {
    localStorage.setItem(userTokenKey, token);
  };

  getUserToken = () => {
    const userToken = localStorage.getItem(userTokenKey);
    return userToken;
  };

  setUserId = (userId: string) => {
    localStorage.setItem(userIdKey, userId);
    this.setUserIdCallback(userId);
  };

  getUserId = () => {
    const userId = localStorage.getItem(userIdKey);
    return userId ? userId : '';
  };

  setUserIdCallback = (userId: string) => {};

  setTokenExpiration = () => {
    const now = new Date();
    const tokenExpirationDate = new Date(
      now.getTime() + userTokenExpirationMinutes * 60000
    ).toUTCString();
    const tokenExpiration = Date.parse(tokenExpirationDate).toString();

    localStorage.setItem(userTokenExpirationKey, tokenExpiration);
  };

  getTokenExpiration = () => {
    const expiration = localStorage.getItem(userTokenExpirationKey);
    const e = expiration ? expiration : '';
    return Number(e);
  };

  refreshToken = () => {
    const url = API.loginUser();
    const token = this.getUserToken();

    const requestHeaders = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    };

    const data = JSON.stringify({token});

    const config = {
      method: 'POST',
      headers: requestHeaders,
      data,
      url,
    };

    return axios(config).then((response: AxiosResponse) =>
      this.handleLoginResponse(response)
    );
  };

  getTokenRefreshAble = async () => {
    const expiration = this.getTokenExpiration();
    const nowDate = new Date().toUTCString();
    const now = Date.parse(nowDate);

    const allowedDiff = userTokenAllowedDiffMinutes * 60000;
    const diff = expiration - now;

    const userLoginRoute = AppRoutes.userLogin();

    if (expiration === 0) {
      this.logout();
    } else if (diff <= 0) {
      this.logout();
      window.location.href = userLoginRoute;
    } else if (diff <= allowedDiff) {
      await this.refreshToken();
    }

    const token = this.getUserToken();

    if (token?.length === 0) {
      this.logout();
      window.location.href = userLoginRoute;
    }

    return token;
  };

  authenticatedHeaders = async () => {
    const token = await this.getTokenRefreshAble();
    const requestHeaders = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    };
    return requestHeaders;
  };

  handleLoginResponse = (response: AxiosResponse) => {
    if (response.status === 200) {
      this.setTokenExpiration();
      this.setUserToken(response.data.token);
      this.setUserId(response.headers[userIdHeaderKey]);
    }
  };

  authenticatedOptions = async (method: string) => {
    const requestHeaders = await this.authenticatedHeaders();

    let requestOptions;

    if (method === 'POST') {
      requestOptions = {
        method,
        headers: requestHeaders,
        body: '',
      };
    } else {
      requestOptions = {
        method,
        headers: requestHeaders,
      };
    }

    return requestOptions;
  };

  authenticatedGetOptions = async () => {
    return this.authenticatedOptions('GET');
  };

  authenticatedPostOptions = () => {
    return this.authenticatedOptions('POST');
  };

  logout = () => {
    localStorage.setItem(userTokenKey, '');
    localStorage.setItem(userIdKey, '');
    localStorage.setItem(userTokenExpirationKey, '');
  };

  loginUser = async (username: string, password: string) => {
    const url = API.loginUser();
    const requestHeaders = {
      'Content-Type': 'application/json',
    };

    const data = JSON.stringify({username, password});

    const config = {
      method: 'POST',
      headers: requestHeaders,
      data,
      url,
    };

    return axios(config).then((response: AxiosResponse) =>
      this.handleLoginResponse(response)
    );
  };

  registerUser = async (username: string, password: string) => {
    const url = API.registerUser();
    const requestHeaders = {
      'Content-Type': 'application/json',
    };

    const data = JSON.stringify({username, password});

    const config = {
      method: 'POST',
      headers: requestHeaders,
      data,
      url,
    };

    return axios(config);
  };
}

export default Auth;
