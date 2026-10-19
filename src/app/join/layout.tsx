import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SynqedAir – Know the full fare before you book",
  description:
    "SynqedAir is being built for travelers flying to, from, and within Africa: full fares up front, and a real person when plans change.",
  robots: {
    index: false,
    follow: false,
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
