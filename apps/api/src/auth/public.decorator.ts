import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

// Marks a route as exempt from the global JwtAuthGuard — used for
// register/login/logout, which by definition run before a session exists.
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
