
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Calendar, MapPin, Clock } from 'lucide-react';
import { 
  getStatusColor, 
  getPaymentStatusColor, 
  getStatusText, 
  getPaymentStatusText,
  formatPrice,
  formatDate 
} from '@/utils/orderUtils';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface OrderLineItem {
  id: string;
  menu_item_id: string;
  child_id: string | null;
  child_name: string;
  child_class: string | null;
  delivery_date: string;
  order_date: string;
  quantity: number;
  unit_price: number;
  total_price: number | null;
  notes: string | null;
  menu_items: {
    name: string;
    image_url: string;
  } | null;
}

interface OrderWithLineItems {
  id: string;
  user_id: string | null;
  total_amount: number;
  status: string | null;
  payment_status: string | null;
  created_at: string;
  order_date: string | null;
  parent_notes: string | null;
  midtrans_order_id: string | null;
  snap_token: string | null;
  order_line_items: OrderLineItem[];
}

interface OrderWithLineItemsCardProps {
  order: OrderWithLineItems;
  onRetryPayment: (order: OrderWithLineItems) => void;
}

export const OrderWithLineItemsCard = ({ order, onRetryPayment }: OrderWithLineItemsCardProps) => {
  // Group items by delivery date and child
  const groupedItems = order.order_line_items.reduce((acc, item) => {
    const key = `${item.delivery_date}-${item.child_name}`;
    if (!acc[key]) {
      acc[key] = {
        delivery_date: item.delivery_date,
        child_name: item.child_name,
        child_class: item.child_class,
        items: []
      };
    }
    acc[key].items.push(item);
    return acc;
  }, {} as Record<string, { delivery_date: string; child_name: string; child_class: string | null; items: OrderLineItem[] }>);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-orange-600" />
              Pesanan #{order.midtrans_order_id || order.id.slice(0, 8)}
            </CardTitle>
            <CardDescription className="space-y-1">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                Dipesan: {formatDate(order.created_at)}
              </div>
              {order.order_date && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  Tanggal Order: {format(new Date(order.order_date), 'dd MMM yyyy', { locale: idLocale })}
                </div>
              )}
            </CardDescription>
          </div>
          <div className="text-right space-y-1">
            <Badge className={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Badge>
            <Badge className={getPaymentStatusColor(order.payment_status)}>
              {getPaymentStatusText(order.payment_status)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Grouped Items by Date and Child */}
          {Object.values(groupedItems).map((group, groupIndex) => (
            <div key={groupIndex} className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    <User className="h-4 w-4 mr-1" />
                    {group.child_name} - {group.child_class}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(group.delivery_date), 'dd MMM yyyy', { locale: idLocale })}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.menu_items?.image_url || '/placeholder.svg'}
                        alt={item.menu_items?.name || 'Unknown Item'}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-sm">{item.menu_items?.name || 'Unknown Item'}</p>
                        <p className="text-xs text-gray-600">
                          {formatPrice(item.unit_price)} per item
                        </p>
                        {item.notes && (
                          <p className="text-xs text-blue-600 mt-1">
                            Catatan: {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{item.quantity}x</p>
                      <p className="text-xs text-gray-600">
                        {formatPrice(item.unit_price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Parent Notes */}
          {order.parent_notes && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Catatan Orang Tua:</strong> {order.parent_notes}
              </p>
            </div>
          )}

          {/* Order Summary */}
          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between items-center font-semibold text-lg">
              <span>Total Pembayaran:</span>
              <span className="text-orange-600">
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </div>

          {/* Payment Information */}
          {order.midtrans_order_id && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Order ID:</strong> {order.midtrans_order_id}
              </p>
            </div>
          )}

          {/* Payment Button */}
          {order.payment_status === 'pending' && (
            <Button 
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              onClick={() => onRetryPayment(order)}
            >
              {order.midtrans_order_id ? 'Lanjutkan Pembayaran' : 'Bayar Sekarang'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
