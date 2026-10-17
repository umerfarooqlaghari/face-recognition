"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "Technical Inquiry",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate support ticket dispatch
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div style={{ background: "#ffffff", color: "#0f172a", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Navigation */}
      <header style={{ borderBottom: "1px solid #f1f5f9", padding: "18px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#0f172a" }}>
          <Image src="/image.png" alt="AttendFace Logo" width={32} height={32} style={{ borderRadius: 8 }} />
          <span style={{ fontWeight: 800, fontSize: 18 }}>AttendFace</span>
        </Link>
        <Link href="/" style={{ fontSize: 14, color: "#4f46e5", textDecoration: "none", fontWeight: 600 }}>
          ← Back to Platform
        </Link>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: 1000, margin: "48px auto", padding: "0 24px 80px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 48px auto" }}>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: "#4f46e5" }}>
            Customer Support & Assistance
          </span>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: "#0f172a", marginTop: 8, marginBottom: 12 }}>
            How can our engineering team help you today?
          </h1>
          <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.6 }}>
            Reach out for device onboarding, camera calibration, geofence campus setup, billing inquiries, or enterprise deployment assistance.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32 }}>
          {/* Support Channels & FAQ Highlights */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: "24px" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
                Direct Email Support
              </h3>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
                Our support team is available 24/7 with guaranteed under-2-hour SLA response for critical production issues.
              </p>
              <a href="mailto:support@alpha-devs.cloud" style={{ color: "#4f46e5", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                support@alpha-devs.cloud →
              </a>
            </div>

            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: "24px" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
                14-Day Free Trial & Billing Inquiries
              </h3>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
                Questions regarding Stripe customer invoices, seat count adjustments, or tax invoices?
              </p>
              <a href="mailto:billing@alpha-devs.cloud" style={{ color: "#4f46e5", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                billing@alpha-devs.cloud →
              </a>
            </div>

            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: "24px" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
                Device & Mobile App Deployment
              </h3>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
                Need help installing the iOS Simulator build or configuring Android APK touchless kiosk modes?
              </p>
              <span style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>
                Check out the integrated setup guide or contact an onboarding architect.
              </span>
            </div>
          </div>

          {/* Contact Form */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "32px", boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05)" }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "40px 10px" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#ecfdf5", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto", fontSize: 24, fontWeight: "bold" }}>
                  ✓
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
                  Support Ticket Dispatched!
                </h3>
                <p style={{ fontSize: 14, color: "#64748b", maxWidth: 360, margin: "0 auto 24px auto" }}>
                  Thank you! An AttendFace support engineer has received your message and will follow up with you at <strong>{formData.email}</strong> shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  style={{ background: "#4f46e5", color: "#ffffff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, cursor: "pointer" }}
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
                  Send an Inquiry
                </h2>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@yourcompany.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>Company / Organization</label>
                  <input
                    type="text"
                    placeholder="Alpha Devs"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>Topic</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, outline: "none", background: "#ffffff" }}
                  >
                    <option>Technical & Device Setup</option>
                    <option>Billing & Stripe Subscriptions</option>
                    <option>Campus Geofencing Calibration</option>
                    <option>Custom Enterprise Integration</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your inquiry or requirement..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, outline: "none", fontFamily: "inherit" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: "#4f46e5",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 8,
                    padding: "12px",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    marginTop: 8,
                  }}
                >
                  {loading ? "Transmitting..." : "Submit Support Request"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
