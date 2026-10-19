import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/async-handler.js";
import { registerSchema, loginSchema } from "../validation/auth.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

function makeToken(user) {
  return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: "2h" });
}

authRouter.post("/register", asyncHandler(async (req, res) => {
  const input = registerSchema.parse(req.body);
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash },
    select: { id: true, name: true, email: true, createdAt: true }
  });
  res.status(201).json({ success: true, data: { user, token: makeToken(user) } });
}));

authRouter.post("/login", asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    return res.status(401).json({ success: false, error: { message: "Invalid email or password." } });
  }
  const safeUser = { id: user.id, name: user.name, email: user.email };
  res.json({ success: true, data: { user: safeUser, token: makeToken(user) } });
}));

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});
