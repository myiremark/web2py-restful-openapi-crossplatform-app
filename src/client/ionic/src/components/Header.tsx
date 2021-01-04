import {IonHeader, IonToolbar, IonMenuButton, IonTitle} from '@ionic/react';
import React from 'react';
import {AppName} from '../constants';

export const Header: React.FC = () => (
  <IonHeader>
    <IonToolbar>
      <IonMenuButton menu="main" autoHide={false}>
        <IonTitle>{AppName}</IonTitle>
      </IonMenuButton>
    </IonToolbar>
  </IonHeader>
);
