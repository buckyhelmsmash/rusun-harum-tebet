import { Account, Client } from "node-appwrite";
import { APPWRITE } from "@/lib/constants";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

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
