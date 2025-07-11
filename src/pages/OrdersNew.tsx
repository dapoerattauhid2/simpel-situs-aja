
import { useOrdersWithLineItems } from '@/hooks/useOrdersWithLineItems';
import { OrderWithLineItemsCard } from '@/components/orders/OrderWithLineItemsCard';
import { EmptyOrdersState } from '@/components/orders/EmptyOrdersState';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const OrdersNew = () => {
  const { orders, loading, retryPayment } = useOrdersWithLineItems();
  const [activeTab, setActiveTab] = useState('all');

  // Filter orders berdasarkan tab aktif
  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'pending':
        return orders.filter(order => order.status === 'pending');
      case 'confirmed':
        return orders.filter(order => order.status === 'confirmed');
      case 'preparing':
        return orders.filter(order => order.status === 'preparing');
      case 'delivered':
        return orders.filter(order => order.status === 'delivered');
      default:
        return orders;
    }
  };

  const filteredOrders = getFilteredOrders();

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedData: paginatedOrders,
    goToPage,
    canGoNext,
    canGoPrev,
    startIndex,
    endIndex,
    totalItems
  } = usePagination({
    data: filteredOrders,
    itemsPerPage: 12
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 md:h-32 md:w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-3 md:p-6">
      <div className="text-center mb-4 md:mb-8">
        <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1 md:mb-2">
          Riwayat Pesanan Batch
        </h1>
        <p className="text-gray-600 text-sm md:text-base">Pantau status pesanan makanan untuk semua anak Anda</p>
      </div>

      {orders.length === 0 ? (
        <EmptyOrdersState />
      ) : (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-4 md:mb-6 h-8 md:h-10">
              <TabsTrigger value="all" className="text-xs md:text-sm px-1 md:px-3">Semua</TabsTrigger>
              <TabsTrigger value="pending" className="text-xs md:text-sm px-1 md:px-3">Tunggu</TabsTrigger>
              <TabsTrigger value="confirmed" className="text-xs md:text-sm px-1 md:px-3">Konfirm</TabsTrigger>
              <TabsTrigger value="preparing" className="text-xs md:text-sm px-1 md:px-3">Siap</TabsTrigger>
              <TabsTrigger value="delivered" className="text-xs md:text-sm px-1 md:px-3">Selesai</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                {paginatedOrders.map((order) => (
                  <OrderWithLineItemsCard key={order.id} order={order} onRetryPayment={retryPayment} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Pagination Controls */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            canGoNext={canGoNext}
            canGoPrev={canGoPrev}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={totalItems}
            itemLabel="pesanan"
          />
        </>
      )}
    </div>
  );
};

export default OrdersNew;
