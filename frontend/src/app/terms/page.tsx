import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Terms of Service | AttendFace AI Workforce Platform",
  description:
    "Review AttendFace Terms of Service, SaaS subscription agreement, $2.00/user pricing terms, 14-day free trial conditions, and service level commitments.",
};

export default function TermsPage() {
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
          Legal Agreement
        </span>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: "#0f172a", marginTop: 8, marginBottom: 16 }}>
          Terms of Service & SaaS Agreement
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 32 }}>
          Effective Date: October 16, 2026 • Alpha Software Development Limited
        </p>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>1. Agreement to Terms</h2>
          <p style={{ color: "#334155", fontSize: 15 }}>
            By registering an account, utilizing the AttendFace web portal, or downloading the mobile attendance application, your organization agrees to be bound by these Terms of Service. If you are entering into this agreement on behalf of a company, you represent that you possess the authority to bind such entity.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>2. 14-Day Free Trial & Subscription Billing</h2>
          <p style={{ color: "#334155", fontSize: 15 }}>
            AttendFace provides each newly registered organization with a <strong>14-day complimentary trial period</strong> with full enterprise feature access.
          </p>
          <ul style={{ paddingLeft: 24, marginTop: 8, color: "#334155", fontSize: 15 }}>
            <li><strong>Per-Seat Rate:</strong> Following trial conclusion, billing transitions to <strong>$2.00 USD per active employee per month</strong>.</li>
            <li><strong>Dynamic Proration:</strong> Seat quantities are synchronized with active workforce rosters. Adding or terminating employees during a billing cycle results in automated proration calculated via Stripe.</li>
            <li><strong>Cancellation:</strong> Administrators may cancel subscriptions at any time through the integrated Stripe Customer Portal with no penalty or hidden cancellation fees.</li>
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>3. Acceptable Use & Employer Responsibility</h2>
          <p style={{ color: "#334155", fontSize: 15 }}>
            Employers are responsible for obtaining all requisite employee notices and consents prior to capturing facial biometric scan vectors. Employers agree not to utilize AttendFace for unlawful surveillance, unauthorized biometric harvesting, or discriminatory employment practices.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>4. Service Level & Data Availability</h2>
          <p style={{ color: "#334155", fontSize: 15 }}>
            AttendFace endeavors to maintain 99.9% uptime across our cloud infrastructure, API verification endpoints, and mobile sync channels. Timesheet reports and audit logs are exportable as standard CSV files at any time.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>5. Governing Law & Corporate Contact</h2>
          <p style={{ color: "#334155", fontSize: 15 }}>
            These terms are governed by the laws of England and Wales. Direct legal and contractual inquiries to:
          </p>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, marginTop: 12, fontSize: 14 }}>
            <strong>Alpha Software Development Limited</strong><br />
            Email: <a href="mailto:legal@alpha-devs.cloud" style={{ color: "#4f46e5" }}>legal@alpha-devs.cloud</a><br />
            Support: <a href="mailto:info@alpha-devs.cloud" style={{ color: "#4f46e5" }}>info@alpha-devs.cloud</a>
          </div>
        </section>
      </main>
    </div>
  );
}
