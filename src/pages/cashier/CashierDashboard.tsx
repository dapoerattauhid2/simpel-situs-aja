
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, CreditCard, Clock, CheckCircle, Calculator } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Order {
  id: string;
  order_date: string;
  child_name: string;
  child_class: string;
  total_amount: number;
  payment_status: string;
  status: string;
  order_items: {
    quantity: number;
    price: number;
    food_items: {
      name: string;
    };
  }[];
}

const CashierDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [receivedAmount, setReceivedAmount] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const filtered = orders.filter(order => 
      order.child_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.child_class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOrders(filtered);
  }, [orders, searchTerm]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_date,
          child_name,
          child_class,
          total_amount,
          payment_status,
          status,
          order_items (
            quantity,
            price,
            food_items (
              name
            )
          )
        `)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data pesanan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCashPayment = async (order: Order) => {
    const received = parseFloat(receivedAmount[order.id] || '0');
    
    if (received < order.total_amount) {
      toast({
        title: "Error",
        description: "Jumlah yang diterima kurang dari total pembayaran",
        variant: "destructive",
      });
      return;
    }

    setProcessingPayment(order.id);
    
    try {
      const change = received - order.total_amount;
      
      // Record cash payment
      const { error: cashError } = await supabase
        .from('cash_payments')
        .insert({
          order_id: order.id,
          cashier_id: (await supabase.auth.getUser()).data.user?.id,
          amount: order.total_amount,
          received_amount: received,
          change_amount: change,
          payment_date: new Date().toISOString(),
          notes: `Pembayaran tunai untuk pesanan ${order.child_name}`
        });

      if (cashError) throw cashError;

      // Update order payment status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'paid',
          status: 'confirmed'
        })
        .eq('id', order.id);

      if (orderError) throw orderError;

      toast({
        title: "Pembayaran Berhasil!",
        description: `Kembalian: ${formatPrice(change)}`,
      });

      // Reset received amount
      setReceivedAmount(prev => ({ ...prev, [order.id]: '' }));
      
      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error('Error processing cash payment:', error);
      toast({
        title: "Error",
        description: "Gagal memproses pembayaran tunai",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Menunggu</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Dikonfirmasi</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="text-green-600 border-green-600">Selesai</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Lunas</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Belum Bayar</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard Kasir
          </h1>
          <p className="text-gray-600">Kelola pembayaran tunai dan pesanan</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Cari Pesanan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Cari berdasarkan nama anak, kelas, atau ID pesanan</Label>
              <Input
                id="search"
                placeholder="Masukkan nama anak, kelas, atau ID pesanan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calculator className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Tidak Ada Pesanan</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Tidak ditemukan pesanan yang sesuai dengan pencarian' : 'Belum ada pesanan yang perlu diproses'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{order.child_name}</CardTitle>
                    <CardDescription>
                      Kelas {order.child_class} • {format(new Date(order.order_date), 'dd MMMM yyyy', { locale: id })}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {getPaymentStatusBadge(order.payment_status)}
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium mb-2">Detail Pesanan:</h4>
                    <div className="space-y-1">
                      {order.order_items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.food_items.name} x {item.quantity}</span>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span className="text-lg text-blue-600">{formatPrice(order.total_amount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cash Payment Section */}
                  {order.payment_status !== 'paid' && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Pembayaran Tunai
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                          <Label htmlFor={`amount-${order.id}`}>Jumlah Diterima</Label>
                          <Input
                            id={`amount-${order.id}`}
                            type="number"
                            placeholder="0"
                            value={receivedAmount[order.id] || ''}
                            onChange={(e) => setReceivedAmount(prev => ({
                              ...prev,
                              [order.id]: e.target.value
                            }))}
                          />
                        </div>
                        <div>
                          <Label>Kembalian</Label>
                          <div className="h-10 flex items-center px-3 border rounded-md bg-gray-50">
                            {formatPrice(Math.max(0, (parseFloat(receivedAmount[order.id] || '0') - order.total_amount)))}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleCashPayment(order)}
                          disabled={processingPayment === order.id || !receivedAmount[order.id] || parseFloat(receivedAmount[order.id]) < order.total_amount}
                          className="w-full"
                        >
                          {processingPayment === order.id ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Memproses...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Proses Pembayaran
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CashierDashboard;
