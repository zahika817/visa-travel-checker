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
    default: "Visa Requirement Checker - Check Visa Rules Worldwide",
    template: "%s | Visa Requirement Checker",
  },
  description:
    "Check visa requirements for tourism, study, work and travel routes worldwide using structured visa information.",
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
    title: "Visa Requirement Checker - Check Visa Rules Worldwide",
    description:
      "Find visa requirements for global travel routes with structured visa information.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
