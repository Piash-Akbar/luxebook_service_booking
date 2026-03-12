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
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Booking Confirmation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', serif; background: #F5F0DC; color: #0D0D0D; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #FDFCF7; border: 1px solid #E5DEC8; }
    .header { background: #0D0D0D; padding: 40px; text-align: center; }
    .header h1 { color: #D4A843; font-size: 28px; letter-spacing: 3px; text-transform: uppercase; }
    .header p { color: #9E9E9E; font-size: 13px; margin-top: 6px; letter-spacing: 1px; }
    .badge { display: inline-block; background: #D4A843; color: #0D0D0D; padding: 6px 18px; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 30px auto; font-weight: 700; }
    .body { padding: 40px; }
    .greeting { font-size: 22px; margin-bottom: 16px; }
    .text { font-size: 15px; line-height: 1.7; color: #3D3D3D; margin-bottom: 24px; }
    .card { background: #FAF8EF; border: 1px solid #E5DEC8; padding: 28px; margin: 28px 0; }
    .card-title { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #9E9E9E; margin-bottom: 16px; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E5DEC8; font-size: 14px; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #6B6B6B; }
    .detail-value { font-weight: 600; color: #0D0D0D; }
    .price-row { display: flex; justify-content: space-between; padding: 16px 0 0; font-size: 18px; font-weight: 700; }
    .price-value { color: #D4A843; }
    .divider { border: none; border-top: 1px solid #E5DEC8; margin: 24px 0; }
    .footer { background: #0D0D0D; padding: 28px 40px; text-align: center; }
    .footer p { color: #6B6B6B; font-size: 12px; line-height: 1.8; }
    .footer a { color: #D4A843; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Luxe Book</h1>
      <p>Premium Service Booking</p>
    </div>
    <div class="body" style="text-align:center">
      <div class="badge">✓ Booking Confirmed</div>
    </div>
    <div class="body">
      <p class="greeting">Dear ${booking.userName},</p>
      <p class="text">
        Your booking has been confirmed and payment received. We look forward to serving you.
        Below are the details of your reservation.
      </p>

      <div class="card">
        <p class="card-title">Booking Details</p>
        <div class="detail-row">
          <span class="detail-label">Booking ID</span>
          <span class="detail-value">#${booking.id?.slice(0, 8).toUpperCase()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Service</span>
          <span class="detail-value">${booking.serviceName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date</span>
          <span class="detail-value">${booking.date}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time</span>
          <span class="detail-value">${booking.time}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Name</span>
          <span class="detail-value">${booking.userName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email</span>
          <span class="detail-value">${booking.userEmail}</span>
        </div>
        ${booking.notes ? `
        <div class="detail-row">
          <span class="detail-label">Notes</span>
          <span class="detail-value">${booking.notes}</span>
        </div>` : ""}
        <hr class="divider">
        <div class="price-row">
          <span>Total Paid</span>
          <span class="price-value">${formattedPrice}</span>
        </div>
      </div>

      <p class="text">
        If you have any questions or need to make changes, please don't hesitate to contact us.
        We'll send you a reminder closer to your appointment date.
      </p>
    </div>
    <div class="footer">
      <p>© 2024 LuxeBook · Premium Service Booking<br>
      Questions? <a href="mailto:${process.env.EMAIL_FROM}">Contact Support</a></p>
    </div>
  </div>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"LuxeBook" <${process.env.EMAIL_FROM}>`,
    to: booking.userEmail,
    subject: `✓ Booking Confirmed — ${booking.serviceName} on ${booking.date}`,
    html,
  });
}

export async function sendAdminNotificationEmail(booking: Booking) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(booking.servicePrice / 100);

  await transporter.sendMail({
    from: `"LuxeBook System" <${process.env.EMAIL_FROM}>`,
    to: process.env.EMAIL_FROM!,
    subject: `New Booking: ${booking.serviceName} — ${booking.userName}`,
    html: `
      <h2>New Booking Received</h2>
      <p><strong>Customer:</strong> ${booking.userName} (${booking.userEmail})</p>
      <p><strong>Phone:</strong> ${booking.userPhone}</p>
      <p><strong>Service:</strong> ${booking.serviceName}</p>
      <p><strong>Date:</strong> ${booking.date} at ${booking.time}</p>
      <p><strong>Amount:</strong> ${formattedPrice}</p>
      <p><strong>Booking ID:</strong> ${booking.id}</p>
      ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ""}
    `,
  });
}
