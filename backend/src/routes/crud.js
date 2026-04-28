import express from "express";
import { db } from "../db.js";

function nextNumericId(items) {
  return items.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1;
}

function stripPasswordIfNeeded(item, stripPassword) {
  if (!stripPassword || !item) return item;
  const { password, ...rest } = item;
  return rest;
}

export function buildCrudRouter(collection, { idType = "number", idPrefix = "item", stripPassword = false } = {}) {
  const router = express.Router();

  router.get("/", (_req, res) => {
    const items = [...db.data[collection]].sort((a, b) => {
      if (idType === "number") return Number(a.id) - Number(b.id);
      return String(a.id).localeCompare(String(b.id));
    });
    res.json(items.map((x) => stripPasswordIfNeeded(x, stripPassword)));
  });

  router.get("/:id", (req, res) => {
    const idValue = idType === "number" ? Number(req.params.id) : req.params.id;
    const item = db.data[collection].find((x) => x.id === idValue);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(stripPasswordIfNeeded(item, stripPassword));
  });

  router.post("/", async (req, res) => {
    const payload = { ...req.body };
    if (payload.id == null) {
      payload.id = idType === "number"
        ? nextNumericId(db.data[collection])
        : `${idPrefix}-${Date.now()}`;
    }
    db.data[collection].push(payload);
    await db.write();
    res.status(201).json(stripPasswordIfNeeded(payload, stripPassword));
  });

  router.put("/:id", async (req, res) => {
    const idValue = idType === "number" ? Number(req.params.id) : req.params.id;
    const idx = db.data[collection].findIndex((x) => x.id === idValue);
    if (idx === -1) return res.status(404).json({ error: "Not found" });
    const patch = { ...req.body };
    delete patch.id;
    db.data[collection][idx] = { ...db.data[collection][idx], ...patch };
    await db.write();
    res.json(stripPasswordIfNeeded(db.data[collection][idx], stripPassword));
  });

  router.delete("/:id", async (req, res) => {
    const idValue = idType === "number" ? Number(req.params.id) : req.params.id;
    const before = db.data[collection].length;
    db.data[collection] = db.data[collection].filter((x) => x.id !== idValue);
    if (db.data[collection].length === before) return res.status(404).json({ error: "Not found" });
    await db.write();
    res.json({ ok: true });
  });

  return router;
}
