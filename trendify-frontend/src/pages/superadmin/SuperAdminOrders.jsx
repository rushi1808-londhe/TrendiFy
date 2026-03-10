import OrderManagement from '../admin/OrderManagement';
// SuperAdmin uses same order management UI but with their sidebar active path
export default function SuperAdminOrders() {
  return <OrderManagement />;
}
