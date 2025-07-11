
import { useOrders } from '@/hooks/useOrders';
import { useOrdersWithLineItems } from '@/hooks/useOrdersWithLineItems';
import { OrderFilters } from '@/components/orders/OrderFilters';
import { OrderWithLineItemsCard } from '@/components/orders/OrderWithLineItemsCard';
import { EmptyOrdersState } from '@/components/orders/EmptyOrdersState';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Orders = () => {
  // Use both old and new order systems
  const { orders: oldOrders, loading: oldLoading, retryPayment: oldRetryPayment } = useOrders();
  const { orders: newOrders, loading: newLoading, retryPayment: newRetryPayment } = useOrdersWithLineItems();
  
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'new' | 'old'>('new');

  const loading = oldLoading || newLoading;

  // Filter orders berdasarkan tab aktif for new orders
  const getFilteredNewOrders = () => {
    switch (activeTab) {
      case 'pending':
        return newOrders.filter(order => order.status === 'pending');
      case 'confirmed':
        return newOrders.filter(order => order.status === 'confirmed');
      case 'preparing':
        return newOrders.filter(order => order.status === 'preparing');
      case 'delivered':
        return newOrders.filter(order => order.status === 'delivered');
      default:
        return newOrders;
    }
  };

  // Filter orders berdasarkan tab aktif for old orders
  const getFilteredOldOrders = () => {
    switch (activeTab) {
      case 'pending':
        return oldOrders.filter(order => order.status === 'pending');
      case 'confirmed':
        return oldOrders.filter(order => order.status === 'confirmed');
      case 'preparing':
        return oldOrders.filter(order => order.status === 'preparing');
      case 'delivered':
        return oldOrders.filter(order => order.status === 'delivered');
      default:
        return oldOrders;
    }
  };

  const filteredNewOrders = getFilteredNewOrders();
  const filteredOldOrders = getFilteredOldOrders();

  // Pagination for new orders
  const {
    currentPage: newCurrentPage,
    totalPages: newTotalPages,
    paginatedData: paginatedNewOrders,
    goToPage: newGoToPage,
    canGoNext: newCanGoNext,
    canGoPrev: newCanGoPrev,
    startIndex: newStartIndex,
    endIndex: newEndIndex,
    totalItems: newTotalItems
  } = usePagination({
    data: filteredNewOrders,
    itemsPerPage: 12
  });

  // Pagination for old orders
  const {
    currentPage: oldCurrentPage,
    totalPages: oldTotalPages,
    paginatedData: paginatedOldOrders,
    goToPage: oldGoToPage,
    canGoNext: oldCanGoNext,
    canGoPrev: oldCanGoPrev,
    startIndex: oldStartIndex,
    endIndex: oldEndIndex,
    totalItems: oldTotalItems
  } = usePagination({
    data: filteredOldOrders,
    itemsPerPage: 12
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 md:h-32 md:w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const hasAnyOrders = newOrders.length > 0 || oldOrders.length > 0;

  return (
    <div className="max-w-6xl mx-auto p-3 md:p-6">
      <div className="text-center mb-4 md:mb-8">
        <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1 md:mb-2">
          Riwayat Pesanan
        </h1>
        <p className="text-gray-600 text-sm md:text-base">Pantau status pesanan makanan anak Anda</p>
      </div>

      {!hasAnyOrders ? (
        <EmptyOrdersState />
      ) : (
        <>
          {/* View Mode Toggle */}
          <div className="mb-4">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'new' | 'old')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="new">Pesanan Batch ({newOrders.length})</TabsTrigger>
                <TabsTrigger value="old">Pesanan Lama ({oldOrders.length})</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Order Status Filters */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-4 md:mb-6 h-8 md:h-10">
              <TabsTrigger value="all" className="text-xs md:text-sm px-1 md:px-3">Semua</TabsTrigger>
              <TabsTrigger value="pending" className="text-xs md:text-sm px-1 md:px-3">Tunggu</TabsTrigger>
              <TabsTrigger value="confirmed" className="text-xs md:text-sm px-1 md:px-3">Konfirm</TabsTrigger>
              <TabsTrigger value="preparing" className="text-xs md:text-sm px-1 md:px-3">Siap</TabsTrigger>
              <TabsTrigger value="delivered" className="text-xs md:text-sm px-1 md:px-3">Selesai</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {viewMode === 'new' ? (
                <>
                  {filteredNewOrders.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <p className="text-gray-500">Tidak ada pesanan batch untuk status ini</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                      {paginatedNewOrders.map((order) => (
                        <OrderWithLineItemsCard key={order.id} order={order} onRetryPayment={newRetryPayment} />
                      ))}
                    </div>
                  )}
                  
                  {/* Pagination Controls for New Orders */}
                  {newTotalPages > 1 && (
                    <PaginationControls
                      currentPage={newCurrentPage}
                      totalPages={newTotalPages}
                      onPageChange={newGoToPage}
                      canGoNext={newCanGoNext}
                      canGoPrev={newCanGoPrev}
                      startIndex={newStartIndex}
                      endIndex={newEndIndex}
                      totalItems={newTotalItems}
                      itemLabel="pesanan"
                    />
                  )}
                </>
              ) : (
                <>
                  {filteredOldOrders.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <p className="text-gray-500">Tidak ada pesanan lama untuk status ini</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <OrderFilters 
                      orders={paginatedOldOrders} 
                      onRetryPayment={oldRetryPayment}
                      activeTab={activeTab}
                      onTabChange={setActiveTab}
                    />
                  )}
                  
                  {/* Pagination Controls for Old Orders */}
                  {oldTotalPages > 1 && (
                    <PaginationControls
                      currentPage={oldCurrentPage}
                      totalPages={oldTotalPages}
                      onPageChange={oldGoToPage}
                      canGoNext={oldCanGoNext}
                      canGoPrev={oldCanGoPrev}
                      startIndex={oldStartIndex}
                      endIndex={oldEndIndex}
                      totalItems={oldTotalItems}
                      itemLabel="pesanan"
                    />
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Orders;
