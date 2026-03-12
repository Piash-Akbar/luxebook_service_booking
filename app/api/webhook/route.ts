import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin";
import { sendBookingConfirmationEmail, sendAdminNotificationEmail } from "@/lib/email";
import { Booking } from "@/types";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Webhook error" },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      if (!bookingId) {
        console.error("No bookingId in session metadata");
        return NextResponse.json({ received: true });
      }

      // Update booking in Firestore
      const bookingRef = adminDb.collection("bookings").doc(bookingId);
      await bookingRef.update({
        status: "confirmed",
        paymentStatus: "paid",
        stripePaymentIntentId: session.payment_intent,
        updatedAt: new Date().toISOString(),
      });

      // Fetch updated booking for email
      const bookingSnap = await bookingRef.get();
      const booking = { id: bookingId, ...bookingSnap.data() } as Booking;

      // Send confirmation emails (non-blocking)
      try {
        await Promise.all([
          sendBookingConfirmationEmail(booking),
          sendAdminNotificationEmail(booking),
        ]);
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
        // Don't fail the webhook over email errors
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      if (bookingId) {
        await adminDb.collection("bookings").doc(bookingId).update({
          status: "cancelled",
          paymentStatus: "failed",
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}