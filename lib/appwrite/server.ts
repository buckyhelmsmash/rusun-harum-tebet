import { Client, Databases } from "node-appwrite";
import { APPWRITE } from "../constants";

export const createAdminClient = async () => {
  const client = new Client()
    .setEndpoint(APPWRITE.ENDPOINT)
    .setProject(APPWRITE.PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY!); // Ensure this is available in your server environment

  return {
    get databases() {
      return new Databases(client);
    },
  };
};
