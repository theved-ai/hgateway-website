import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import type { Metadata } from "next";
import LandingPage from "./_home/LandingPage";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: "HGateway — Human-in-the-loop for LangGraph agents",
};

export default function Home() {
  return (
    <div className={`${fraunces.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <LandingPage />
    </div>
  );
}
