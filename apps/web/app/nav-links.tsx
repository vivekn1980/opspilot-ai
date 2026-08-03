"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/incidents", label: "Incidents" },
  { href: "/problems", label: "Problems" },
  { href: "/changes", label: "Changes" },
  { href: "/sops", label: "SOPs" },
  { href: "/docs", label: "Docs & Chat" },
  { href: "/monitoring", label: "Monitoring" },
  { href: "/shift-handovers", label: "Shift Handover" },
  { href: "/kpi", label: "KPI / SLA" },
  { href: "/risks", label: "Risks" },
  { href: "/capacity", label: "Capacity" },
  { href: "/runbooks", label: "Runbooks" },
  { href: "/executive-reports", label: "Exec Reports" },
  { href: "/service-review-reports", label: "Service Review" },
  { href: "/ai-usage", label: "AI Usage" },
  { href: "/settings", label: "Settings" },
  { href: "/users", label: "Users", adminOnly: true },
];

export default function NavLinks() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="nav-links">
      {LINKS.filter((link) => !link.adminOnly || user?.role === "ADMIN").map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
        return (
          <Link key={link.href} href={link.href} className={active ? "nav-link active" : "nav-link"}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
