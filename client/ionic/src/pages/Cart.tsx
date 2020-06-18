import {
    IonContent,
    IonPage,
    IonList,
    IonItem,
    IonLabel,
    IonListHeader,
    IonButton,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
  } from '@ionic/react';
  import React from 'react';
  import Auth from '../Auth';
  import {Header} from '../components/Header';
  import {RouteComponentProps} from 'react-router-dom';
  import AppRoutes from '../routes';
  import {DefaultApi, Configuration, PurchaseOrder} from '../services/web2pyrestful/';

  import CartService from '../services/Cart'
  
  interface MatchParams {
    name: string;
    history: string;
    location: string;
  }
  
  interface MatchProps extends RouteComponentProps<MatchParams> {
  }
  
  interface Props extends MatchProps {
    auth: Auth;
    cartService: CartService;
  }
  
  interface inventoryItem {
    [key: string]: string;
  }
  
  interface State {
    entities: inventoryItem[];
  }
  
  export default class Cart extends React.Component<Props, State> {
    private api: DefaultApi = new DefaultApi(new Configuration());

    constructor(props: Props) {
      super(props);
      this.state = {
        entities: [],
      };
    }
  
     fetchData = async()=> {
      const auth = this.props.auth;

      const itemIds = this.props.cartService.retrieveItems();

      let entities = [] as inventoryItem[];

      const requestHeaders = await auth.authenticatedHeaders();
      const requestOptions = {
        headers: requestHeaders,
      };

      for (const itemId of itemIds) {
        // normal for loop for async
          let entity = (await this.api.getEntityById("inventoryItem",itemId,requestOptions)).data as inventoryItem;

          entity.id = itemId;
        entities.push(entity);
      }
      this.setState({entities});  
    }
  
    async componentDidMount() {
      await this.fetchData();
    }

     onRemove = async(itemId:string) => {
        this.props.cartService.removeItem(itemId);
        this.fetchData();
    }

    createPurchaseOrder= async(inventoryItems:string[])=>{
        const auth = this.props.auth;
  
        const requestHeaders = await auth.authenticatedHeaders();
        const requestOptions = {
          headers: requestHeaders,
        };

        const inventoryItemPurchaseOrder = {inventoryItems} as PurchaseOrder;
  
        return await this.api.createEntity("purchaseOrder",inventoryItemPurchaseOrder,requestOptions);
    }

    onCheckout = async()=> {
        const entities = this.state.entities;
        let idsSellers = new Set<string>();

        entities.forEach((entity)=>{
            idsSellers.add(entity.idSeller)
        });

        for (let idSeller of Array.from(idsSellers)){
            const sellerEntities = entities.filter((entity)=>{return entity.idSeller === idSeller});
            const itemIds = sellerEntities.map((entity)=>{return entity.id});
            await this.createPurchaseOrder(itemIds);
        }

        this.props.cartService.setItems([]);

        window.location.href = AppRoutes.entityIndexByType("purchaseOrder");

    }
  
    render() {

        const cart = this.props.cartService;
        const cartItems = cart.retrieveItems()

        const checkoutButton = <IonItem><IonButton onClick={this.onCheckout}>Checkout</IonButton></IonItem>

        const renderedCheckout = cartItems.length >0 ? checkoutButton : null;
  
      return (
        <IonPage>
          <Header></Header>
          <IonContent>
            <IonListHeader>
              <IonLabel>
                <h1>My Cart ({cartItems.length} items)</h1>
              </IonLabel>
            </IonListHeader>
            <IonList>
              {this.state.entities &&
                this.state.entities.map(entity => {
                  return (
                    <IonItemSliding>
                    <IonItemOptions side="start">
                        <IonItemOption onClick={()=>{window.location.href=AppRoutes.entityViewByType("inventoryItem",entity.id)}}>Details</IonItemOption>
                    </IonItemOptions>
                    <IonItem>
                        <IonLabel>{entity.title}</IonLabel>
                    </IonItem>
                    <IonItemOptions side="end">
                        <IonItemOption color="danger" onClick={() => this.onRemove(
                            entity.id
                        )}>Remove</IonItemOption>
                    </IonItemOptions>
                </IonItemSliding>
                  );
                })}
                {renderedCheckout}
            </IonList>
          </IonContent>
        </IonPage>
      );
    }
  }
  