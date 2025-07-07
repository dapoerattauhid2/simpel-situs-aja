
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Search, Calculator } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface CashPayment {
  id: string;
  amount: number;
  received_amount: number;
  change_amount: number;
  payment_date: string;
  notes: string;
  orders: {
    child_name: string;
    child_class: string;
    total_amount: number;
  };
}

const CashierCashPayments = () => {
  const [payments, setPayments] = useState<CashPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<CashPayment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set default dates to today
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    setStartDate(todayStr);
    setEndDate(todayStr);
    
    fetchPayments(todayStr, todayStr);
  }, []);

  useEffect(() => {
    const filtered = payments.filter(payment => 
      payment.orders?.child_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.orders?.child_class?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPayments(filtered);
  }, [payments, searchTerm]);

  const fetchPayments = async (start?: string, end?: string) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('cash_payments')
        .select(`
          id,
          amount,
          received_amount,
          change_amount,
          payment_date,
          notes,
          orders (
            child_name,
            child_class,
            total_amount
          )
        `)
        .order('payment_date', { ascending: false });

      if (start) {
        query = query.gte('payment_date', `${start}T00:00:00`);
      }
      if (end) {
        query = query.lte('payment_date', `${end}T23:59:59`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching cash payments:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data pembayaran tunai",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Mohon pilih tanggal mulai dan akhir",
        variant: "destructive",
      });
      return;
    }
    fetchPayments(startDate, endDate);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalReceived = filteredPayments.reduce((sum, payment) => sum + payment.received_amount, 0);
  const totalChange = filteredPayments.reduce((sum, payment) => sum + payment.change_amount, 0);

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
            Pembayaran Tunai
          </h1>
          <p className="text-gray-600">Riwayat transaksi pembayaran tunai</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredPayments.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Penjualan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatPrice(totalAmount)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Diterima</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatPrice(totalReceived)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Kembalian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatPrice(totalChange)}</div>
          </CardContent>
        </Card>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Cari Transaksi</Label>
              <Input
                id="search"
                placeholder="Nama anak atau catatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="start-date">Tanggal Mulai</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-date">Tanggal Akhir</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleFilter}
                className="w-full h-10 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Filter
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Riwayat Pembayaran Tunai ({filteredPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <Calculator className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Tidak Ada Transaksi</h3>
              <p className="text-gray-600">
                {searchTerm || (startDate && endDate)
                  ? 'Tidak ditemukan transaksi yang sesuai dengan filter'
                  : 'Belum ada transaksi pembayaran tunai'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal & Waktu</TableHead>
                    <TableHead>Nama Anak</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Total Belanja</TableHead>
                    <TableHead>Uang Diterima</TableHead>
                    <TableHead>Kembalian</TableHead>
                    <TableHead>Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {format(new Date(payment.payment_date), 'dd/MM/yyyy HH:mm', { locale: id })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {payment.orders?.child_name || '-'}
                      </TableCell>
                      <TableCell>
                        {payment.orders?.child_class ? `Kelas ${payment.orders.child_class}` : '-'}
                      </TableCell>
                      <TableCell className="font-bold text-green-600">
                        {formatPrice(payment.amount)}
                      </TableCell>
                      <TableCell className="font-bold text-blue-600">
                        {formatPrice(payment.received_amount)}
                      </TableCell>
                      <TableCell className="font-bold text-orange-600">
                        {formatPrice(payment.change_amount)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {payment.notes || '-'}
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

export default CashierCashPayments;
