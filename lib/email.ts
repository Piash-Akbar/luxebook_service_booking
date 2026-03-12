import nodemailer from "nodemailer";
import { Booking } from "@/types";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── Sent BEFORE payment (when user submits the booking form) ─────────────────
export async function sendBookingRequestEmail(booking: Booking) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(booking.servicePrice / 100);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, serif; background: #F5F0DC; color: #0D0D0D; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #FDFCF7; border: 1px solid #E5DEC8; }
    .header { background: #0D0D0D; padding: 40px; text-align: center; }
    .header h1 { color: #D4A843; font-size: 28px; letter-spacing: 3px; text-transform: uppercase; }
    .header p { color: #9E9E9E; font-size: 13px; margin-top: 6px; }
    .badge { display: inline-block; background: #2B6CB0; color: white; padding: 6px 18px; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-top: 24px; font-weight: 700; }
    .body { padding: 40px; }
    .greeting { font-size: 22px; margin-bottom: 16px; }
    .text { font-size: 15px; line-height: 1.7; color: #3D3D3D; margin-bottom: 20px; }
    .notice { background: #EBF8FF; border: 1px solid #90CDF4; padding: 16px 20px; margin: 20px 0; font-size: 14px; color: #2B6CB0; line-height: 1.6; }
    .card { background: #FAF8EF; border: 1px solid #E5DEC8; padding: 28px; margin: 24px 0; }
    .card-title { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #9E9E9E; margin-bottom: 16px; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E5DEC8; font-size: 14px; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #6B6B6B; }
    .detail-value { font-weight: 600; }
    .price-row { display: flex; justify-content: space-between; padding: 16px 0 0; font-size: 18px; font-weight: 700; }
    .price-value { color: #D4A843; }
    .footer { background: #0D0D0D; padding: 28px 40px; text-align: center; }
    .footer p { color: #6B6B6B; font-size: 12px; line-height: 1.8; }
    .footer a { color: #D4A843; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>LuxeBook</h1>
      <p>Premium Service Booking</p>
      <div class="badge">⏳ Booking Request Received</div>
    </div>
    <div class="body">
      <p class="greeting">Dear ${booking.userName},</p>
      <p class="text">We've received your booking request! Your appointment details are reserved. Please complete your payment to confirm the booking.</p>
      <div class="notice">
        <strong>⚠ Action Required:</strong> Your booking is currently <strong>pending payment</strong>. Please complete the Stripe checkout to confirm your appointment.
      </div>
      <div class="card">
        <p class="card-title">Booking Details</p>
        <div class="detail-row"><span class="detail-label">Reference</span><span class="detail-value">#${booking.id?.slice(0, 8).toUpperCase()}</span></div>
        <div class="detail-row"><span class="detail-label">Service</span><span class="detail-value">${booking.serviceName}</span></div>
        <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${booking.date}</span></div>
        <div class="detail-row"><span class="detail-label">Time</span><span class="detail-value">${booking.time}</span></div>
        <div class="detail-row"><span class="detail-label">Name</span><span class="detail-value">${booking.userName}</span></div>
        <div class="detail-row"><span class="detail-label">Phone</span><span class="detail-value">${booking.userPhone}</span></div>
        ${booking.notes ? `<div class="detail-row"><span class="detail-label">Notes</span><span class="detail-value">${booking.notes}</span></div>` : ""}
        <div class="price-row"><span>Amount Due</span><span class="price-value">${formattedPrice}</span></div>
      </div>
      <p class="text">Once payment is complete, you'll receive a final confirmation email. If you did not make this request, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>© 2024 LuxeBook · Premium Service Booking<br>Questions? <a href="mailto:${process.env.EMAIL_FROM}">Contact Support</a></p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"LuxeBook" <${process.env.EMAIL_FROM}>`,
    to: booking.userEmail,
    subject: `⏳ Booking Request Received — ${booking.serviceName} on ${booking.date}`,
    html,
  });
}

// ─── Sent AFTER successful Stripe payment (via webhook) ───────────────────────
export async function sendBookingConfirmationEmail(booking: Booking) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(booking.servicePrice / 100);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, serif; background: #F5F0DC; color: #0D0D0D; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #FDFCF7; border: 1px solid #E5DEC8; }
    .header { background: #0D0D0D; padding: 40px; text-align: center; }
    .header h1 { color: #D4A843; font-size: 28px; letter-spacing: 3px; text-transform: uppercase; }
    .header p { color: #9E9E9E; font-size: 13px; margin-top: 6px; }
    .badge { display: inline-block; background: #D4A843; color: #0D0D0D; padding: 6px 18px; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-top: 24px; font-weight: 700; }
    .body { padding: 40px; }
    .greeting { font-size: 22px; margin-bottom: 16px; }
    .text { font-size: 15px; line-height: 1.7; color: #3D3D3D; margin-bottom: 20px; }
    .card { background: #FAF8EF; border: 1px solid #E5DEC8; padding: 28px; margin: 24px 0; }
    .card-title { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #9E9E9E; margin-bottom: 16px; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E5DEC8; font-size: 14px; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #6B6B6B; }
    .detail-value { font-weight: 600; }
    .price-row { display: flex; justify-content: space-between; padding: 16px 0 0; font-size: 18px; font-weight: 700; }
    .price-value { color: #D4A843; }
    .footer { background: #0D0D0D; padding: 28px 40px; text-align: center; }
    .footer p { color: #6B6B6B; font-size: 12px; line-height: 1.8; }
    .footer a { color: #D4A843; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>LuxeBook</h1>
      <p>Premium Service Booking</p>
      <div class="badge">✓ Booking Confirmed</div>
    </div>
    <div class="body">
      <p class="greeting">Dear ${booking.userName},</p>
      <p class="text">Your booking is fully confirmed and payment received. We look forward to serving you!</p>
      <div class="card">
        <p class="card-title">Confirmed Booking</p>
        <div class="detail-row"><span class="detail-label">Booking ID</span><span class="detail-value">#${booking.id?.slice(0, 8).toUpperCase()}</span></div>
        <div class="detail-row"><span class="detail-label">Service</span><span class="detail-value">${booking.serviceName}</span></div>
        <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${booking.date}</span></div>
        <div class="detail-row"><span class="detail-label">Time</span><span class="detail-value">${booking.time}</span></div>
        <div class="detail-row"><span class="detail-label">Name</span><span class="detail-value">${booking.userName}</span></div>
        ${booking.notes ? `<div class="detail-row"><span class="detail-label">Notes</span><span class="detail-value">${booking.notes}</span></div>` : ""}
        <div class="price-row"><span>Total Paid</span><span class="price-value">${formattedPrice}</span></div>
      </div>
      <p class="text">We'll see you on <strong>${booking.date} at ${booking.time}</strong>. If you need to reschedule, please contact us.</p>
    </div>
    <div class="footer">
      <p>© 2024 LuxeBook · Premium Service Booking<br>Questions? <a href="mailto:${process.env.EMAIL_FROM}">Contact Support</a></p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"LuxeBook" <${process.env.EMAIL_FROM}>`,
    to: booking.userEmail,
    subject: `✓ Booking Confirmed — ${booking.serviceName} on ${booking.date}`,
    html,
  });
}

// ─── Admin notification ───────────────────────────────────────────────────────
export async function sendAdminNotificationEmail(booking: Booking) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(booking.servicePrice / 100);

  const isPaid = booking.paymentStatus === "paid";

  await transporter.sendMail({
    from: `"LuxeBook System" <${process.env.EMAIL_FROM}>`,
    to: process.env.EMAIL_FROM!,
    subject: `${isPaid ? "✅ Payment Received" : "📋 New Booking Request"}: ${booking.serviceName} — ${booking.userName}`,
    html: `
      <h2>${isPaid ? "✅ Payment Confirmed" : "📋 New Booking Request"}</h2>
      <p><strong>Customer:</strong> ${booking.userName} (${booking.userEmail})</p>
      <p><strong>Phone:</strong> ${booking.userPhone}</p>
      <p><strong>Service:</strong> ${booking.serviceName}</p>
      <p><strong>Date:</strong> ${booking.date} at ${booking.time}</p>
      <p><strong>Amount:</strong> ${formattedPrice}</p>
      <p><strong>Status:</strong> ${booking.status} / ${booking.paymentStatus}</p>
      <p><strong>Booking ID:</strong> ${booking.id}</p>
      ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ""}
    `,
  });
}
