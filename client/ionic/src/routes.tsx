export const AppRoutes = {
  userRegister() {
    return '/user/register';
  },
  userLogin() {
    return '/user/login';
  },
  userLogout() {
    return '/user/logout';
  },
  userCart() {
    return '/user/cart';
  },
  inventorySearch() {
    return '/inventory/search';
  },
  userPurchaseOrderDetails(idPurchaseOrder: string) {
    return '/user/purchaseOrder/details/' + idPurchaseOrder;
  },
  entityIndexByType(entityType: string) {
    return '/user/' + entityType + '/index';
  },
  entityCreateByType(entityType: string) {
    return '/user/' + entityType + '/create/';
  },
  entityEditByType(entityType: string, entityId: string) {
    return '/user/' + entityType + '/edit/' + entityId;
  },
  entityViewByType(entityType: string, entityId: string) {
    return '/user/' + entityType + '/view/'+ entityId;
  },
};

export default AppRoutes;
