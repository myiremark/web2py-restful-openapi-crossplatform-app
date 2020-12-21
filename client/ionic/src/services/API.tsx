import Auth from './Auth';
import {DefaultApi, Configuration} from '../lib/web2pyrestful';
import {BASE_PATH} from '../lib/web2pyrestful/base';

export default class APIService {
    private auth: Auth = new Auth();
    service: DefaultApi;
    basePath: string = BASE_PATH;
  
    constructor() {
      const APIConfiguration = new Configuration();
            APIConfiguration.accessToken = this.auth.getTokenRefreshAble;
      this.service = new DefaultApi(APIConfiguration);
    }
}