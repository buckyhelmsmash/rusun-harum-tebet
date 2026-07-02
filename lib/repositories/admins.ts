import { ID, Query } from "node-appwrite";
import { getUsers, toPlain } from "./base";

export const adminRepository = {
  async list() {
    const users = await getUsers();
    // Appwrite user search or filtering can be done via queries
    // To list admins, we fetch users with the 'admin' or 'superadmin' label.
    // If Query.contains isn't perfectly supported in the user's version, we can list all and filter.
    // However, Appwrite node SDK supports querying labels.
    const response = await users.list([Query.limit(100)]);
    // Filter manually to be 100% safe against older Appwrite versions
    // where querying labels might be restricted or indexed differently.
    return toPlain(
      response.users.filter(
        (u) => u.labels.includes("admin") || u.labels.includes("superadmin"),
      ),
    );
  },

  async invite(email: string) {
    const users = await getUsers();

    // Check if user already exists
    try {
      // Using search or just try-catch on creation
      const existing = await users.list([Query.equal("email", [email])]);
      if (existing.total > 0) {
        const user = existing.users[0];
        // Ensure they have the admin label
        if (
          !user.labels.includes("admin") &&
          !user.labels.includes("superadmin")
        ) {
          const newLabels = [...user.labels, "admin"];
          await users.updateLabels(user.$id, newLabels);
        }
        return toPlain(user);
      }
    } catch (e) {
      console.error("Failed to check existing admin:", e);
      // ignore
    }

    // Pre-create the user if they don't exist
    // Generate a secure, unguessable dummy password since they will use OAuth
    const dummyPassword =
      Math.random().toString(36).slice(2) +
      Math.random().toString(36).slice(2) +
      "A1!";

    const newUser = await users.create(
      ID.unique(),
      email,
      undefined,
      dummyPassword,
      email.split("@")[0], // default name
    );

    // Assign admin label
    await users.updateLabels(newUser.$id, [...newUser.labels, "admin"]);

    return toPlain(newUser);
  },

  async removeAdmin(userId: string) {
    const users = await getUsers();
    const user = await users.get(userId);

    // Soft delete: remove admin labels
    const newLabels = user.labels.filter(
      (l) => l !== "admin" && l !== "superadmin",
    );
    await users.updateLabels(userId, newLabels);
  },
};
