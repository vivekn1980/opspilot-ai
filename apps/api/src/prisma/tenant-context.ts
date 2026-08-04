import { AsyncLocalStorage } from "async_hooks";

export interface TenantStore {
  organizationId: string;
}

// Populated once per request by JwtAuthGuard (via enterWith, right after it
// decodes the JWT) and read by the tenant-scoping Prisma extension for the
// rest of that request's async continuation. Background jobs that aren't
// tied to any single request (e.g. SlaMonitorService's periodic sweep)
// never populate this — they use the raw, unscoped PrismaService instead.
export const tenantContext = new AsyncLocalStorage<TenantStore>();
