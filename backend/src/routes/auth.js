import express from "express";
import { db } from "../db.js";

const router = express.Router();

function publicUser(u) {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}

router.post("/login", (req, res) => {
  const { email, password, role } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

  const normalizedEmail = String(email).toLowerCase().trim();
  const user = db.data.users.find(
    (u) =>
      u.email.toLowerCase() === normalizedEmail &&
      u.password === password &&
      u.active !== false &&
      (!role || u.role === role)
  );
  if (!user) return res.status(401).json({ error: "Invalid credentials for this account type." });
  res.json({ ok: true, user: publicUser(user) });
});

router.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required." });
  }
  const normalizedEmail = String(email).toLowerCase().trim();
  if (db.data.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }

  const nextId = db.data.users.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1;
  const user = {
    id: nextId,
    role: "customer",
    name: String(name).trim(),
    email: normalizedEmail,
    password,
    phone: phone ? String(phone).trim() : "",
    active: true,
    createdAt: new Date().toISOString(),
  };
  db.data.users.push(user);
  await db.write();
  res.status(201).json({ ok: true, user: publicUser(user) });
});

export default router;
