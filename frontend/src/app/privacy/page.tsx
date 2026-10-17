import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Privacy Policy | AttendFace AI Biometric Attendance System",
  description:
    "Learn how AttendFace protects biometric employee data, 512D facial landmark representations, encryption standards, GDPR and BIPA compliance.",
};

export default function PrivacyPage() {
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

      {/* Main Content */}
      <main style={{ maxWidth: 840, margin: "48px auto", padding: "0 24px 80px 24px", lineHeight: 1.7 }}>
        <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: "#4f46e5" }}>
          Legal & Compliance
        </span>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: "#0f172a", marginTop: 8, marginBottom: 16 }}>
          Privacy Policy & Biometric Data Handling
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 32 }}>
          Last updated: October 16, 2026 • Alpha Software Development Limited
        </p>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>1. Information We Collect</h2>
          <p style={{ color: "#334155", fontSize: 15 }}>
            AttendFace provides workforce management, time-tracking, and attendance verification. In performing these services, we collect:
          </p>
          <ul style={{ paddingLeft: 24, marginTop: 8, color: "#334155", fontSize: 15 }}>
            <li><strong>Account & Organization Details:</strong> Company name, work email address, administrator credentials, and billing details.</li>
            <li><strong>512-Dimensional Mathematical Face Embeddings:</strong> When an employee registers their biometric reference, our on-device engine converts facial landmarks into a non-reversible 512-float vector embedding. We <em>do not</em> store unencrypted raw photographic identification databases.</li>
            <li><strong>Geofencing Data:</strong> Geographic latitude and longitude coordinates transmitted exclusively during punch check-in events to verify proximity to authorized office zones. Continuous tracking is strictly prohibited.</li>
            <li><strong>Device & Network Identifiers:</strong> IP address, operating system, and browser telemetry used for fraud prevention and audit logging.</li>
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>2. Purpose of Biometric Processing</h2>
          <p style={{ color: "#334155", fontSize: 15 }}>
            Facial embeddings are collected solely for authenticating employee attendance, preventing buddy punching, and ensuring secure workplace entry. Data is processed strictly pursuant to employer workplace agreements and applicable privacy statutes (including GDPR Article 9 and BIPA guidelines).
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>3. Security & Encryption Standards</h2>
          <p style={{ color: "#334155", fontSize: 15 }}>
            All biometric embeddings, database records, and network communications are secured using enterprise-grade AES-256 encryption at rest and TLS 1.3 in transit. Multi-tenant database isolation ensures organizational data cannot be accessed across tenant boundaries.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>4. Data Retention & Erasure</h2>
          <p style={{ color: "#334155", fontSize: 15 }}>
            Biometric vectors are retained only for the duration of the employee's tenure with their organization. Upon employee termination or account deletion by the organization administrator, associated biometric vector records are permanently deleted from database clusters within 30 business days.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>5. Contact Our Data Protection Officer</h2>
          <p style={{ color: "#334155", fontSize: 15 }}>
            For privacy inquiries, GDPR data requests, or compliance verifications, contact us at:
          </p>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, marginTop: 12, fontSize: 14 }}>
            <strong>Alpha Software Development Limited</strong><br />
            Attn: Data Protection Officer<br />
            Email: <a href="mailto:privacy@alpha-devs.cloud" style={{ color: "#4f46e5" }}>privacy@alpha-devs.cloud</a><br />
            Support: <a href="mailto:umer.farooq@alpha-devs.cloud" style={{ color: "#4f46e5" }}>umer.farooq@alpha-devs.cloud</a>
          </div>
        </section>
      </main>
    </div>
  );
}
