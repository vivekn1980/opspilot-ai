"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Incidents" },
  { href: "/problems", label: "Problems" },
  { href: "/changes", label: "Changes" },
  { href: "/sops", label: "SOPs" },
  { href: "/docs", label: "Docs & Chat" },
  { href: "/shift-handovers", label: "Shift Handover" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="nav-links">
      {LINKS.map((link) => {
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
