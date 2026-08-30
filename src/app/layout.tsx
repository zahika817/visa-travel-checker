import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Visa Checker - Check Visa Requirements Before You Travel",
    template: "%s | Visa Requirement Checker",
  },
  description:
    "Check visa requirements before traveling. Find visa-free, eVisa, visa on arrival and tourist visa information for destinations worldwide.",
  keywords: [
    "visa checker",
    "visa requirements",
    "tourist visa",
    "study visa",
    "work visa",
    "travel rules",
    "visa information",
  ],
  applicationName: "Visa Requirement Checker",
  authors: [
    {
      name: "Visa Requirement Checker",
    },
  ],
  openGraph: {
    title: "Visa Checker - Check Visa Requirements Before You Travel",
    description:
      "Find accurate visa requirements for global travel routes including visa-free, eVisa and tourist visa information.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "Visa Requirement Checker",
        "description": "Global visa requirement information platform.",
      },
      {
        "@type": "WebSite",
        "name": "Visa Requirement Checker",
        "description": "Check visa requirements before you travel.",
        "url": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
        {children}
      </body>
    </html>
  );
}
