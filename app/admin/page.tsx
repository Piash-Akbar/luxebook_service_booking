"use client";

import { useState, useEffect, useCallback } from "react";
import { Booking } from "@/types";
import Link from "next/link";

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  pending: { bg: "#FFF9EC", color: "#B8891E", border: "#E8C97A" },
  confirmed: { bg: "#F0FFF4", color: "#276749", border: "#9AE6B4" },
  completed: { bg: "#EBF8FF", color: "#2B6CB0", border: "#90CDF4" },
  cancelled: { bg: "#FFF5F5", color: "#C53030", border: "#FEB2B2" },
};

const PAYMENT_COLORS: Record<string, { color: string }> = {
  pending: { color: "#B8891E" },
  paid: { color: "#276749" },
  failed: { color: "#C53030" },
  refunded: { color: "#6B6B6B" },
};

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        headers: { "x-admin-key": adminKey },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBookings(data.bookings);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  const handleLogin = async () => {
    if (!adminKey.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        headers: { "x-admin-key": adminKey },
      });
      const data = await res.json();
      if (res.ok) {
        setBookings(data.bookings);
        setIsAuthenticated(true);
      } else if (res.status === 401) {
        setError("Invalid admin key. Check your ADMIN_SECRET_KEY in .env.local");
      } else {
        setError(`Server error (${res.status}): ${data.error || "Unknown error"}`);
      }
    } catch (err: unknown) {
      setError(`Connection failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId: string, status: string) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ bookingId, status }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: status as Booking["status"] } : b))
        );
        if (selectedBooking?.id === bookingId) {
          setSelectedBooking((prev) => prev ? { ...prev, status: status as Booking["status"] } : null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm("Delete this booking permanently?")) return;
    try {
      const res = await fetch("/api/bookings", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ bookingId }),
      });
      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== bookingId));
        if (selectedBooking?.id === bookingId) setSelectedBooking(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = bookings
    .filter((b) => filter === "all" || b.status === filter)
    .filter(
      (b) =>
        !searchTerm ||
        b.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    pending: bookings.filter((b) => b.status === "pending").length,
    revenue: bookings
      .filter((b) => b.paymentStatus === "paid")
      .reduce((sum, b) => sum + b.servicePrice, 0),
  };

  if (!isAuthenticated) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--obsidian)",
          backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(212,168,67,0.08) 0%, transparent 60%)",
          padding: 24,
        }}
      >
        <div style={{ background: "var(--ivory)", maxWidth: 420, width: "100%", animation: "fadeUp 0.4s ease" }}>
          <div style={{ background: "var(--obsidian)", padding: "32px 40px", borderBottom: "2px solid var(--gold)" }}>
            <p style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)", marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>
              Admin Access
            </p>
            <h1 className="font-display" style={{ fontSize: 26, color: "white", fontWeight: 500 }}>
              LuxeBook Admin
            </h1>
          </div>
          <div style={{ padding: 40 }}>
            <label style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8, color: "#6B6B6B" }}>
              Admin Secret Key
            </label>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Enter your admin key..."
              className="input-field"
              style={{ marginBottom: 16 }}
            />
            {error && <p style={{ fontSize: 13, color: "#E53E3E", marginBottom: 16 }}>{error}</p>}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="btn-primary"
              style={{ width: "100%" }}
            >
              {loading ? "Authenticating..." : "Access Dashboard →"}
            </button>
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <Link href="/" style={{ fontSize: 13, color: "#9E9E9E", textDecoration: "none" }}>
                ← Back to site
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#F5F4F0" }}>
      {/* Top bar */}
      <nav style={{ background: "var(--obsidian)", padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "var(--gold)" }}>◆</span>
          <span className="font-display" style={{ color: "white", fontSize: 18, fontWeight: 500, letterSpacing: 1 }}>
            LuxeBook Admin
          </span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={fetchBookings} className="btn-ghost" style={{ color: "white", borderColor: "rgba(255,255,255,0.15)", fontSize: 11, padding: "6px 14px" }}>
            ↺ Refresh
          </button>
          <Link href="/" style={{ fontSize: 12, color: "#6B6B6B", textDecoration: "none", letterSpacing: 1 }}>
            View Site →
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Bookings", value: stats.total, icon: "📋" },
            { label: "Confirmed", value: stats.confirmed, icon: "✅" },
            { label: "Pending", value: stats.pending, icon: "⏳" },
            { label: "Total Revenue", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(stats.revenue / 100), icon: "💰" },
          ].map((stat) => (
            <div key={stat.label} style={{ background: "white", border: "1px solid var(--border)", padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>{stat.label}</p>
                  <p className="font-display" style={{ fontSize: 28, fontWeight: 500 }}>{stat.value}</p>
                </div>
                <span style={{ fontSize: 24 }}>{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selectedBooking ? "1fr 380px" : "1fr", gap: 20, alignItems: "start" }}>
          {/* Bookings table */}
          <div style={{ background: "white", border: "1px solid var(--border)" }}>
            {/* Filters */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Search by name, email, or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1, minWidth: 200, padding: "8px 14px", border: "1px solid var(--border)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none" }}
              />
              {["all", "pending", "confirmed", "completed", "cancelled"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "6px 14px",
                    fontSize: 11,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    border: "1px solid",
                    cursor: "pointer",
                    borderColor: filter === f ? "var(--obsidian)" : "var(--border)",
                    background: filter === f ? "var(--obsidian)" : "transparent",
                    color: filter === f ? "white" : "var(--obsidian)",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ padding: 48, textAlign: "center", color: "#9E9E9E" }}>Loading bookings...</div>
            ) : error ? (
              <div style={{ padding: 48, textAlign: "center", color: "#E53E3E" }}>{error}</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center", color: "#9E9E9E" }}>No bookings found</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)" }}>
                      {["ID", "Customer", "Service", "Date & Time", "Status", "Payment", "Actions"].map((h) => (
                        <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#9E9E9E", fontWeight: 500, whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((booking) => {
                      const sc = STATUS_COLORS[booking.status] || STATUS_COLORS.pending;
                      const pc = PAYMENT_COLORS[booking.paymentStatus] || PAYMENT_COLORS.pending;
                      return (
                        <tr
                          key={booking.id}
                          onClick={() => setSelectedBooking(selectedBooking?.id === booking.id ? null : booking)}
                          style={{
                            borderBottom: "1px solid var(--border)",
                            cursor: "pointer",
                            background: selectedBooking?.id === booking.id ? "var(--ivory-100)" : "white",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => { if (selectedBooking?.id !== booking.id) (e.currentTarget as HTMLTableRowElement).style.background = "#FAFAFA"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = selectedBooking?.id === booking.id ? "var(--ivory-100)" : "white"; }}
                        >
                          <td style={{ padding: "12px 16px", fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#6B6B6B" }}>
                            #{booking.id?.slice(0, 6).toUpperCase()}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <p style={{ fontSize: 13, fontWeight: 500 }}>{booking.userName}</p>
                            <p style={{ fontSize: 12, color: "#9E9E9E" }}>{booking.userEmail}</p>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13 }}>{booking.serviceName}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <p style={{ fontSize: 13 }}>{booking.date}</p>
                            <p style={{ fontSize: 12, color: "#9E9E9E" }}>{booking.time}</p>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{
                              padding: "3px 10px",
                              fontSize: 11,
                              letterSpacing: 0.5,
                              textTransform: "uppercase",
                              background: sc.bg,
                              color: sc.color,
                              border: `1px solid ${sc.border}`,
                              fontWeight: 600,
                            }}>
                              {booking.status}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontSize: 12, color: pc.color, fontWeight: 600, textTransform: "uppercase" }}>
                              {booking.paymentStatus}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <select
                                value={booking.status}
                                onChange={(e) => updateStatus(booking.id!, e.target.value)}
                                style={{ fontSize: 11, padding: "4px 8px", border: "1px solid var(--border)", background: "white", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              <button
                                onClick={() => deleteBooking(booking.id!)}
                                style={{ padding: "4px 8px", fontSize: 12, background: "none", border: "1px solid #FEB2B2", color: "#C53030", cursor: "pointer" }}
                              >
                                ×
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ padding: "12px 24px", borderTop: "1px solid var(--border)", fontSize: 12, color: "#9E9E9E" }}>
              Showing {filtered.length} of {bookings.length} bookings
            </div>
          </div>

          {/* Booking detail panel */}
          {selectedBooking && (
            <div style={{ background: "white", border: "1px solid var(--border)", position: "sticky", top: 20 }}>
              <div style={{ background: "var(--obsidian)", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 10, letterSpacing: 3, color: "var(--gold)", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>BOOKING DETAIL</p>
                  <p className="font-display" style={{ color: "white", fontSize: 18, fontWeight: 500 }}>#{selectedBooking.id?.slice(0, 8).toUpperCase()}</p>
                </div>
                <button onClick={() => setSelectedBooking(null)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", color: "white", width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>
                  ×
                </button>
              </div>

              <div style={{ padding: 24 }}>
                {[
                  { label: "Customer Name", value: selectedBooking.userName },
                  { label: "Email", value: selectedBooking.userEmail },
                  { label: "Phone", value: selectedBooking.userPhone },
                  { label: "Service", value: selectedBooking.serviceName },
                  { label: "Date", value: selectedBooking.date },
                  { label: "Time", value: selectedBooking.time },
                  { label: "Amount", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(selectedBooking.servicePrice / 100) },
                  { label: "Payment", value: selectedBooking.paymentStatus },
                  { label: "Booked At", value: new Date(selectedBooking.createdAt).toLocaleString() },
                ].map((row) => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--ivory-200)", fontSize: 13 }}>
                    <span style={{ color: "#9E9E9E" }}>{row.label}</span>
                    <span style={{ fontWeight: 500, textAlign: "right", maxWidth: 200, wordBreak: "break-word" }}>{row.value}</span>
                  </div>
                ))}

                {selectedBooking.notes && (
                  <div style={{ marginTop: 16, padding: 16, background: "var(--ivory-100)", border: "1px solid var(--border)" }}>
                    <p style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#9E9E9E", marginBottom: 6 }}>Notes</p>
                    <p style={{ fontSize: 13, lineHeight: 1.6 }}>{selectedBooking.notes}</p>
                  </div>
                )}

                <div style={{ marginTop: 20 }}>
                  <p style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#9E9E9E", marginBottom: 8 }}>Update Status</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {["pending", "confirmed", "completed", "cancelled"].map((s) => {
                      const sc = STATUS_COLORS[s];
                      return (
                        <button
                          key={s}
                          onClick={() => updateStatus(selectedBooking.id!, s)}
                          style={{
                            padding: "8px 12px",
                            fontSize: 11,
                            letterSpacing: 1,
                            textTransform: "uppercase",
                            border: `1px solid ${sc.border}`,
                            background: selectedBooking.status === s ? sc.bg : "white",
                            color: sc.color,
                            cursor: "pointer",
                            fontWeight: selectedBooking.status === s ? 700 : 400,
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => deleteBooking(selectedBooking.id!)}
                  style={{
                    marginTop: 16,
                    width: "100%",
                    padding: "10px",
                    fontSize: 12,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    border: "1px solid #FEB2B2",
                    background: "none",
                    color: "#C53030",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Delete Booking
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
