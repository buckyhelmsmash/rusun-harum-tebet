import { Account, Client } from "node-appwrite";
import { APPWRITE } from "@/lib/constants";

export type AppRole = "admin" | "superadmin";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

const ROLE_HIERARCHY: Record<AppRole, AppRole[]> = {
  admin: ["admin", "superadmin"],
  superadmin: ["superadmin"],
};

export async function verifyAuth(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    throw new AuthError("Missing authorization token");
  }

  try {
    const client = new Client()
      .setEndpoint(APPWRITE.ENDPOINT)
      .setProject(APPWRITE.PROJECT_ID)
      .setJWT(token);

    const account = new Account(client);
    return await account.get();
  } catch {
    throw new AuthError("Invalid or expired token");
  }
}

/**
 * Verifies the JWT and checks that the user holds at least the required role.
 * `requireRole(req, 'admin')` passes for both admin and superadmin.
 * `requireRole(req, 'superadmin')` passes only for superadmin.
 */
export async function requireRole(request: Request, role: AppRole) {
  const user = await verifyAuth(request);
  const allowedLabels = ROLE_HIERARCHY[role];
  const hasRole = user.labels?.some((label: string) =>
    allowedLabels.includes(label as AppRole),
  );

  if (!hasRole) {
    throw new ForbiddenError(
      `Insufficient permissions. Required role: ${role}`,
    );
  }

  return user;
}

export async function requireSuperadmin(request: Request) {
  return requireRole(request, "superadmin");
}
