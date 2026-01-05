// Razorpay Payment Service
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact?: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export const paymentService = {
  // Initialize Razorpay
  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  // Create Razorpay order
  async createOrder(amount: number, bookingId: string) {
    // In production, this should call your backend API
    // For now, we'll create a mock order ID
    // You'll need to implement a backend endpoint that creates a Razorpay order
    
    // Backend endpoint should look like:
    // POST /api/payment/create-order
    // Body: { amount, bookingId }
    // Response: { orderId, amount, currency }
    
    return {
      orderId: `order_${Date.now()}`,
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
    };
  },

  // Display Razorpay checkout
  async displayRazorpay(
    amount: number,
    bookingId: string,
    userDetails: { name: string; email: string; phone?: string },
    onSuccess: (paymentId: string, orderId: string) => void,
    onFailure: () => void
  ) {
    // Load Razorpay script
    const isLoaded = await this.loadRazorpayScript();
    if (!isLoaded) {
      alert('Failed to load Razorpay. Please check your internet connection.');
      return;
    }

    // Create order
    const order = await this.createOrder(amount, bookingId);

    const options: RazorpayOptions = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'NFR - Neighbour Rentals',
      description: 'Rental Payment',
      order_id: order.orderId,
      handler: (response: RazorpayResponse) => {
        // Payment successful
        onSuccess(response.razorpay_payment_id, response.razorpay_order_id);
      },
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: userDetails.phone,
      },
      theme: {
        color: '#10B981',
      },
      modal: {
        ondismiss: () => {
          onFailure();
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  },

  // Verify payment (should be done on backend)
  async verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string
  ): Promise<boolean> {
    // In production, this should call your backend API
    // Backend endpoint should verify the signature using Razorpay secret
    
    // Backend endpoint should look like:
    // POST /api/payment/verify
    // Body: { orderId, paymentId, signature }
    // Response: { verified: boolean }
    
    console.log('Payment verification:', { orderId, paymentId, signature });
    return true; // Mock verification
  },
};
