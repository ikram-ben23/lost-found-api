import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: { message: "Authentication required. Use Bearer <token>." } });
  }

  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true }
    });
    if (!user) return res.status(401).json({ success: false, error: { message: "Invalid authentication token." } });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, error: { message: "Invalid or expired authentication token." } });
  }
}
