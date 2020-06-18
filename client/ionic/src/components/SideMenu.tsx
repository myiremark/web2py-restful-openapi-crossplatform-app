import React from 'react';

import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonItemDivider,
} from '@ionic/react';

import {AppName} from '../constants';
import AppRoutes from '../routes';
import Auth from '../Auth';

const CommonMenu: React.FC = () => {
  return (
    <>
      <IonItemDivider></IonItemDivider>
      <IonItem>Privacy Policy</IonItem>
      <IonItem>Terms of Service</IonItem>
      <IonItem>Github</IonItem>
    </>
  );
};

const LoggedOutMenu: React.FC = () => {
  return (
    <IonList>
      <IonItem href={AppRoutes.userLogin()}>Login</IonItem>
      <IonItem href={AppRoutes.userRegister()}>Register</IonItem>
      <CommonMenu />
    </IonList>
  );
};

const LoggedInMenu: React.FC = () => {
  return (
    <IonList>
      <IonItem href={AppRoutes.inventorySearch()}>Search Public Inventory</IonItem>
      <IonItem href={AppRoutes.entityIndexByType("inventoryItem")}>My Inventory Items</IonItem>
      <IonItem href={AppRoutes.entityIndexByType("purchaseOrder")}>My Purchase Orders</IonItem>
      <IonItem href={AppRoutes.userCart()}>My Cart</IonItem>
      <IonItem href={AppRoutes.userLogout()}>Log Out</IonItem>
      <CommonMenu />
    </IonList>
  );
};

interface Props {
  auth: Auth;
}

class SideMenu extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
    this.state = {
      show: false,
    };
  }
  render() {
    const menu = this.props.auth.isAuthenticated() ? (
      <LoggedInMenu />
    ) : (
      <LoggedOutMenu />
    );

    return (
      <IonMenu side="start" menuId="main" contentId="main">
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>{AppName}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>{menu}</IonContent>
      </IonMenu>
    );
  }
}

export default SideMenu;
