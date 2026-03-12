"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Booking } from "@/types";

export default function SuccessPage() {
  const params = useSearchParams();
  const bookingId = params.get("booking_id");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) { setLoading(false); return; }
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, "bookings", bookingId));
        if (snap.exists()) setBooking({ id: snap.id, ...snap.data() } as Booking);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    // Poll briefly to wait for webhook
    setTimeout(fetch, 1500);
  }, [bookingId]);

  const formattedPrice = booking
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
        booking.servicePrice / 100
      )
    : "";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--obsidian)",
        backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(212,168,67,0.1) 0%, transparent 60%)",
      }}
    >
      <div
        style={{
          background: "var(--ivory)",
          maxWidth: 520,
          width: "100%",
          animation: "fadeUp 0.5s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "var(--obsidian)",
            padding: 40,
            textAlign: "center",
            borderBottom: "2px solid var(--gold)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(212,168,67,0.15)",
              border: "2px solid var(--gold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: 28,
            }}
          >
            ✓
          </div>
          <h1
            className="font-display"
            style={{ fontSize: 28, color: "white", fontWeight: 500, marginBottom: 8 }}
          >
            Booking Confirmed!
          </h1>
          <p style={{ color: "#9E9E9E", fontSize: 14 }}>
            Your payment was successful and booking is confirmed.
          </p>
        </div>

        <div style={{ padding: 40 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  border: "2px solid var(--border)",
                  borderTopColor: "var(--gold)",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 12px",
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              <p style={{ fontSize: 14, color: "#9E9E9E" }}>Loading booking details...</p>
            </div>
          ) : booking ? (
            <>
              <p
                style={{
                  fontSize: 11,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: "#9E9E9E",
                  marginBottom: 20,
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                Booking Summary
              </p>

              {[
                { label: "Booking ID", value: `#${booking.id?.slice(0, 8).toUpperCase()}` },
                { label: "Service", value: booking.serviceName },
                { label: "Date", value: booking.date },
                { label: "Time", value: booking.time },
                { label: "Name", value: booking.userName },
                { label: "Email", value: booking.userEmail },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: "1px solid var(--border)",
                    fontSize: 14,
                  }}
                >
                  <span style={{ color: "#6B6B6B" }}>{row.label}</span>
                  <span style={{ fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "16px 0",
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                <span>Total Paid</span>
                <span className="font-display" style={{ color: "var(--gold)" }}>
                  {formattedPrice}
                </span>
              </div>

              <div
                style={{
                  background: "var(--ivory-100)",
                  border: "1px solid var(--border)",
                  padding: "14px 16px",
                  marginBottom: 24,
                  fontSize: 13,
                  color: "#6B6B6B",
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <span>📧</span>
                <span>
                  A confirmation email has been sent to <strong>{booking.userEmail}</strong>.
                  Please check your inbox.
                </span>
              </div>
            </>
          ) : (
            <p style={{ textAlign: "center", color: "#6B6B6B", padding: "20px 0" }}>
              Booking details not found. Check your email for confirmation.
            </p>
          )}

          <Link href="/" className="btn-primary" style={{ width: "100%", textDecoration: "none", display: "block", textAlign: "center" }}>
            Book Another Service
          </Link>
        </div>
      </div>
    </main>
  );
}
