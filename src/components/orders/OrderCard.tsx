
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, X, CreditCard } from 'lucide-react';
import { Order } from '@/types/order';
import { 
  getStatusColor, 
  getPaymentStatusColor, 
  getStatusText, 
  getPaymentStatusText,
  formatPrice,
  formatDate 
} from '@/utils/orderUtils';

interface OrderCardProps {
  order: Order;
  onRetryPayment: (order: Order) => void;
  onCancelOrder: (order: Order) => void;
}

export const OrderCard = ({ order, onRetryPayment, onCancelOrder }: OrderCardProps) => {
  // Cek apakah order bisa dibatalkan (hanya jika payment pending atau status pending)
  const canCancel = (order.payment_status === 'pending' || order.status === 'pending') && order.status !== 'cancelled';

  return (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-lg flex items-center">
            <User className="h-5 w-5 mr-2 text-orange-600" />
            {order.child_name}
          </CardTitle>
          <CardDescription>
            Kelas {order.child_class} • {formatDate(order.created_at)}
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
      <div className="space-y-3">
        {/* Order Items */}
        <div className="space-y-2">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
              <img
                src={item.menu_items?.image_url || '/placeholder.svg'}
                alt={item.menu_items?.name || 'Unknown Item'}
                className="w-12 h-12 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-medium text-sm">{item.menu_items?.name || 'Unknown Item'}</p>
                <p className="text-xs text-gray-600">
                  {item.quantity}x • {formatPrice(item.price)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="p-2 bg-blue-50 rounded">
            <p className="text-sm text-blue-800">
              <strong>Catatan:</strong> {order.notes}
            </p>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="font-semibold">Total:</span>
          <span className="font-bold text-orange-600">
            {formatPrice(order.total_amount)}
          </span>
        </div>

        {/* Action Buttons */}
        {order.payment_status === 'pending' && order.status !== 'cancelled' && (
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              onClick={() => onRetryPayment(order)}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Bayar Sekarang
            </Button>
            {canCancel && (
              <Button 
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                onClick={() => onCancelOrder(order)}
              >
                <X className="h-4 w-4 mr-2" />
                Batalkan
              </Button>
            )}
          </div>
        )}

        {/* Show cancel button only for pending orders that haven't been paid */}
        {canCancel && order.payment_status !== 'pending' && (
          <Button 
            variant="outline"
            className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
            onClick={() => onCancelOrder(order)}
          >
            <X className="h-4 w-4 mr-2" />
            Batalkan Pesanan
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
  );
};
