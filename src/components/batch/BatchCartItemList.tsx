
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Minus, Trash2, User, Calendar } from 'lucide-react';
import { BatchCartItem } from '@/types/batchCart';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface BatchCartItemListProps {
  items: BatchCartItem[];
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  formatPrice: (price: number) => string;
}

const BatchCartItemList = ({ items, onUpdateQuantity, onRemoveItem, formatPrice }: BatchCartItemListProps) => {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1 space-y-2">
                <div>
                  <h4 className="font-semibold">{item.name}</h4>
                  <p className="text-sm text-gray-600">{formatPrice(item.price)} per item</p>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>{item.child_name} - {item.child_class}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{format(new Date(item.delivery_date), 'dd MMM yyyy', { locale: idLocale })}</span>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                    Catatan: {item.notes}
                  </p>
                )}
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="mx-2 font-semibold w-8 text-center">{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRemoveItem(item.id)}
                    className="h-8 w-8 p-0 ml-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BatchCartItemList;
