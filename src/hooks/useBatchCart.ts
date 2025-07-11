
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { BatchCartItem, BatchOrder } from '@/types/batchCart';

interface Child {
  id: string;
  name: string;
  class_name: string;
}

export const useBatchCart = () => {
  const [cartItems, setCartItems] = useState<BatchCartItem[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Load Midtrans Snap script
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', 'SB-Mid-client-your-client-key-here');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchChildren = async () => {
    try {
      if (!user?.id) {
        setChildren([
          { id: '1', name: 'Anak 1', class_name: 'Kelas 1A' },
          { id: '2', name: 'Anak 2', class_name: 'Kelas 2B' }
        ]);
        return;
      }

      const { data, error } = await supabase
        .from('children')
        .select('id, name, class_name')
        .eq('user_id', user.id);

      if (error) {
        console.log('Error fetching children:', error);
        setChildren([
          { id: '1', name: 'Anak 1', class_name: 'Kelas 1A' },
          { id: '2', name: 'Anak 2', class_name: 'Kelas 2B' }
        ]);
        return;
      }

      setChildren(data || []);
    } catch (error) {
      console.error('Error fetching children:', error);
      setChildren([
        { id: '1', name: 'Anak 1', class_name: 'Kelas 1A' },
        { id: '2', name: 'Anak 2', class_name: 'Kelas 2B' }
      ]);
    }
  };

  const addToCart = (item: Omit<BatchCartItem, 'id'>) => {
    const cartId = `${item.menu_item_id}-${item.delivery_date}-${item.child_id}`;
    const existingItem = cartItems.find(cartItem => cartItem.id === cartId);

    if (existingItem) {
      setCartItems(cartItems.map(cartItem =>
        cartItem.id === cartId
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCartItems([...cartItems, { ...item, id: cartId }]);
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
    } else {
      setCartItems(cartItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const createBatchOrder = async (parentNotes?: string) => {
    if (cartItems.length === 0) {
      toast({
        title: "Error",
        description: "Keranjang kosong",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const totalAmount = getTotalAmount();
      const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      console.log('Creating batch order with items:', cartItems);

      // Create main order - SINGLE ORDER for all items
      const orderData = {
        user_id: user?.id,
        total_amount: totalAmount,
        parent_notes: parentNotes || null,
        status: 'pending',
        payment_status: 'pending',
        order_number: orderId,
        midtrans_order_id: orderId,
        order_date: new Date().toISOString().split('T')[0] // Today's date as order date
      };

      console.log('Creating order with data:', orderData);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      console.log('Order created successfully:', order);

      // Create order line items - ALL items go to the SAME order
      const orderLineItems = cartItems.map(item => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        child_id: item.child_id,
        child_name: item.child_name,
        child_class: item.child_class,
        delivery_date: item.delivery_date,
        order_date: new Date().toISOString().split('T')[0],
        quantity: item.quantity,
        unit_price: item.price,
        notes: item.notes
      }));

      console.log('Creating order line items:', orderLineItems);

      const { error: lineItemsError } = await supabase
        .from('order_line_items')
        .insert(orderLineItems);

      if (lineItemsError) throw lineItemsError;

      console.log('Order line items created successfully');

      // Create old format order items for compatibility (using first item as representative)
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      console.log('Legacy order items created successfully');

      // Prepare payment data
      const customerDetails = {
        first_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Customer',
        email: user?.email,
        phone: user?.user_metadata?.phone || '08123456789',
      };

      const itemDetails = cartItems.map(item => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        name: `${item.name} - ${item.child_name} (${item.delivery_date})`,
      }));

      console.log('Creating payment for order:', orderId, 'Amount:', totalAmount);

      // Create payment transaction
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        'create-payment',
        {
          body: {
            orderId,
            amount: totalAmount,
            customerDetails,
            itemDetails,
          },
        }
      );

      if (paymentError) throw paymentError;

      console.log('Payment created successfully:', paymentData);

      // Save snap token to database
      if (paymentData.snap_token) {
        await supabase
          .from('orders')
          .update({ snap_token: paymentData.snap_token })
          .eq('id', order.id);
      }

      // Open Midtrans Snap
      if ((window as any).snap && paymentData.snap_token) {
        (window as any).snap.pay(paymentData.snap_token, {
          onSuccess: (result: any) => {
            console.log('Payment success:', result);
            toast({
              title: "Pembayaran Berhasil!",
              description: "Pesanan Anda telah dikonfirmasi dan sedang diproses.",
            });
            clearCart();
          },
          onPending: (result: any) => {
            console.log('Payment pending:', result);
            toast({
              title: "Menunggu Pembayaran",
              description: "Pembayaran Anda sedang diproses. Mohon tunggu konfirmasi.",
            });
            clearCart();
          },
          onError: (result: any) => {
            console.error('Payment error:', result);
            toast({
              title: "Pembayaran Gagal",
              description: "Terjadi kesalahan dalam proses pembayaran. Silakan coba lagi.",
              variant: "destructive",
            });
          },
          onClose: () => {
            console.log('Payment popup closed');
            toast({
              title: "Pembayaran Dibatalkan",
              description: "Anda membatalkan proses pembayaran.",
            });
          }
        });
      } else {
        throw new Error('Midtrans Snap not loaded or token not received');
      }
    } catch (error: any) {
      console.error('Error creating batch order:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal membuat pesanan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    cartItems,
    children,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    getTotalAmount,
    getTotalItems,
    clearCart,
    createBatchOrder,
    fetchChildren
  };
};
