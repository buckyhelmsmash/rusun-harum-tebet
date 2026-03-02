import { Account, Client, Databases, Users } from "node-appwrite";
import { APPWRITE } from "../constants";

export function createAdminClient() {
  const client = new Client()
    .setEndpoint(APPWRITE.ENDPOINT)
    .setProject(APPWRITE.PROJECT_ID)
    .setKey(APPWRITE.API_KEY);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    get users() {
      return new Users(client);
    },
  };
}
