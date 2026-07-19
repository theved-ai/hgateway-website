import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import type { Metadata } from "next";
import SandboxClient from "./SandboxClient";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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
  title: "HGateway Sandbox — Two Case Files",
};

export default function SandboxPage() {
  return (
    <div className={`${fraunces.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <SandboxClient />
    </div>
  );
}
