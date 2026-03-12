"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function CancelPage() {
  const params = useSearchParams();
  const bookingId = params.get("booking_id");

  useEffect(() => {
    if (!bookingId) return;
    // Mark as cancelled
    updateDoc(doc(db, "bookings", bookingId), {
      status: "cancelled",
      paymentStatus: "failed",
      updatedAt: new Date().toISOString(),
    }).catch(console.error);
  }, [bookingId]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--obsidian)",
      }}
    >
      <div
        style={{
          background: "var(--ivory)",
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          animation: "fadeUp 0.5s ease",
        }}
      >
        <div style={{ background: "var(--obsidian)", padding: 40 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(229,62,62,0.1)",
              border: "2px solid rgba(229,62,62,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: 28,
              color: "#E53E3E",
            }}
          >
            ×
          </div>
          <h1
            className="font-display"
            style={{ fontSize: 28, color: "white", fontWeight: 500, marginBottom: 8 }}
          >
            Payment Cancelled
          </h1>
          <p style={{ color: "#9E9E9E", fontSize: 14 }}>
            Your booking was not completed. No charge was made.
          </p>
        </div>

        <div style={{ padding: 40 }}>
          <p style={{ fontSize: 15, color: "#6B6B6B", lineHeight: 1.7, marginBottom: 32 }}>
            If you changed your mind or encountered an issue, you can try booking again
            at any time. Your information has been saved.
          </p>
          <Link href="/" className="btn-primary" style={{ textDecoration: "none", display: "block" }}>
            Return to Services
          </Link>
        </div>
      </div>
    </main>
  );
}
