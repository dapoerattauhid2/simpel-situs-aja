
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShoppingCart } from 'lucide-react';
import { useBatchCart } from '@/hooks/useBatchCart';
import BatchCartItemList from './BatchCartItemList';
import BatchOrderSummary from './BatchOrderSummary';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const BatchCart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [parentNotes, setParentNotes] = useState('');
  const {
    cartItems,
    loading,
    updateQuantity,
    removeFromCart,
    getTotalAmount,
    getTotalItems,
    createBatchOrder,
    fetchChildren
  } = useBatchCart();

  useEffect(() => {
    if (isOpen) {
      fetchChildren();
    }
  }, [isOpen]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckout = async () => {
    await createBatchOrder(parentNotes);
    setIsOpen(false);
    setParentNotes('');
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-4 right-4 rounded-full shadow-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 z-50"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          {getTotalItems()} item • {formatPrice(getTotalAmount())}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keranjang Belanja Batch</DialogTitle>
          <DialogDescription>
            Review pesanan untuk beberapa anak dan tanggal pengiriman
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Cart Items */}
          <BatchCartItemList
            items={cartItems}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            formatPrice={formatPrice}
          />

          {/* Parent Notes */}
          <div className="space-y-2">
            <Label htmlFor="parent-notes">Catatan Orang Tua (Opsional)</Label>
            <Textarea
              id="parent-notes"
              placeholder="Catatan khusus untuk seluruh pesanan..."
              value={parentNotes}
              onChange={(e) => setParentNotes(e.target.value)}
            />
          </div>

          {/* Order Summary */}
          <BatchOrderSummary
            totalPrice={getTotalAmount()}
            totalItems={getTotalItems()}
            formatPrice={formatPrice}
            onCheckout={handleCheckout}
            loading={loading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BatchCart;
