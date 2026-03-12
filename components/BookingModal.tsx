"use client";

import { useState } from "react";
import { Service, BookingFormData } from "@/types";
import { loadStripe } from "@stripe/stripe-js";

interface BookingModalProps {
  service: Service;
  onClose: () => void;
}

const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
];

export default function BookingModal({ service, onClose }: BookingModalProps) {
  const [step, setStep] = useState<"form" | "loading">("form");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  const [form, setForm] = useState<BookingFormData>({
    serviceId: service.id,
    userName: "",
    userEmail: "",
    userPhone: "",
    date: "",
    time: "",
    notes: "",
  });

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(service.price / 100);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.userName.trim()) newErrors.userName = "Name is required";
    if (!form.userEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.userEmail = "Valid email required";
    if (!form.userPhone.trim()) newErrors.userPhone = "Phone is required";
    if (!form.date) newErrors.date = "Date is required";
    if (!form.time) newErrors.time = "Time is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setStep("loading");
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, service }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create checkout");

      const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!key) throw new Error("Stripe publishable key is not set in .env.local");

      const stripe = await loadStripe(key);
      if (!stripe) throw new Error("Stripe failed to load");

      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStep("form");
    }
  };

  const inputStyle = (field: string) => ({
    width: "100%",
    background: "white",
    border: `1px solid ${errors[field] ? "#E53E3E" : "var(--border)"}`,
    padding: "12px 16px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: "var(--obsidian)",
    outline: "none",
    transition: "border-color 0.2s ease",
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13,13,13,0.7)",
        backdropFilter: "blur(8px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--ivory)",
          width: "100%",
          maxWidth: 580,
          maxHeight: "90vh",
          overflowY: "auto",
          animation: "fadeUp 0.3s ease",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            background: "var(--obsidian)",
            padding: "24px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p
              style={{
                fontSize: 10,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: 4,
                fontFamily: "'DM Mono', monospace",
              }}
            >
              Book Service
            </p>
            <h2
              className="font-display"
              style={{ fontSize: 20, color: "white", fontWeight: 500 }}
            >
              {service.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "white",
              width: 36,
              height: 36,
              cursor: "pointer",
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        {/* Service summary */}
        <div
          style={{
            padding: "16px 32px",
            background: "var(--ivory-100)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ fontSize: 24, color: "var(--gold)" }}>{service.icon}</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500 }}>{service.name}</p>
              <p style={{ fontSize: 12, color: "#9E9E9E" }}>{service.duration} · {service.category}</p>
            </div>
          </div>
          <div className="font-display" style={{ fontSize: 22, fontWeight: 600, color: "var(--gold)" }}>
            {formattedPrice}
          </div>
        </div>

        {step === "loading" ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <div
              style={{
                width: 48,
                height: 48,
                border: "2px solid var(--border)",
                borderTopColor: "var(--gold)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 20px",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <p className="font-display" style={{ fontSize: 18, marginBottom: 8 }}>
              Redirecting to Checkout...
            </p>
            <p style={{ fontSize: 14, color: "#9E9E9E" }}>Please wait while we prepare your secure payment.</p>
          </div>
        ) : (
          <div style={{ padding: 32 }}>
            <p
              style={{
                fontSize: 11,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "#9E9E9E",
                marginBottom: 24,
                fontFamily: "'DM Mono', monospace",
              }}
            >
              Your Details
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Full Name */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6, color: "#6B6B6B" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.userName}
                  onChange={(e) => setForm({ ...form, userName: e.target.value })}
                  style={inputStyle("userName")}
                />
                {errors.userName && <p style={{ fontSize: 12, color: "#E53E3E", marginTop: 4 }}>{errors.userName}</p>}
              </div>

              {/* Email */}
              <div>
                <label style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6, color: "#6B6B6B" }}>
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={form.userEmail}
                  onChange={(e) => setForm({ ...form, userEmail: e.target.value })}
                  style={inputStyle("userEmail")}
                />
                {errors.userEmail && <p style={{ fontSize: 12, color: "#E53E3E", marginTop: 4 }}>{errors.userEmail}</p>}
              </div>

              {/* Phone */}
              <div>
                <label style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6, color: "#6B6B6B" }}>
                  Phone *
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={form.userPhone}
                  onChange={(e) => setForm({ ...form, userPhone: e.target.value })}
                  style={inputStyle("userPhone")}
                />
                {errors.userPhone && <p style={{ fontSize: 12, color: "#E53E3E", marginTop: 4 }}>{errors.userPhone}</p>}
              </div>

              {/* Date */}
              <div>
                <label style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6, color: "#6B6B6B" }}>
                  Preferred Date *
                </label>
                <input
                  type="date"
                  min={minDate}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  style={inputStyle("date")}
                />
                {errors.date && <p style={{ fontSize: 12, color: "#E53E3E", marginTop: 4 }}>{errors.date}</p>}
              </div>

              {/* Time */}
              <div>
                <label style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6, color: "#6B6B6B" }}>
                  Preferred Time *
                </label>
                <select
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  style={{ ...inputStyle("time"), appearance: "none" }}
                >
                  <option value="">Select a time</option>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
                {errors.time && <p style={{ fontSize: 12, color: "#E53E3E", marginTop: 4 }}>{errors.time}</p>}
              </div>

              {/* Notes */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6, color: "#6B6B6B" }}>
                  Special Requests
                </label>
                <textarea
                  placeholder="Any special requirements or notes..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  style={{ ...inputStyle("notes"), resize: "vertical" }}
                />
              </div>
            </div>

            {/* Stripe notice */}
            <div
              style={{
                marginTop: 20,
                padding: "12px 16px",
                background: "var(--ivory-100)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 18 }}>🔒</span>
              <p style={{ fontSize: 12, color: "#6B6B6B" }}>
                Secure payment powered by <strong>Stripe</strong>. Your card details are never stored.
              </p>
            </div>

            {/* Submit */}
            <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
              <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="btn-primary"
                style={{ flex: 2 }}
              >
                <span>Proceed to Payment</span>
                <span style={{ fontSize: 16 }}>→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
