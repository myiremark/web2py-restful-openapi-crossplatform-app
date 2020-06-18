import {
  IonContent,
  IonPage,
  IonCard,
  IonCardContent,
  IonToast,
  IonCardHeader,
  IonCardTitle
} from '@ionic/react';

import React from 'react';
import {RouteComponentProps} from 'react-router-dom';

import Form from '@rjsf/material-ui';
import {ISubmitEvent, IChangeEvent} from '@rjsf/core';

import Auth from '../../Auth';
import {Header} from '../../components/Header';
import API from '../../api';

import {JSONSchema7} from 'json-schema';
import CartService from '../../services/Cart';
import AppRoutes from '../../routes';

import {DefaultApi, Configuration} from '../../services/web2pyrestful/';

import {InventoryItem,PurchaseOrder} from '../../services/web2pyrestful/api'
import { jsonSchemaUiSchema } from '../../constants';


interface MatchParams {
  entityType: string;
  entityId: string;
  name: string;
  history: string;
  location: string;
}

interface MatchProps extends RouteComponentProps<MatchParams> {
  entityType: string;
  entityId: string;
}

interface Props extends MatchProps {
  auth: Auth;
  cartService: CartService;
  entityType: string;
  entityId: string;
  mode: string; // create, update, view
}

interface EntityItem {
  [key: string]: string;
}

type Entity = (InventoryItem | PurchaseOrder);

interface State {
  entity: Entity;
  schema: JSONSchema7;
  toasted: boolean;
  readonly: boolean;
  minHeight: number;
}

export default class Item extends React.Component<Props, State> {
  private api: DefaultApi = new DefaultApi(new Configuration());

  constructor(props: Props) {
    super(props);
    this.state = {
      minHeight: 100,
      schema: {} as JSONSchema7,
      entity: {} as Entity,
      toasted: false,
      readonly: props.mode === "view" || props.mode === "details"
    };
  }

  async fetchFormSchema(entityType: string) {
    const auth = this.props.auth;

    const url = API.entitySchemaByType(this.props.entityType);

    const requestHeaders = await auth.authenticatedHeaders();
    const requestOptions = {
      method: 'GET',
      headers: requestHeaders,
    };

    const schema = (await fetch(url, requestOptions).then(e =>
      e.json()
    )) as JSONSchema7;

    return schema;
  }

  async fetchEntityData(entityType: string, entityId: string) {
    const auth = this.props.auth;

    const requestHeaders = await auth.authenticatedHeaders();
    const requestOptions = {
      method: 'GET',
      headers: requestHeaders,
    };

    const entity = (await (await this.api.getEntityById(this.props.entityType,this.props.entityId,requestOptions)).data) as Entity;
    return entity;
  }

  async fetchEntityDetails(entityType: string, entityId: string) {
    const auth = this.props.auth;

    const requestHeaders = await auth.authenticatedHeaders();
    const requestOptions = {
      method: 'GET',
      headers: requestHeaders,
    };

    const entity = (await (await this.api.getEntityDetails(this.props.entityType,this.props.entityId,requestOptions)).data) as Entity;

    return entity;
  }

  async fetchData() {
    const entity = (await this.fetchEntityData(
      this.props.entityType,
      this.props.entityId
    )) as Entity;
    const schema = (await this.fetchFormSchema(
      this.props.entityType
    )) as JSONSchema7;
    this.setState({schema});
    this.setState({entity});
  }

  async fetchDetailedData(){
    const entity = (await this.fetchEntityDetails(
      this.props.entityType,
      this.props.entityId
    )) as PurchaseOrder;

    const minHeight = entity.inventoryItems ? entity.inventoryItems.length * 150: 150;

    const schema = (await this.fetchFormSchema(
      this.props.entityType
    )) as JSONSchema7;
    
    this.setState({schema});
    this.setState({entity});
    this.setState({minHeight});

  }

  updateEntity = async(formData:IChangeEvent<InventoryItem|PurchaseOrder>|InventoryItem|PurchaseOrder)=>{
    const auth = this.props.auth;

    const entityType = this.props.entityType;
  
    const requestHeaders = await auth.authenticatedHeaders();
    const options = {
      headers: requestHeaders,
    };

    if (entityType === "inventoryItem"){
      const inventoryItemPurchaseOrder = formData as InventoryItem;
      return await this.api.updateEntity(entityType,this.props.entityId,inventoryItemPurchaseOrder,options);

    } else if (entityType === "purchaseOrder"){
      const inventoryItemPurchaseOrder = formData as PurchaseOrder;
      return await this.api.updateEntity(entityType,this.props.entityId,inventoryItemPurchaseOrder,options);
    }
  }

  createEntity = async(formData:IChangeEvent<InventoryItem|PurchaseOrder>|InventoryItem|PurchaseOrder)=>{

    const auth = this.props.auth;
    const entityType = this.props.entityType;

    const requestHeaders = await auth.authenticatedHeaders();
    const options = {
      headers: requestHeaders,
    };

    if (entityType === "inventoryItem"){
      const inventoryItemPurchaseOrder = formData as InventoryItem;
      return await this.api.createEntity(entityType,inventoryItemPurchaseOrder,options);

    } else if (entityType === "purchaseOrder"){
      const inventoryItemPurchaseOrder = formData as PurchaseOrder;
      return await this.api.createEntity(entityType,inventoryItemPurchaseOrder,options);
    }
  }

  onSubmit = async (event: ISubmitEvent<IChangeEvent>) => {

    const formData = event.formData;

    if (this.props.mode==="view"){
      this.props.cartService.addItem(this.props.entityId);
    }

    if (this.props.mode === "create"){
      const result = await this.createEntity(formData).then(r=>r?.data);
      if (result && result.id){
        const url = AppRoutes.entityEditByType(this.props.entityType,result.id.toString())
        window.location.href = url;
      }
    }

    if (this.props.mode === "update"){
      await this.updateEntity(formData);
      await this.fetchData();
    }

    this.setState({toasted: true});

  };

  async componentDidMount() {
    if (this.props.mode === "details"){
      await this.fetchDetailedData();
    } else {
      await this.fetchData();
    }
  }

  render() {
    const schema = this.state.schema as JSONSchema7;

    const formData = this.state.entity as Entity;

    const toastMessage = this.props.mode === "view" ? "Added to Cart" : "Record Saved.";
    const submitButtonText = this.props.mode === "view" ? "Add to Cart" : "Save";

    const uiSchema = jsonSchemaUiSchema;

    const minHeight = (this.state.minHeight * 1.5).toString() + "%"

    return (
      <IonPage>
        <Header></Header>
        <IonToast
          isOpen={this.state.toasted}
          onDidDismiss={() => this.setState({toasted: false})}
          message={toastMessage}
          duration={1000}
          position="top"
        />
        <IonContent>
          <IonCard style={{"minHeight":minHeight}}> 
          <IonCardHeader>
            <IonCardTitle><h1>{this.props.mode} {this.props.entityType}</h1></IonCardTitle>
          </IonCardHeader>
            <IonCardContent>
              <Form
                schema={schema}
                formData={formData}
                onSubmit={this.onSubmit.bind(this)}
                omitExtraData
                disabled={this.state.readonly}
                uiSchema={uiSchema}
              >
                  <button type="submit">{submitButtonText}</button>
                </Form>
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonPage>
    );
  }
}
