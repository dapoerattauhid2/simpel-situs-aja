
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== CREATE PAYMENT FUNCTION START ===');
    console.log('Method:', req.method);
    console.log('Headers:', Object.fromEntries(req.headers.entries()));

    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body received:', JSON.stringify(requestBody, null, 2));
    } catch (parseError) {
      console.error('Failed to parse JSON body:', parseError);
      throw new Error('Invalid JSON in request body');
    }

    const { orderId, amount, customerDetails, itemDetails, batchOrderIds } = requestBody;

    console.log('Extracted parameters:', {
      orderId,
      amount,
      customerDetails,
      itemDetails: itemDetails ? `${itemDetails.length} items` : 'none',
      batchOrderIds: batchOrderIds ? `${batchOrderIds.length} orders` : 'none'
    });

    // Validate required fields
    if (!orderId) {
      console.error('Order ID is missing');
      throw new Error('Order ID is required');
    }

    if (!amount || amount <= 0) {
      console.error('Invalid amount:', amount);
      throw new Error('Valid amount is required');
    }

    const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY');
    if (!serverKey) {
      console.error('Midtrans server key not configured');
      throw new Error('Midtrans server key not configured');
    }

    console.log('Server key found, proceeding with Midtrans');

    // If this is a batch payment, save the batch mapping first
    if (batchOrderIds && batchOrderIds.length > 0) {
      console.log('Processing batch payment for orders:', batchOrderIds);
      
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (supabaseUrl && supabaseServiceKey) {
        console.log('Saving batch mapping to database');
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        // Save batch order mapping
        const batchMappings = batchOrderIds.map((originalOrderId: string) => ({
          batch_id: orderId,
          order_id: originalOrderId
        }));
        
        console.log('Batch mappings to insert:', batchMappings);
        
        try {
          const { error: batchError } = await supabase
            .from('batch_orders')
            .insert(batchMappings);
            
          if (batchError) {
            console.error('Error saving batch mapping:', batchError);
            throw new Error(`Failed to save batch mapping: ${batchError.message}`);
          } else {
            console.log('Batch mapping saved successfully');
          }
        } catch (dbError) {
          console.error('Database error during batch mapping:', dbError);
          throw new Error(`Database error: ${dbError.message}`);
        }
      } else {
        console.error('Supabase configuration missing for batch mapping');
        console.error('SUPABASE_URL:', supabaseUrl ? 'present' : 'missing');
        console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'present' : 'missing');
      }
    }

    // Prepare default customer details if not provided
    const defaultCustomerDetails = {
      first_name: 'Customer',
      email: 'customer@example.com',
      phone: '08123456789',
    };

    const finalCustomerDetails = { ...defaultCustomerDetails, ...customerDetails };
    console.log('Customer details:', finalCustomerDetails);

    // Prepare default item details if not provided
    const finalItemDetails = itemDetails && itemDetails.length > 0 ? itemDetails : [
      {
        id: orderId,
        price: amount,
        quantity: 1,
        name: 'Payment',
      }
    ];

    console.log('Item details:', finalItemDetails);

    // Create Midtrans transaction
    const midtransPayload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: finalCustomerDetails,
      item_details: finalItemDetails,
      credit_card: {
        secure: true,
      },
    };

    console.log('Midtrans payload:', JSON.stringify(midtransPayload, null, 2));

    try {
      const midtransResponse = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(serverKey + ':')}`,
        },
        body: JSON.stringify(midtransPayload),
      });

      console.log('Midtrans response status:', midtransResponse.status);

      if (!midtransResponse.ok) {
        const errorText = await midtransResponse.text();
        console.error('Midtrans error response:', errorText);
        throw new Error(`Midtrans API error: ${midtransResponse.status} - ${errorText}`);
      }

      const midtransData = await midtransResponse.json();
      console.log('Midtrans success response:', midtransData);

      return new Response(
        JSON.stringify({
          snap_token: midtransData.token,
          redirect_url: midtransData.redirect_url,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (midtransError) {
      console.error('Midtrans API call failed:', midtransError);
      throw new Error(`Midtrans API call failed: ${midtransError.message}`);
    }

  } catch (error) {
    console.error('=== ERROR IN CREATE-PAYMENT FUNCTION ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.toString(),
        type: error.constructor.name
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
