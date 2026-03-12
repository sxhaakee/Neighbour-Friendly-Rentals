import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Server-side Razorpay payment signature verification.
 * This prevents attackers from spoofing payment success callbacks.
 * 
 * The client sends the payment details after Razorpay callback,
 * and this route verifies the signature using the secret key
 * (which is NEVER exposed to the client).
 */
export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required payment verification fields' },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error('[Payment Verify] RAZORPAY_KEY_SECRET is not set');
      return NextResponse.json(
        { error: 'Payment verification unavailable' },
        { status: 500 }
      );
    }

    // Razorpay signature verification:
    // HMAC-SHA256(order_id + "|" + payment_id, secret) === signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      console.warn('[Payment Verify] Invalid signature for payment:', razorpay_payment_id);
      return NextResponse.json(
        { verified: false, error: 'Payment signature verification failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({ verified: true });
  } catch (error: any) {
    console.error('[Payment Verify] Error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
