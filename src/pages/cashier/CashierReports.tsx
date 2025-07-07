
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, Printer, TrendingUp, Users, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface ReportData {
  totalOrders: number;
  totalRevenue: number;
  totalCashPayments: number;
  totalOnlinePayments: number;
  averageOrderValue: number;
  topMenuItems: {
    name: string;
    quantity: number;
    revenue: number;
  }[];
  dailySummary: {
    date: string;
    orders: number;
    revenue: number;
    cashPayments: number;
  }[];
}

const CashierReports = () => {
  const [reportData, setReportData] = useState<ReportData>({
    totalOrders: 0,
    totalRevenue: 0,
    totalCashPayments: 0,
    totalOnlinePayments: 0,
    averageOrderValue: 0,
    topMenuItems: [],
    dailySummary: []
  });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const startStr = format(firstDayOfMonth, 'yyyy-MM-dd');
    const endStr = format(today, 'yyyy-MM-dd');
    
    setStartDate(startStr);
    setEndDate(endStr);
    
    fetchReportData(startStr, endStr);
  }, []);

  const fetchReportData = async (start: string, end: string) => {
    try {
      setLoading(true);
      
      // Fetch orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_date,
          total_amount,
          payment_status,
          notes,
          order_items (
            quantity,
            price,
            food_items (
              name
            )
          )
        `)
        .gte('order_date', start)
        .lte('order_date', end)
        .neq('status', 'cancelled');

      if (ordersError) throw ordersError;

      // Process data
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      
      // Calculate cash payments from orders with cash payment notes
      const cashOrders = orders?.filter(order => 
        order.payment_status === 'paid' && 
        order.notes && 
        order.notes.toLowerCase().includes('pembayaran tunai')
      ) || [];
      
      const totalCashPayments = cashOrders.reduce((sum, order) => sum + order.total_amount, 0);
      const totalOnlinePayments = totalRevenue - totalCashPayments;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Calculate top menu items
      const menuMap = new Map<string, { quantity: number; revenue: number }>();
      orders?.forEach(order => {
        order.order_items?.forEach(item => {
          const name = item.food_items?.name || '';
          const current = menuMap.get(name) || { quantity: 0, revenue: 0 };
          menuMap.set(name, {
            quantity: current.quantity + item.quantity,
            revenue: current.revenue + (item.price * item.quantity)
          });
        });
      });

      const topMenuItems = Array.from(menuMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);

      // Calculate daily summary
      const dailyMap = new Map<string, { orders: number; revenue: number; cashPayments: number }>();
      
      orders?.forEach(order => {
        const date = order.order_date;
        const current = dailyMap.get(date) || { orders: 0, revenue: 0, cashPayments: 0 };
        const isCashPayment = order.payment_status === 'paid' && 
                            order.notes && 
                            order.notes.toLowerCase().includes('pembayaran tunai');
        
        dailyMap.set(date, {
          orders: current.orders + 1,
          revenue: current.revenue + (order.total_amount || 0),
          cashPayments: current.cashPayments + (isCashPayment ? order.total_amount : 0)
        });
      });

      const dailySummary = Array.from(dailyMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => b.date.localeCompare(a.date));

      setReportData({
        totalOrders,
        totalRevenue,
        totalCashPayments,
        totalOnlinePayments,
        averageOrderValue,
        topMenuItems,
        dailySummary
      });

    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data laporan",
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
    fetchReportData(startDate, endDate);
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Kasir - ${format(new Date(), 'dd MMMM yyyy', { locale: id })}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { display: flex; justify-content: space-around; margin-bottom: 30px; }
          .summary-item { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Laporan Kasir</h1>
          <p>Periode: ${format(new Date(startDate), 'dd MMMM yyyy', { locale: id })} - ${format(new Date(endDate), 'dd MMMM yyyy', { locale: id })}</p>
        </div>
        
        <div class="summary">
          <div class="summary-item">
            <h3>${reportData.totalOrders}</h3>
            <p>Total Pesanan</p>
          </div>
          <div class="summary-item">
            <h3>${formatPrice(reportData.totalRevenue)}</h3>
            <p>Total Pendapatan</p>
          </div>
          <div class="summary-item">
            <h3>${formatPrice(reportData.totalCashPayments)}</h3>
            <p>Pembayaran Tunai</p>
          </div>
        </div>

        <h2>Menu Terlaris</h2>
        <table>
          <thead>
            <tr>
              <th>Menu</th>
              <th>Jumlah Terjual</th>
              <th>Pendapatan</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.topMenuItems.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${formatPrice(item.revenue)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Ringkasan Harian</h2>
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Pesanan</th>
              <th>Pendapatan</th>
              <th>Pembayaran Tunai</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.dailySummary.map(day => `
              <tr>
                <td>${format(new Date(day.date), 'dd MMMM yyyy', { locale: id })}</td>
                <td>${day.orders}</td>
                <td>${formatPrice(day.revenue)}</td>
                <td>${formatPrice(day.cashPayments)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
            Laporan Kasir
          </h1>
          <p className="text-gray-600">Analisis penjualan dan pembayaran</p>
        </div>
        
        <Button onClick={printReport} variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Print Laporan
        </Button>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Periode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Button onClick={handleFilter} className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Laporan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Pesanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Pendapatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatPrice(reportData.totalRevenue)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pembayaran Tunai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatPrice(reportData.totalCashPayments)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatPrice(reportData.averageOrderValue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Menu Items */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Terlaris</CardTitle>
          <CardDescription>10 menu dengan penjualan tertinggi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Peringkat</TableHead>
                  <TableHead>Nama Menu</TableHead>
                  <TableHead>Jumlah Terjual</TableHead>
                  <TableHead>Total Pendapatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.topMenuItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-bold">#{index + 1}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="font-bold text-green-600">{formatPrice(item.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Daily Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Harian</CardTitle>
          <CardDescription>Penjualan per hari dalam periode yang dipilih</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jumlah Pesanan</TableHead>
                  <TableHead>Total Pendapatan</TableHead>
                  <TableHead>Pembayaran Tunai</TableHead>
                  <TableHead>Pembayaran Online</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.dailySummary.map((day, index) => (
                  <TableRow key={index}>
                    <TableCell>{format(new Date(day.date), 'dd MMMM yyyy', { locale: id })}</TableCell>
                    <TableCell>{day.orders}</TableCell>
                    <TableCell className="font-bold text-green-600">{formatPrice(day.revenue)}</TableCell>
                    <TableCell className="font-bold text-blue-600">{formatPrice(day.cashPayments)}</TableCell>
                    <TableCell className="font-bold text-purple-600">{formatPrice(day.revenue - day.cashPayments)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashierReports;
