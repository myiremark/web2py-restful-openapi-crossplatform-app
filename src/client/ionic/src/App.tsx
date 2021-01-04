import React from 'react';
import {Redirect, Route} from 'react-router-dom';
import {IonApp, IonRouterOutlet, IonSplitPane} from '@ionic/react';
import {IonReactRouter} from '@ionic/react-router';

import Auth from './services/Auth';

import CartService from './services/Cart';

import SideMenu from './components/SideMenu';

import Cart from './pages/Cart';

import {Splash} from './pages/Splash';
import Register from './pages/User/Register';
import Login from './pages/User/Login';

import Items from './pages/Entities/Items';
import Item from './pages/Entities/Item';

import Search from './pages/Search';

import AppRoutes from './routes';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import Logout from './pages/User/Logout';

const auth = new Auth();

const cartService = new CartService();

const App: React.FC = () => (
  <IonApp>
    <SideMenu auth={auth}></SideMenu>
    <IonReactRouter>
      <IonSplitPane contentId="main">
        <IonRouterOutlet id="main">
          <Route
            path="/user/:entityType/index"
            exact={true}
            render={props => (
              <Items
                {...props}
                auth={auth}
                entityType={props.match.params.entityType}
              ></Items>
            )}
          />
          <Route
            path="/user/:entityType/create"
            exact={true}
            render={props => (
              <Item
                {...props}
                auth={auth}
                entityType={props.match.params.entityType}
                mode="create"
                entityId=""
                cartService={cartService}
              ></Item>
            )}
          />
          <Route
            path="/user/:entityType/view/:entityId"
            render={props => (
              <Item
                {...props}
                auth={auth}
                entityId={props.match.params.entityId}
                entityType={props.match.params.entityType}
                mode="view"
                cartService={cartService}

              ></Item>
            )}
          />
          <Route
            path="/user/:entityType/edit/:entityId"
            render={props => (
              <Item
                {...props}
                auth={auth}
                entityId={props.match.params.entityId}
                entityType={props.match.params.entityType}
                mode="update"
                cartService={cartService}
              ></Item>
            )}
          />
          <Route
            path="/user/:entityType/details/:entityId"
            render={props => (
              <Item
                {...props}
                auth={auth}
                entityId={props.match.params.entityId}
                entityType={props.match.params.entityType}
                mode="details"
                cartService={cartService}
              ></Item>
            )}
          />
          <Route
            path="/user/cart"
            exact={true}
            render={props => (
              <Cart
                {...props}
                auth={auth}
                cartService={cartService}
              ></Cart>
            )}
          />

          <Route path={AppRoutes.inventorySearch()} component={Search} />
          <Route
            path={AppRoutes.userLogin()}
            exact={true}
            render={() => <Login auth={auth}></Login>}
          />
          <Route
            path={AppRoutes.userLogout()}
            exact={true}
            render={() => <Logout auth={auth}></Logout>}
          />
          <Route
            path={AppRoutes.userRegister()}
            render={() => <Register auth={auth}></Register>}
            exact={true}
          />
          <Route path="/splash" component={Splash} exact={true} />
          <Route exact path="/" render={() => <Redirect to="/splash" />} />
        </IonRouterOutlet>
      </IonSplitPane>
    </IonReactRouter>
  </IonApp>
);

export default App;
