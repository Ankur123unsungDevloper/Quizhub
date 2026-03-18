import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Plan prices in paise (₹ × 100)
const PLAN_PRICES = {
  basic: 9900,   // ₹99
  pro: 19900,    // ₹199
  elite: 29900,  // ₹299
};

export async function POST(req: NextRequest) {
  try {
    const { plan, userId } = await req.json();

    if (!plan || !PLAN_PRICES[plan as keyof typeof PLAN_PRICES]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: PLAN_PRICES[plan as keyof typeof PLAN_PRICES],
      currency: "INR",
      receipt: `quizhub_${userId}_${Date.now()}`,
      notes: { plan, userId },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}