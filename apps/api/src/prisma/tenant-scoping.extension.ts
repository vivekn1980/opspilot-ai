import { Prisma } from "@prisma/client";
import { tenantContext } from "./tenant-context";

// Every model listed here gets organizationId auto-injected into its
// where/data on every operation. User and Organization are deliberately
// excluded — see the comment on the User model in schema.prisma for why.
const TENANT_SCOPED_MODELS = new Set([
  "Incident",
  "Problem",
  "Change",
  "Sop",
  "Doc",
  "ShiftHandover",
  "CustomerUpdate",
  "Risk",
  "CapacityReport",
  "Runbook",
  "RunbookRun",
  "ExecutiveReport",
  "ServiceReviewReport",
  "Metric",
  "AiUsageLog",
  "AppSetting",
]);

const READ_AND_MUTATE_WHERE_OPS = new Set([
  "findMany",
  "findFirst",
  "findFirstOrThrow",
  "findUnique",
  "findUniqueOrThrow",
  "count",
  "aggregate",
  "groupBy",
  "update",
  "updateMany",
  "delete",
  "deleteMany",
]);

export function withTenantScoping() {
  return Prisma.defineExtension({
    name: "tenant-scoping",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!TENANT_SCOPED_MODELS.has(model)) {
            return query(args);
          }

          const store = tenantContext.getStore();
          if (!store) {
            // Fail closed: a tenant-scoped query with no known organization
            // is a bug (a background job or script bypassing the request
            // pipeline), not a case to silently return unscoped data for.
            throw new Error(
              `Tenant-scoped query on ${model}.${operation} attempted with no organization context. ` +
                "Background jobs must use the raw PrismaService, not TenantPrismaService.",
            );
          }
          const { organizationId } = store;
          const scopedArgs = args as Record<string, unknown>;

          if (READ_AND_MUTATE_WHERE_OPS.has(operation)) {
            scopedArgs.where = { ...(scopedArgs.where as object | undefined), organizationId };
          } else if (operation === "create") {
            scopedArgs.data = { ...(scopedArgs.data as object), organizationId };
          } else if (operation === "createMany") {
            const data = scopedArgs.data;
            scopedArgs.data = Array.isArray(data)
              ? data.map((row: object) => ({ ...row, organizationId }))
              : { ...(data as object), organizationId };
          } else if (operation === "upsert") {
            scopedArgs.where = { ...(scopedArgs.where as object | undefined), organizationId };
            scopedArgs.create = { ...(scopedArgs.create as object), organizationId };
          }

          return query(scopedArgs);
        },
      },
    },
  });
}
