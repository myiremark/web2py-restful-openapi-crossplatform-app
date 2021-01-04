import React, {FormEvent} from 'react';
import {
  IonContent,
  IonPage,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/react';
import {Header} from '../../components/Header';

import '../../theme/ExploreContainer.css';
import Auth from '../../services/Auth';

interface Props {
  auth: Auth;
}

export default class Login extends React.Component<Props, {}> {
  
  onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const inputEmail = event.currentTarget.elements.namedItem(
      'email'
    ) as HTMLInputElement;
    const inputPassword = event.currentTarget.elements.namedItem(
      'password'
    ) as HTMLInputElement;

    const username = inputEmail && inputEmail.value ? inputEmail.value : '';
    const password = inputPassword.value ? inputPassword.value : '';

    await this.props.auth.loginUser(username, password);

    if (this.props.auth.isAuthenticated()) {
      const url = this.props.auth.authenticatedDefaultRoute();
      window.location.href = url;
    }

    return false;
  };

  render() {
    return (
      <IonPage>
        <Header></Header>
        <IonContent>
          <div className="container">
            <form onSubmit={this.onSubmit.bind(this)}>
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Log In</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList>
                    <IonItem>
                      <IonLabel>Email</IonLabel>
                      <IonInput required type="email" name="email"></IonInput>
                    </IonItem>
                    <IonItem>
                      <IonLabel>Password</IonLabel>
                      <IonInput
                        required
                        type="password"
                        name="password"
                      ></IonInput>
                    </IonItem>
                    <IonItem>
                      <IonButton type="submit">Login</IonButton>
                    </IonItem>
                  </IonList>{' '}
                </IonCardContent>
              </IonCard>
            </form>
          </div>
        </IonContent>
      </IonPage>
    );
  }
}
