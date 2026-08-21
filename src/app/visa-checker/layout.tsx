import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visa Checker - Find Visa Requirements by Country",
  description:
    "Check visa requirements for tourism, study and work travel based on your passport country and destination.",
  openGraph: {
    title: "Visa Checker - Find Visa Requirements by Country",
    description:
      "Find travel visa requirements using structured global visa information.",
    type: "website",
  },
};

export default function VisaCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Visa Requirement Checker",
    description:
      "Check visa requirements for worldwide travel routes based on passport and destination.",
    applicationCategory: "TravelApplication",
    operatingSystem: "Web",
    url: "/visa-checker",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema),
        }}
      />

      {children}
    </>
  );
}
