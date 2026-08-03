import { SetMetadata } from "@nestjs/common";

export const ADMIN_ONLY_KEY = "adminOnly";

// Forces an admin-role check even on a GET route — RolesGuard already
// requires admin for every non-GET request by default, so this only needs
// to be used for reads that shouldn't be open to viewers (e.g. the user
// list, which exposes other accounts' emails).
export const AdminOnly = () => SetMetadata(ADMIN_ONLY_KEY, true);
