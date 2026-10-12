import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Face Attendance Portal | Multi-Tenant Platform",
  description: "Enterprise Face Verification, Geofencing, and Automated Employee Onboarding",
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
