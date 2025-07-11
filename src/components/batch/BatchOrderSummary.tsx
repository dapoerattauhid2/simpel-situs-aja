
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface BatchOrderSummaryProps {
  totalPrice: number;
  totalItems: number;
  formatPrice: (price: number) => string;
  onCheckout: () => void;
  loading: boolean;
}

const BatchOrderSummary = ({ totalPrice, totalItems, formatPrice, onCheckout, loading }: BatchOrderSummaryProps) => {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Item:</span>
            <span>{totalItems} item</span>
          </div>
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Pembayaran:</span>
            <span className="text-orange-600">{formatPrice(totalPrice)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Checkout Button */}
      <Button
        onClick={onCheckout}
        disabled={loading}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        size="lg"
      >
        {loading ? 'Memproses...' : 'Buat Pesanan Batch'}
      </Button>
    </div>
  );
};

export default BatchOrderSummary;
