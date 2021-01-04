import {
  IonContent,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonListHeader,
  IonButton
} from '@ionic/react';
import React from 'react';
import Auth from '../../services/Auth';
import {Header} from '../../components/Header';
import {RouteComponentProps} from 'react-router-dom';

import AppRoutes from '../../routes';

import APIService from '../../services/API';

interface MatchParams {
  entityType: string;
  name: string;
  history: string;
  location: string;
}

interface MatchProps extends RouteComponentProps<MatchParams> {
  entityType: string;
}

interface Props extends MatchProps {
  auth: Auth;
  entityType: string;
}

interface inventoryItem {
  [key: string]: string;
}

interface State {
  entities: inventoryItem[];
}

export default class Items extends React.Component<Props, State> {
  private api: APIService = new APIService();

  constructor(props: Props) {
    super(props);
    this.state = {
      entities: [],
    };
  }

  async fetchData() {

    const entityType = this.props.entityType;

    const entities = await (await this.api.service.getEntityIndex(entityType)).data  as inventoryItem[];

    this.setState({entities});
  }

  async componentDidMount() {
    await this.fetchData();
  }

  render() {

    const createButton = <IonButton
    href={AppRoutes.entityCreateByType(this.props.entityType)}
  >
    +
  </IonButton>;

    const renderedCreateButton = this.props.entityType === "inventoryItem" ? createButton : null;

    const itemKey = this.props.entityType === "inventoryItem" ? "title" : "created_on";
    
    return (
      <IonPage>
        <Header></Header>
        <IonContent>
          <IonListHeader>
            <IonLabel>
              <h1>My {this.props.entityType}s</h1>
            </IonLabel>
            {renderedCreateButton}
          </IonListHeader>
          <IonList>
            {this.state.entities &&
              this.state.entities.map(entity => {
                const url = this.props.entityType === "inventoryItem" ? AppRoutes.entityEditByType(
                  this.props.entityType,
                  entity.id
                ) : AppRoutes.userPurchaseOrderDetails(entity.id);
                return (
                  <IonItem
                    href={url}
                  >
                    <IonLabel>{entity[itemKey]}</IonLabel>
                  </IonItem>
                );
              })}
          </IonList>
        </IonContent>
      </IonPage>
    );
  }
}
