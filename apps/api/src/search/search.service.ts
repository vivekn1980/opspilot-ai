import { Injectable } from "@nestjs/common";
import { TenantPrismaService } from "../prisma/tenant-prisma.service";

const RESULTS_PER_TYPE = 5;

export interface SearchResult {
  type: string;
  id: string;
  title: string;
  meta: string;
  href: string;
}

@Injectable()
export class SearchService {
  constructor(private readonly prisma: TenantPrismaService) {}

  async search(query: string): Promise<{ results: SearchResult[] }> {
    const q = query.trim();
    if (!q) return { results: [] };

    // SQLite's LIKE (what Prisma's `contains` compiles to here) is already
    // case-insensitive for ASCII, and the `mode: "insensitive"` option
    // Postgres/MySQL support isn't valid on this datasource — so plain
    // `contains` is both correct and all that's available.
    const take = RESULTS_PER_TYPE;

    const [incidents, problems, changes, risks, sops, docs, runbooks, metrics] = await Promise.all([
      this.prisma.incident.findMany({
        where: { OR: [{ title: { contains: q } }, { description: { contains: q } }] },
        take,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.problem.findMany({
        where: { OR: [{ title: { contains: q } }, { description: { contains: q } }] },
        take,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.change.findMany({
        where: { OR: [{ title: { contains: q } }, { description: { contains: q } }] },
        take,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.risk.findMany({
        where: { OR: [{ title: { contains: q } }, { description: { contains: q } }] },
        take,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.sop.findMany({
        where: { OR: [{ title: { contains: q } }, { content: { contains: q } }] },
        take,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.doc.findMany({
        where: { OR: [{ title: { contains: q } }, { content: { contains: q } }] },
        take,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.runbook.findMany({
        where: { OR: [{ title: { contains: q } }, { description: { contains: q } }] },
        take,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.metric.findMany({
        where: { name: { contains: q } },
        take,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const results: SearchResult[] = [
      ...incidents.map((i) => ({
        type: "Incident",
        id: i.id,
        title: i.title,
        meta: `${i.severity} · ${i.status}`,
        href: `/incidents/${i.id}`,
      })),
      ...problems.map((p) => ({
        type: "Problem",
        id: p.id,
        title: p.title,
        meta: p.status,
        href: `/problems/${p.id}`,
      })),
      ...changes.map((c) => ({
        type: "Change",
        id: c.id,
        title: c.title,
        meta: `${c.riskLevel} · ${c.status}`,
        href: `/changes/${c.id}`,
      })),
      ...risks.map((r) => ({
        type: "Risk",
        id: r.id,
        title: r.title,
        meta: `${r.likelihood}/${r.impact} · ${r.status}`,
        href: `/risks/${r.id}`,
      })),
      ...sops.map((s) => ({
        type: "SOP",
        id: s.id,
        title: s.title,
        meta: "SOP",
        href: `/sops/${s.id}`,
      })),
      ...docs.map((d) => ({
        type: "Doc",
        id: d.id,
        title: d.title,
        meta: "Documentation",
        href: `/docs`,
      })),
      ...runbooks.map((r) => ({
        type: "Runbook",
        id: r.id,
        title: r.title,
        meta: "Runbook",
        href: `/runbooks/${r.id}`,
      })),
      ...metrics.map((m) => ({
        type: "Metric",
        id: m.id,
        title: m.name,
        meta: "Metric snapshot",
        href: `/monitoring`,
      })),
    ];

    return { results };
  }
}
