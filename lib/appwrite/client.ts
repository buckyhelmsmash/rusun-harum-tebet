import { Account, Client, Databases } from "appwrite";
import { APPWRITE } from "../constants";

export const client = new Client()
  .setEndpoint(APPWRITE.ENDPOINT)
  .setProject(APPWRITE.PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
