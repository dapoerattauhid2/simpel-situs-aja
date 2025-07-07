
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, ShoppingBag } from 'lucide-react';
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
  created_at: string;
  order_items: {
    quantity: number;
    price: number;
    food_items: {
      name: string;
    };
  }[];
}

const CashierOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = orders.filter(order => 
      order.child_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.child_class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.payment_status === filterStatus);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, filterStatus]);

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
          created_at,
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
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Data Pesanan
          </h1>
          <p className="text-gray-600">Semua pesanan yang masuk ke sistem</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Cari Pesanan</Label>
              <Input
                id="search"
                placeholder="Nama anak, kelas, atau ID pesanan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Status Pembayaran</Label>
              <select
                id="status"
                className="w-full h-10 px-3 border border-gray-300 rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="pending">Belum Bayar</option>
                <option value="paid">Sudah Bayar</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Daftar Pesanan ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Tidak Ada Pesanan</h3>
              <p className="text-gray-600">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Tidak ditemukan pesanan yang sesuai dengan filter'
                  : 'Belum ada pesanan yang masuk'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nama Anak</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Menu</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Pembayaran</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        {format(new Date(order.order_date), 'dd/MM/yyyy', { locale: id })}
                      </TableCell>
                      <TableCell className="font-medium">{order.child_name}</TableCell>
                      <TableCell>Kelas {order.child_class}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {order.order_items.map((item, index) => (
                            <div key={index}>
                              {item.food_items.name} x {item.quantity}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-blue-600">
                        {formatPrice(order.total_amount)}
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(order.payment_status)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CashierOrders;
