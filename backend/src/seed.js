import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { db, DB_PATH } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../seed-data");

async function loadJson(name) {
  const file = path.join(DATA_DIR, name);
  return JSON.parse(await readFile(file, "utf-8"));
}

console.log("[seed] source dir:", DATA_DIR);
console.log("[seed] db file:   ", DB_PATH);

const [houses, users, hospitals, propertyTypes] = await Promise.all([
  loadJson("houses.json"),
  loadJson("users.json"),
  loadJson("hospitals.json"),
  loadJson("propertyTypes.json"),
]);

db.data.houses = houses;
db.data.users = users;
db.data.hospitals = hospitals;
db.data.propertyTypes = propertyTypes;
db.data.orders = db.data.orders || [];
await db.write();

console.log(`[seed] houses:         ${houses.length}`);
console.log(`[seed] users:          ${users.length}`);
console.log(`[seed] hospitals:      ${hospitals.length}`);
console.log(`[seed] property types: ${propertyTypes.length}`);
console.log("[seed] done");
