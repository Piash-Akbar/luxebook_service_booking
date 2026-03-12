"use client";

import { Service } from "@/types";

interface ServiceCardProps {
  service: Service;
  onBook: (service: Service) => void;
  delay?: number;
}

export default function ServiceCard({ service, onBook, delay = 0 }: ServiceCardProps) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(service.price / 100);

  return (
    <div
      className="animate-fade-up opacity-0"
      style={{
        animationDelay: `${delay}s`,
        background: "white",
        border: "1px solid var(--border)",
        padding: 32,
        position: "relative",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Popular badge */}
      {service.popular && (
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "var(--gold)",
            color: "var(--obsidian)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            padding: "4px 10px",
            fontFamily: "'DM Mono', monospace",
          }}
        >
          Popular
        </div>
      )}

      {/* Icon + Category */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div
          style={{
            width: 44,
            height: 44,
            background: "var(--ivory-100)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            color: "var(--gold)",
          }}
        >
          {service.icon}
        </div>
        <span
          style={{
            fontSize: 10,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#9E9E9E",
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {service.category}
        </span>
      </div>

      {/* Name */}
      <h3
        className="font-display"
        style={{ fontSize: 22, fontWeight: 500, marginBottom: 10, lineHeight: 1.2 }}
      >
        {service.name}
      </h3>

      {/* Description */}
      <p style={{ fontSize: 14, lineHeight: 1.6, color: "#6B6B6B", marginBottom: 20 }}>
        {service.description}
      </p>

      {/* Features */}
      <ul style={{ listStyle: "none", marginBottom: 24 }}>
        {service.features.map((feat) => (
          <li
            key={feat}
            style={{
              fontSize: 13,
              color: "#4A4A4A",
              padding: "5px 0",
              borderBottom: "1px solid var(--ivory-200)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ color: "var(--gold)", fontSize: 10 }}>◆</span>
            {feat}
          </li>
        ))}
      </ul>

      {/* Price + Duration + CTA */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 20,
          borderTop: "1px solid var(--border)",
        }}
      >
        <div>
          <div
            className="font-display"
            style={{ fontSize: 26, fontWeight: 600, color: "var(--obsidian)" }}
          >
            {formattedPrice}
          </div>
          <div style={{ fontSize: 12, color: "#9E9E9E", marginTop: 2 }}>{service.duration}</div>
        </div>
        <button
          className="btn-primary"
          onClick={() => onBook(service)}
          style={{ padding: "10px 24px", fontSize: 12 }}
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
