import { AxiosResponse } from 'axios';

import {DefaultApi, Configuration} from '../lib/web2pyrestful';

import {
  userTokenKey,
  userIdKey,
  userTokenExpirationKey,
  userTokenAllowedDiffMinutes,
  userTokenExpirationMinutes,
  userIdHeaderKey,
  registrationIsEnabled
} from './../constants';

import AppRoutes from './../routes';

interface axiosError {
  response: { 
    status: number; 
    headers: { [x: string]: string; }; }; 
}

class Auth {
  private api: DefaultApi;

  constructor() {
    const APIConfiguration = new Configuration();
    this.api = new DefaultApi(APIConfiguration);
  }

  // placeholder methods intended to be overwritten
  registrationEnabled = () => registrationIsEnabled;
  setUserIdCallback = (userId: string) => {};

  // important

  isAuthenticated = () => {
    const user_token = this.getUserToken();
    const tokenValue = user_token ? user_token : '';
    return Boolean(tokenValue.length > 0);
  };

  // user tokens
  getUserToken = () => {
    const userToken = localStorage.getItem(userTokenKey);
    return userToken;
  };

  setUserToken = (token: string) => {
    localStorage.setItem(userTokenKey, token);
  };

  getTokenExpiration = () => {
    const expiration = localStorage.getItem(userTokenExpirationKey);
    const e = expiration ? expiration : '';
    return Number(e);
  };

  setTokenExpiration = () => {
    const now = new Date();
    const tokenExpirationDate = new Date(
      now.getTime() + userTokenExpirationMinutes * 60000
    ).toUTCString();
    const tokenExpiration = Date.parse(tokenExpirationDate).toString();

    localStorage.setItem(userTokenExpirationKey, tokenExpiration);
  };
  
  refreshToken = async () => {
    const currentTokenValue = this.getUserToken();

    const token = currentTokenValue ? currentTokenValue : "";

    const api = this.getConfiguredApi(token);

    const userToken = { token };

    await api.userAuthenticateToken(userToken).then((response:AxiosResponse)=>{
      this.handleLoginSuccess(response);
    }
    ).catch((error:axiosError) => {
        this.handleLoginFail(error)
    })
  };

  getTokenRefreshAble = async () => {
    const expiration = this.getTokenExpiration();
    const nowDate = new Date().toUTCString();
    const now = Date.parse(nowDate);
    const userLoginView = AppRoutes.userLogin();

    const allowedDiff = userTokenAllowedDiffMinutes * 60000;
    const diff = expiration - now;

    if (expiration === 0) {
      this.logout();
    } else if (diff <= 0) {
      this.logout();
      const url = userLoginView;
      window.location.href = url;
    } else if (diff <= allowedDiff) {
      await this.refreshToken();
    }

    const token = this.getUserToken();

    if (token?.length === 0) {
      this.logout();
      const url = userLoginView;
      window.location.href = url;
    }

    const refreshedToken = token ? token : "";

    return refreshedToken;
  };

  // app methods methods
  
  
  handleLoginSuccess = (response: AxiosResponse) => {
    if (response.status === 200) {
      this.setTokenExpiration();
      this.setUserToken(response.data.token);
      this.setUserId(response.headers[userIdHeaderKey]);
    }
  };

  handleLoginFail = (error:axiosError) => {
    this.redirectToLogin();
  }

  logout = () => {
    localStorage.setItem(userTokenKey, '');
    localStorage.setItem(userIdKey, '');
    localStorage.setItem(userTokenExpirationKey, '');
  };
  
  loginUser = async (username: string, password: string) => {
    const userCredentials = { username, password };
    await this.api.userAuthenticateCredentials(userCredentials).then((response:AxiosResponse)=>{
        this.handleLoginSuccess(response);
    }

    ).catch((error: axiosError) => {
        this.handleLoginFail(error)
    })
  };

  registerUser = async (username: string, password: string) => {
    const userCredentials = { username, password };
    return (await this.api.userRegisterCredentials(userCredentials));
  };

  // auxillary methods

  authenticatedHeaders = async () => {
    const token = await this.getTokenRefreshAble();
    const requestHeaders = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    };
    return requestHeaders;
  };


  getConfiguredApi = (token:string) => {
    const APIConfiguration = new Configuration();
          APIConfiguration.accessToken = token;
    return new DefaultApi(APIConfiguration);
  };

    setUserId = (userId: string) => {
        localStorage.setItem(userIdKey, userId);
        this.setUserIdCallback(userId);
    };

    getUserId = () => {
        const userId = localStorage.getItem(userIdKey);
        return userId ? userId : '';
    };


  redirectToLogin = () => {
    const url = AppRoutes.userLogin();
    window.location.href = url;
  };


  authenticatedDefaultRoute = () => {
    return AppRoutes.authenticatedDefaultRoute();
  };

}

export default Auth;
