import { NextRequest, NextResponse } from "next/server";

// Plan prices in paise (₹ × 100)
const PLAN_PRICES = {
  basic: 9900,   // ₹99
  pro: 19900,    // ₹199
  elite: 29900,  // ₹299
};

export async function POST(req: NextRequest) {
  // ✅ Check keys first — return mock response if not configured yet
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json(
      { error: "Payment gateway not configured yet. Please try again later." },
      { status: 503 }
    );
  }

  try {
    const { plan, userId } = await req.json() as {
      plan: string;
      userId: string;
    };

    if (!plan || !PLAN_PRICES[plan as keyof typeof PLAN_PRICES]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // ✅ Import and initialize Razorpay INSIDE the handler — never at module level
    const Razorpay = (await import("razorpay")).default;
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

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