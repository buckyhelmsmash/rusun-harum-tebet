import { Client, Messaging, TablesDB, Users } from "node-appwrite";
import { APPWRITE } from "../constants";

export const createAdminClient = async () => {
  if (!process.env.APPWRITE_API_KEY) {
    throw new Error("Missing APPWRITE_API_KEY");
  }

  const client = new Client()
    .setEndpoint(APPWRITE.ENDPOINT)
    .setProject(APPWRITE.PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  return {
    get tablesDb() {
      return new TablesDB(client);
    },
    get users() {
      return new Users(client);
    },
    get messaging() {
      return new Messaging(client);
    },
  };
};
