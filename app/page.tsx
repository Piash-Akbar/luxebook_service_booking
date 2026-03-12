"use client";

import { useState } from "react";
import { services, categories } from "@/lib/services-data";
import ServiceCard from "@/components/ServiceCard";
import BookingModal from "@/components/BookingModal";
import { Service } from "@/types";
import Link from "next/link";

export default function HomePage() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredServices =
    activeCategory === "All"
      ? services
      : services.filter((s) => s.category === activeCategory);

  const handleBook = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  return (
    <main className="min-h-screen" style={{ background: "var(--ivory)" }}>
      {/* Navigation */}
      <nav
        style={{
          borderBottom: "1px solid var(--border)",
          background: "rgba(253,252,247,0.95)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 32px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: "var(--gold)", fontSize: 20 }}>◆</span>
            <span
              className="font-display"
              style={{ fontSize: 20, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}
            >
              LuxeBook
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/admin" className="btn-ghost" style={{ fontSize: 11, padding: "8px 18px" }}>
              Admin Panel
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          background: "var(--obsidian)",
          padding: "100px 32px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(ellipse at 20% 50%, rgba(212,168,67,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(107,146,101,0.06) 0%, transparent 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
            opacity: 0.4,
          }}
        />

        <div style={{ position: "relative", maxWidth: 720, margin: "0 auto" }}>
          <p
            className="animate-fade-up stagger-1 opacity-0"
            style={{
              fontSize: 11,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: 20,
              fontFamily: "'DM Mono', monospace",
            }}
          >
            Premium Service Booking
          </p>
          <h1
            className="font-display animate-fade-up stagger-2 opacity-0"
            style={{
              fontSize: "clamp(40px, 6vw, 72px)",
              lineHeight: 1.1,
              color: "white",
              marginBottom: 24,
              fontWeight: 500,
            }}
          >
            Exceptional Services,{" "}
            <em style={{ color: "var(--gold)" }}>Effortlessly Booked</em>
          </h1>
          <p
            className="animate-fade-up stagger-3 opacity-0"
            style={{
              fontSize: 17,
              lineHeight: 1.7,
              color: "#9E9E9E",
              marginBottom: 40,
              maxWidth: 500,
              margin: "0 auto 40px",
            }}
          >
            Discover and book from our curated selection of premium wellness,
            beauty, and lifestyle services.
          </p>
          <a
            href="#services"
            className="btn-primary animate-fade-up stagger-4 opacity-0"
            style={{ textDecoration: "none" }}
          >
            <span>Explore Services</span>
            <span>↓</span>
          </a>
        </div>

        {/* Stats bar */}
        <div
          className="animate-fade-up stagger-5 opacity-0"
          style={{
            marginTop: 80,
            paddingTop: 40,
            borderTop: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            justifyContent: "center",
            gap: 64,
            flexWrap: "wrap",
          }}
        >
          {[
            { num: "2,400+", label: "Happy Clients" },
            { num: "6", label: "Premium Services" },
            { num: "4.9★", label: "Average Rating" },
            { num: "100%", label: "Secure Payments" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div
                className="font-display"
                style={{ fontSize: 28, color: "white", fontWeight: 500 }}
              >
                {stat.num}
              </div>
              <div style={{ fontSize: 12, color: "#6B6B6B", marginTop: 4, letterSpacing: 1 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 32px" }}>
        {/* Section header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 48,
            flexWrap: "wrap",
            gap: 24,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 11,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: 8,
                fontFamily: "'DM Mono', monospace",
              }}
            >
              Our Offerings
            </p>
            <h2
              className="font-display"
              style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 500 }}
            >
              Select a Service
            </h2>
          </div>

          {/* Category filter */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["All", ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "8px 18px",
                  fontSize: 12,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: activeCategory === cat ? "var(--obsidian)" : "var(--border)",
                  background: activeCategory === cat ? "var(--obsidian)" : "transparent",
                  color: activeCategory === cat ? "white" : "var(--obsidian)",
                  transition: "all 0.2s ease",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: 24,
          }}
        >
          {filteredServices.map((service, i) => (
            <ServiceCard
              key={service.id}
              service={service}
              onBook={handleBook}
              delay={i * 0.1}
            />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        style={{
          background: "var(--obsidian)",
          padding: "80px 32px",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: 12,
              fontFamily: "'DM Mono', monospace",
            }}
          >
            Simple Process
          </p>
          <h2
            className="font-display"
            style={{ fontSize: "clamp(28px, 4vw, 44px)", color: "white", marginBottom: 56, fontWeight: 500 }}
          >
            How It Works
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 32,
            }}
          >
            {[
              { step: "01", title: "Choose a Service", desc: "Browse our curated selection and select the service that fits your needs." },
              { step: "02", title: "Fill Your Details", desc: "Provide your contact info, preferred date and time for the appointment." },
              { step: "03", title: "Secure Payment", desc: "Complete the booking with our secure Stripe payment gateway." },
              { step: "04", title: "Get Confirmed", desc: "Receive an email confirmation instantly with all your booking details." },
            ].map((item) => (
              <div key={item.step} style={{ padding: "0 16px" }}>
                <div
                  className="font-display"
                  style={{
                    fontSize: 48,
                    color: "rgba(212,168,67,0.2)",
                    fontWeight: 700,
                    lineHeight: 1,
                    marginBottom: 12,
                  }}
                >
                  {item.step}
                </div>
                <h3 style={{ color: "white", fontSize: 16, marginBottom: 8, fontWeight: 500 }}>
                  {item.title}
                </h3>
                <p style={{ color: "#6B6B6B", fontSize: 14, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "32px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 13, color: "#9E9E9E" }}>
          © 2024 LuxeBook · Premium Service Booking ·{" "}
          <span style={{ color: "var(--gold)" }}>◆</span>
        </p>
      </footer>

      {/* Booking Modal */}
      {isModalOpen && selectedService && (
        <BookingModal
          service={selectedService}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </main>
  );
}
