import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join the Waitlist | Synqed Air",
  description:
    "Synqed Air is being built for travelers flying to, from, and within Africa: full fares up front, and human support when plans change.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Override the radial-gradient body background for this page */}
      <style>{`
        body { background: #0A1128 !important; }
        /* Hide the floating support chat on this page */
        #floating-support-chat { display: none !important; }
      `}</style>
      {children}
    </>
  );
}
