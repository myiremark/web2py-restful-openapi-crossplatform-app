import {
    userCartKey,
} from '../constants';

class CartService {

    retrieveItems = () => {
        const userCartStored = localStorage.getItem(userCartKey);
        let userCart: string[] = [];

        if (userCartStored){
            userCart = JSON.parse(userCartStored) as string[];
        }
        else {
            this.setItems(userCart);
        }
        return userCart;
    }

    setItems = (items: string[])=> {
        localStorage.setItem(userCartKey,JSON.stringify(items))
    }

    addItem = (itemId:string) => {
        const items = this.retrieveItems();
        items.push(itemId);
        this.setItems(items);
    }
    
    removeItem = (itemId:string) => {
        const items = this.retrieveItems().filter((v)=>{return v !== itemId});
        this.setItems(items);
    }
}

export default CartService;
