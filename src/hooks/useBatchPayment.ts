
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { Order } from '@/types/order';

declare global {
  interface Window {
    snap: {
      pay: (token: string, options?: {
        onSuccess?: (result: any) => void;
        onPending?: (result: any) => void;
        onError?: (result: any) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

export const useBatchPayment = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const processBatchPayment = async (orders: Order[], onSuccess?: () => void) => {
    if (!orders || orders.length === 0) {
      toast({
        title: "Error",
        description: "Tidak ada pesanan yang dipilih untuk dibayar",
        variant: "destructive",
      });
      return;
    }

    // Filter only pending payment orders
    const pendingOrders = orders.filter(order => order.payment_status === 'pending');
    
    if (pendingOrders.length === 0) {
      toast({
        title: "Info",
        description: "Tidak ada pesanan yang perlu dibayar",
      });
      return;
    }

    setLoading(true);

    try {
      const totalAmount = pendingOrders.reduce((sum, order) => sum + order.total_amount, 0);
      const batchOrderId = `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const customerDetails = {
        first_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Customer',
        email: user?.email || 'parent@example.com',
        phone: user?.user_metadata?.phone || '08123456789',
      };

      // Create combined item details from all orders
      const itemDetails = [];
      for (const order of pendingOrders) {
        for (const item of order.order_items) {
          itemDetails.push({
            id: `${order.id}-${item.id}`,
            price: item.price,
            quantity: item.quantity,
            name: `${item.menu_items?.name || 'Item'} - ${order.child_name}`,
          });
        }
      }

      console.log('Creating batch payment for orders:', pendingOrders.map(o => o.id));
      console.log('Total amount:', totalAmount);
      console.log('Item details:', itemDetails);

      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        'create-payment',
        {
          body: {
            orderId: batchOrderId,
            amount: totalAmount,
            customerDetails,
            itemDetails,
            batchOrderIds: pendingOrders.map(order => order.id), // Send order IDs for batch update
          },
        }
      );

      if (paymentError) {
        console.error('Batch payment error:', paymentError);
        throw paymentError;
      }

      if (paymentData.snap_token) {
        // Update all orders with the same snap_token for batch payment tracking
        for (const order of pendingOrders) {
          await supabase
            .from('orders')
            .update({ 
              snap_token: paymentData.snap_token,
              midtrans_order_id: batchOrderId
            })
            .eq('id', order.id);
        }

        if (window.snap) {
          window.snap.pay(paymentData.snap_token, {
            onSuccess: () => {
              toast({
                title: "Pembayaran Batch Berhasil!",
                description: `Berhasil membayar ${pendingOrders.length} pesanan sekaligus.`,
              });
              onSuccess?.();
            },
            onPending: () => {
              toast({
                title: "Menunggu Pembayaran Batch",
                description: "Pembayaran batch sedang diproses.",
              });
              onSuccess?.();
            },
            onError: () => {
              toast({
                title: "Pembayaran Batch Gagal",
                description: "Terjadi kesalahan dalam pembayaran batch.",
                variant: "destructive",
              });
            },
            onClose: () => {
              console.log('Batch payment popup closed');
            }
          });
        } else {
          throw new Error('Midtrans Snap belum loaded');
        }
      } else {
        throw new Error('Snap token tidak diterima untuk batch payment');
      }
    } catch (error: any) {
      console.error('Batch payment error:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal memproses pembayaran batch",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    processBatchPayment
  };
};
