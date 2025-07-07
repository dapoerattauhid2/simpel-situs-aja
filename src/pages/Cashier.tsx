
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/order';
import { formatPrice, formatDate, getStatusColor, getStatusText } from '@/utils/orderUtils';
import { Search, CreditCard, CheckCircle } from 'lucide-react';

const Cashier = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [processingPayments, setProcessingPayments] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm]);

  const fetchPendingOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price,
            food_items (
              name,
              image_url
            )
          )
        `)
        .in('payment_status', ['pending', 'failed'])
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

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.child_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.child_class?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const processPayment = async (order: Order, method: string) => {
    if (!method) {
      toast({
        title: "Error",
        description: "Pilih metode pembayaran terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setProcessingPayments(prev => new Set(prev).add(order.id));

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (error) throw error;

      toast({
        title: "Pembayaran Berhasil",
        description: `Pembayaran pesanan ${order.child_name} berhasil diproses`,
      });

      fetchPendingOrders();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Error",
        description: "Gagal memproses pembayaran",
        variant: "destructive",
      });
    } finally {
      setProcessingPayments(prev => {
        const newSet = new Set(prev);
        newSet.delete(order.id);
        return newSet;
      });
    }
  };

  const getTotalRevenue = () => {
    return orders
      .filter(order => order.payment_status === 'paid')
      .reduce((total, order) => total + order.total_amount, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
          Kasir Katering
        </h1>
        <p className="text-gray-600">Proses pembayaran pesanan makanan dan minuman</p>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pesanan Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {filteredOrders.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Nilai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(filteredOrders.reduce((total, order) => total + order.total_amount, 0))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Metode Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih metode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Tunai</SelectItem>
                <SelectItem value="debit">Kartu Debit</SelectItem>
                <SelectItem value="credit">Kartu Kredit</SelectItem>
                <SelectItem value="transfer">Transfer Bank</SelectItem>
                <SelectItem value="digital">E-Wallet</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari nama anak, kelas, atau ID pesanan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Order Info */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">{order.child_name}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Kelas: {order.child_class}</p>
                    <p>ID: {order.id.slice(0, 8)}...</p>
                    <p>Tanggal: {formatDate(order.created_at)}</p>
                  </div>
                  <Badge className={`mt-2 ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </Badge>
                </div>

                {/* Order Items */}
                <div className="lg:col-span-2">
                  <h4 className="font-medium mb-2">Items Pesanan:</h4>
                  <div className="space-y-2">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                        <img
                          src={item.food_items.image_url}
                          alt={item.food_items.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.food_items.name}</p>
                          <p className="text-xs text-gray-600">
                            {item.quantity}x • {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {order.notes && (
                    <div className="mt-3 p-2 bg-blue-50 rounded">
                      <p className="text-sm text-blue-800">
                        <strong>Catatan:</strong> {order.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Payment Action */}
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Total Pembayaran</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatPrice(order.total_amount)}
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => processPayment(order, paymentMethod)}
                    disabled={!paymentMethod || processingPayments.has(order.id)}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    {processingPayments.has(order.id) ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Memproses...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Proses Bayar
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <CheckCircle className="h-16 w-16 mx-auto text-green-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Semua Pembayaran Selesai</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Tidak ada pesanan yang sesuai dengan pencarian'
                : 'Tidak ada pesanan yang perlu diproses pembayarannya'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Cashier;
