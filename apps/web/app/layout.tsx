import type { Metadata } from "next";
import "./globals.css";

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
              <span>Ops</span>Pilot
            </a>
            <a href="/incidents/new" className="btn">
              + New Incident
            </a>
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
