"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { RiVipCrownFill } from "react-icons/ri";
import { HiSparkles, HiCheckCircle } from "react-icons/hi";
import { FaLock, FaBrain, FaVideo, FaBookOpen, FaFlask, FaClipboardList, FaArrowLeft } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  razorpay_subscription_id?: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string };
  theme: { color: string };
  handler: (response: RazorpayResponse) => void;
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const plans = [
  {
    id: "basic" as const,
    name: "Basic",
    price: 99,
    color: "from-zinc-400 to-zinc-300",
    border: "border-zinc-600 hover:border-zinc-400",
    activeBorder: "border-zinc-300",
    highlightBorder: "border-zinc-300 ring-2 ring-zinc-300/30",
    glow: "",
    badge: "bg-zinc-800 text-zinc-300",
    features: [
      "Access to Basic premium cards",
      "Detailed notes & theory",
      "Formula sheets",
      "50 AI-generated questions/month",
      "Basic mock tests (5/month)",
    ],
    locked: ["Video explanations", "Previous year questions (PYQ)", "Unlimited mock tests"],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: 199,
    color: "from-yellow-400 to-amber-300",
    border: "border-yellow-600/40 hover:border-yellow-400/60",
    activeBorder: "border-yellow-400",
    highlightBorder: "border-yellow-400 ring-2 ring-yellow-400/30",
    glow: "shadow-yellow-400/10",
    badge: "bg-yellow-900/50 text-yellow-300",
    popular: true,
    features: [
      "Everything in Basic",
      "Access to Pro + Basic premium cards",
      "Video explanations",
      "200+ Previous year questions (PYQ)",
      "Unlimited AI-generated questions",
      "20 Mock tests/month",
      "Performance analytics",
    ],
    locked: ["Elite exclusive cards", "Live doubt sessions"],
  },
  {
    id: "elite" as const,
    name: "Elite",
    price: 299,
    color: "from-yellow-300 to-orange-400",
    border: "border-orange-600/40 hover:border-orange-400/60",
    activeBorder: "border-orange-400",
    highlightBorder: "border-orange-400 ring-2 ring-orange-400/30",
    glow: "shadow-orange-400/10",
    badge: "bg-orange-900/50 text-orange-300",
    features: [
      "Everything in Pro",
      "Access to ALL premium cards",
      "500+ Previous year questions (PYQ)",
      "Unlimited mock tests",
      "3D interactive models (Chemistry, Physics, Biology)",
      "AI Doubt Solver — chat with AI tutor",
      "Spaced repetition flashcards",
      "Performance heatmap",
      "Exam countdown + daily targets",
      "Topper leaderboard",
      "Live doubt sessions",
      "Personalized study plan",
      "Priority support",
    ],
    locked: [],
  },
];

const whatsInside = [
  { icon: FaBookOpen,      label: "Detailed Notes",          desc: "Expert-written chapter summaries & theory" },
  { icon: FaFlask,         label: "Formula Sheets",          desc: "All formulas in one place, exam-ready" },
  { icon: FaClipboardList, label: "Previous Year Questions", desc: "Last 10 years PYQs with solutions" },
  { icon: FaBrain,         label: "AI Practice Questions",   desc: "Adaptive questions based on your weak areas" },
  { icon: FaVideo,         label: "Video Explanations",      desc: "Concept videos by top educators" },
  { icon: FaClipboardList, label: "Mock Tests",              desc: "Full-length timed tests with analysis" },
];

