import type { Metadata } from "next";
import "./globals.css";
import NavLinks from "./nav-links";

export const metadata: Metadata = {
  title: "OpsPilot AI",
  description: "AI-native IT operations dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <div className="topbar">
            <a href="/" className="brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="OpsPilot AI" className="brand-logo" />
            </a>
            <NavLinks />
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
