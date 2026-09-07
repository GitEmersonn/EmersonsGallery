import type { Metadata } from "next";
import { Playfair_Display, Caveat, Courier_Prime, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

const courier = Courier_Prime({
  variable: "--font-courier",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Emerson's Gallery — Photography Portfolio",
  description: "A visual journal of moments worth remembering.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // data-scroll-behavior is required as of Next 16. globals.css sets
    // `scroll-behavior: smooth` on html for in-page anchors; without this
    // attribute Next no longer suppresses it while scrolling to top on
    // load/navigation, so that scroll animates — and a fast swipe made during
    // the animation is fought and cancelled by it. Wait it out and scrolling
    // works again, which is exactly how the bug presented on mobile.
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${cormorant.variable} ${caveat.variable} ${courier.variable} film-grain`}
    >
      <body className="min-h-screen bg-ink">{children}</body>
    </html>
  );
}