function SubscriptionContent() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightPlan = searchParams.get("highlight");

  const [loading, setLoading] = useState<string | null>(null);

  const dbUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const subscription = useQuery(
    api.subscriptions.getUserSubscription,
    dbUser ? { userId: dbUser._id } : "skip"
  );

  const createSubscription = useMutation(api.subscriptions.createSubscription);
  const cancelSubscription  = useMutation(api.subscriptions.cancelSubscription);

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload  = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (planId: "basic" | "pro" | "elite") => {
    if (!user || !dbUser) { router.push("/sign-in"); return; }
    setLoading(planId);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error("Failed to load payment gateway"); return; }

      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, userId: dbUser._id }),
      });

      const order = await res.json() as {
        orderId: string; amount: number; currency: string; keyId: string;
      };

      if (!order.orderId) throw new Error("Order creation failed");

      const options: RazorpayOptions = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Quizhub",
        description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan — Monthly`,
        order_id: order.orderId,
        prefill: {
          name: user.fullName ?? "",
          email: user.primaryEmailAddress?.emailAddress ?? "",
        },
        theme: { color: "#FF8D28" },
        handler: async (response: RazorpayResponse) => {
          await createSubscription({
            userId: dbUser._id,
            plan: planId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySubscriptionId: response.razorpay_subscription_id,
          });
          toast.success("🎉 Subscription activated! Welcome to Premium!");
          router.push("/quizzes");
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!dbUser) return;
    await cancelSubscription({ userId: dbUser._id });
    toast.success("Subscription cancelled");
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-6 space-y-16">

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
        >
          <FaArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Back</span>
        </button>

        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-2">
            <HiSparkles className="size-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-medium">Unlock Your Full Potential</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Go beyond free.<br />
            <span className="bg-linear-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Master every topic.
            </span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Premium gives you everything top rankers use — PYQs, video explanations,
            formula sheets, AI-powered practice, and unlimited mock tests.
          </p>
        </div>

        {/* Active subscription banner */}
        {subscription && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-center gap-3">
              <RiVipCrownFill className="size-6 text-yellow-400" />
              <div>
                <p className="text-white font-semibold">
                  {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan Active
                </p>
                <p className="text-zinc-400 text-sm">
                  Renews on {new Date(subscription.endDate).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric"
                  })}
                </p>
              </div>
            </div>
            <button onClick={handleCancel}
              className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 transition-colors">
              <MdCancel className="size-4" /> Cancel
            </button>
          </div>
        )}

        {/* What's inside */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white text-center">What you get with Premium</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {whatsInside.map((item) => (
              <div key={item.label}
                className="flex items-start gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <item.icon className="size-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-medium">{item.label}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white text-center">Choose your plan</h2>

          {/* Highlight message if redirected from a locked card */}
          {highlightPlan && !subscription && (
            <div className="text-center py-2 px-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-yellow-400 text-sm">
                ✨ You need the <span className="font-bold capitalize">{highlightPlan}</span> plan to access that content
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isHighlighted = highlightPlan === plan.id && !subscription;
              const isActive = subscription?.plan === plan.id;

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative rounded-2xl border-2 p-6 space-y-5 transition-all duration-200 bg-zinc-900 shadow-lg",
                    plan.glow,
                    isActive ? plan.activeBorder
                    : isHighlighted ? plan.highlightBorder
                    : plan.border
                  )}
                >
                  {plan.popular && !isHighlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-400 text-black">
                        Most Popular
                      </span>
                    </div>
                  )}
                  {isHighlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-400 text-black animate-pulse">
                        ← Unlock this
                      </span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${plan.badge}`}>
                        {plan.name}
                      </span>
                      {isActive && <span className="text-xs text-green-400 font-medium">● Active</span>}
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-black text-white">₹{plan.price}</span>
                      <span className="text-zinc-400 text-sm mb-1">/month</span>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                        <HiCheckCircle className="size-4 text-green-400 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                    {plan.locked.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-zinc-600">
                        <FaLock className="size-3.5 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={!!loading || isActive}
                    className={cn(
                      "w-full py-3 rounded-xl font-bold text-sm transition-all duration-200",
                      isActive
                        ? "bg-green-900/30 border border-green-700/50 text-green-400 cursor-default"
                        : `bg-linear-to-r ${plan.color} text-black hover:opacity-90 hover:scale-[1.02] active:scale-100`,
                      "disabled:opacity-60 disabled:cursor-not-allowed"
                    )}
                  >
                    {loading === plan.id ? "Processing..."
                      : isActive ? "✓ Current Plan"
                      : `Get ${plan.name} →`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust signals */}
        <div className="text-center space-y-3">
          <p className="text-zinc-500 text-sm">
            🔒 Secure payments via Razorpay &nbsp;·&nbsp; Cancel anytime &nbsp;·&nbsp; Instant activation
          </p>
          <p className="text-zinc-600 text-xs">
            Thousands of students have improved their scores with Quizhub Premium
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={null}>
      <SubscriptionContent />
    </Suspense>
  );
}