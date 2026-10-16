import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Face Attendance Portal | Multi-Tenant Platform",
  description: "Enterprise Face Verification, Geofencing, and Automated Employee Onboarding",
  icons: {
    icon: [
      { url: "/image.png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/image.png",
    apple: "/image.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/image.png" type="image/png" />
        <link rel="shortcut icon" href="/image.png" type="image/png" />
        <link rel="apple-touch-icon" href="/image.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
