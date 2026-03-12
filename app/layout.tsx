import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LuxeBook — Premium Service Booking",
  description: "Book premium services with ease. Massage, beauty, fitness, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
