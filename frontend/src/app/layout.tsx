import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://face-scan.alpha-devs.cloud"),
  title: {
    default: "AttendFace • AI Biometric Face Recognition Attendance & Geofencing System",
    template: "%s | AttendFace AI Attendance",
  },
  description:
    "Enterprise AI biometric face recognition attendance management software. 512-dimensional neural facial landmark scanning, OpenStreetMap campus geofencing, multi-tier leave approval, timesheet export, and anti-spoofing liveness detection. 14-day free trial, then $2/employee/month.",
  keywords: [
    "AI face recognition attendance",
    "biometric attendance system",
    "facial recognition attendance software",
    "workforce management attendance tracker",
    "geofencing attendance system",
    "employee clock in face recognition",
    "touchless biometric time tracking",
    "mobile attendance app with face scan",
    "campus geofence punch clock",
    "timesheet automation software",
    "anti spoofing attendance scanner",
    "enterprise time and attendance software",
    "online attendance system for employees",
    "biometric leave management software",
    "SaaS attendance platform",
    "OpenStreetMap geofence attendance",
    "automated workforce management",
  ],
  authors: [{ name: "Alpha Software Development Limited", url: "https://alpha-devs.cloud" }],
  creator: "Alpha Software Development Limited",
  publisher: "Alpha Software Development Limited",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://face-scan.alpha-devs.cloud",
    title: "AttendFace • AI Biometric Face Recognition Attendance & Geofencing System",
    description:
      "Modern touchless attendance management powered by 512D deep neural face recognition and OpenStreetMap geofencing. 14 days free trial.",
    siteName: "AttendFace",
    images: [
      {
        url: "/hero-face.jpg",
        width: 1200,
        height: 630,
        alt: "AttendFace AI Face Recognition Attendance System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AttendFace • AI Biometric Face Recognition Attendance System",
    description:
      "Enterprise AI biometric face recognition attendance and campus geofencing. 14-day free trial, $2/employee/month.",
    images: ["/hero-face.jpg"],
    creator: "@alphadevs",
  },
  icons: {
    icon: [
      { url: "/image.png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/image.png",
    apple: "/image.png",
  },
  alternates: {
    canonical: "https://face-scan.alpha-devs.cloud",
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
        {/* Structured Data (JSON-LD) for Search Engines & AI Crawlers */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "AttendFace AI Attendance",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web, iOS, Android",
              offers: {
                "@type": "Offer",
                price: "2.00",
                priceCurrency: "USD",
                priceValidUntil: "2027-12-31",
                description: "14-day free trial, then $2.00 per employee per month.",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                ratingCount: "1280",
                reviewCount: "860",
              },
              description:
                "Enterprise AI-powered biometric face recognition attendance system with real-time liveness verification, campus geofencing, and automated timesheet reporting.",
              publisher: {
                "@type": "Organization",
                name: "Alpha Software Development Limited",
                url: "https://alpha-devs.cloud",
              },
            }),
          }}
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
