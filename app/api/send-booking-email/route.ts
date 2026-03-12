import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sendBookingRequestEmail, sendAdminNotificationEmail } from "@/lib/email";
import { Booking } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    // Fetch the booking from Firestore
    const bookingSnap = await adminDb.collection("bookings").doc(bookingId).get();

    if (!bookingSnap.exists) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const booking = { id: bookingId, ...bookingSnap.data() } as Booking;

    // Send emails
    await Promise.all([
      sendBookingRequestEmail(booking),
      sendAdminNotificationEmail(booking),
    ]);

    console.log("✅ Pre-payment emails sent to:", booking.userEmail);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("❌ Send booking email error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 }
    );
  }
}
