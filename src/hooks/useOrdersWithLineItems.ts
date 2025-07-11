
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';

interface OrderLineItem {
  id: string;
  menu_item_id: string;
  child_id: string | null;
  child_name: string;
  child_class: string | null;
  delivery_date: string;
  order_date: string;
  quantity: number;
  unit_price: number;
  total_price: number | null;
  notes: string | null;
  menu_items: {
    name: string;
    image_url: string;
  } | null;
}

interface OrderWithLineItems {
  id: string;
  user_id: string | null;
  total_amount: number;
  status: string | null;
  payment_status: string | null;
  created_at: string;
  order_date: string | null;
  parent_notes: string | null;
  midtrans_order_id: string | null;
  snap_token: string | null;
  order_line_items: OrderLineItem[];
}

export const useOrdersWithLineItems = () => {
  const [orders, setOrders] = useState<OrderWithLineItems[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrdersWithLineItems();
    }
  }, [user]);

  const fetchOrdersWithLineItems = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_line_items (
            id,
            menu_item_id,
            child_id,
            child_name,
            child_class,
            delivery_date,
            order_date,
            quantity,
            unit_price,
            total_price,
            notes,
            menu_items (
              name,
              image_url
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedOrders = (data || []).map(order => ({
        ...order,
        order_line_items: order.order_line_items.map((item: any) => ({
          ...item,
          menu_items: item.menu_items || { name: 'Unknown Item', image_url: '' }
        }))
      }));
      
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders with line items:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data pesanan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const retryPayment = async (order: OrderWithLineItems) => {
    try {
      if (order.snap_token) {
        if ((window as any).snap) {
          (window as any).snap.pay(order.snap_token, {
            onSuccess: () => {
              toast({
                title: "Pembayaran Berhasil!",
                description: "Pembayaran berhasil diproses.",
              });
              fetchOrdersWithLineItems();
            },
            onPending: () => {
              toast({
                title: "Menunggu Pembayaran",
                description: "Pembayaran sedang diproses.",
              });
              fetchOrdersWithLineItems();
            },
            onError: () => {
              toast({
                title: "Pembayaran Gagal",
                description: "Terjadi kesalahan dalam pembayaran.",
                variant: "destructive",
              });
            },
            onClose: () => {
              console.log('Payment popup closed');
            }
          });
        }
        return;
      }

      // Create new payment if no snap_token
      let orderId = order.midtrans_order_id;
      
      if (!orderId) {
        orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const { error: updateError } = await supabase
          .from('orders')
          .update({ midtrans_order_id: orderId })
          .eq('id', order.id);
          
        if (updateError) throw updateError;
      }

      const customerDetails = {
        first_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Customer',
        email: user?.email || 'parent@example.com',
        phone: user?.user_metadata?.phone || '08123456789',
      };

      const itemDetails = order.order_line_items.map(item => ({
        id: item.id,
        price: item.unit_price,
        quantity: item.quantity,
        name: `${item.menu_items?.name || 'Unknown Item'} - ${item.child_name}`,
      }));

      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        'create-payment',
        {
          body: {
            orderId,
            amount: order.total_amount,
            customerDetails,
            itemDetails,
          },
        }
      );

      if (paymentError) throw paymentError;

      if (paymentData.snap_token) {
        const { error: saveTokenError } = await supabase
          .from('orders')
          .update({ snap_token: paymentData.snap_token })
          .eq('id', order.id);

        if (saveTokenError) {
          console.error('Error saving snap_token:', saveTokenError);
        }

        if ((window as any).snap) {
          (window as any).snap.pay(paymentData.snap_token, {
            onSuccess: () => {
              toast({
                title: "Pembayaran Berhasil!",
                description: "Pembayaran berhasil diproses.",
              });
              fetchOrdersWithLineItems();
            },
            onPending: () => {
              toast({
                title: "Menunggu Pembayaran",
                description: "Pembayaran sedang diproses.",
              });
              fetchOrdersWithLineItems();
            },
            onError: () => {
              toast({
                title: "Pembayaran Gagal",
                description: "Terjadi kesalahan dalam pembayaran.",
                variant: "destructive",
              });
            },
            onClose: () => {
              console.log('Payment popup closed');
            }
          });
        }
      }
    } catch (error: any) {
      console.error('Retry payment error:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal memproses pembayaran",
        variant: "destructive",
      });
    }
  };

  return {
    orders,
    loading,
    retryPayment,
    fetchOrdersWithLineItems
  };
};
