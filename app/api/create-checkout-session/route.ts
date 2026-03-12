import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin";
import { sendBookingRequestEmail, sendAdminNotificationEmail } from "@/lib/email";
import { Booking, Service } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { service, userName, userEmail, userPhone, date, time, notes }: {
      service: Service;
      userName: string;
      userEmail: string;
      userPhone: string;
      date: string;
      time: string;
      notes?: string;
    } = body;

    if (!service || !userName || !userEmail || !userPhone || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 1. Save pending booking to Firestore
    const bookingRef = adminDb.collection("bookings").doc();
    const booking: Booking = {
      id: bookingRef.id,
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      userName,
      userEmail,
      userPhone,
      date,
      time,
      notes: notes || "",
      status: "pending",
      paymentStatus: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await bookingRef.set(booking);

    // 2. Send booking request email IMMEDIATELY (before payment)
    try {
      await Promise.all([
        sendBookingRequestEmail(booking),
        sendAdminNotificationEmail(booking),
      ]);
      console.log("✅ Pre-payment emails sent to:", userEmail);
    } catch (emailErr) {
      // Log but don't block checkout — booking is saved, email failed
      console.error("❌ Pre-payment email failed:", emailErr);
    }

    // 3. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: service.name,
              description: `${service.duration} · ${service.category} · ${date} at ${time}`,
            },
            unit_amount: service.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: bookingRef.id,
        userName,
        userEmail,
        date,
        time,
      },
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingRef.id}`,
      cancel_url: `${appUrl}/cancel?booking_id=${bookingRef.id}`,
    });

    // 4. Update booking with Stripe session ID
    await bookingRef.update({
      stripeSessionId: session.id,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: unknown) {
    console.error("Checkout session error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
