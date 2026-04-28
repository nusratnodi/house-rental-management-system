import "dotenv/config";
import express from "express";
import cors from "cors";

import "./src/db.js";
import { buildCrudRouter } from "./src/routes/crud.js";
import authRouter from "./src/routes/auth.js";

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/houses", buildCrudRouter("houses", { idType: "number" }));
app.use("/api/users", buildCrudRouter("users", { idType: "number", stripPassword: true }));
app.use("/api/hospitals", buildCrudRouter("hospitals", { idType: "string", idPrefix: "hospital" }));
app.use("/api/property-types", buildCrudRouter("propertyTypes", { idType: "string", idPrefix: "ptype" }));
app.use("/api/orders", buildCrudRouter("orders", { idType: "number" }));

app.use((err, _req, res, _next) => {
  console.error("[error]", err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`));
