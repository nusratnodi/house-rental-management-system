import { JSONFilePreset } from "lowdb/node";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../data");
const DB_FILE = path.join(DATA_DIR, "db.json");

await mkdir(DATA_DIR, { recursive: true });

const defaultData = {
  houses: [],
  users: [],
  hospitals: [],
  propertyTypes: [],
  orders: [],
};

export const db = await JSONFilePreset(DB_FILE, defaultData);
export const DB_PATH = DB_FILE;
