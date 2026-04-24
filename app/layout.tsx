import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/navbar.component";

// Using Inter as a good alternative to Airbnb Cereal
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-primary",
  display: "swap",
});

// Optional: Space Grotesk for headings (similar to Airbnb's style)
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StayBook - Your Perfect Stay Awaits",
  description: "Find and book amazing places to stay around the world",
};

export default function RootLayout({}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <div className="app-layout">
          <Navbar />
        </div>
      </body>
    </html>
  );
}
