import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: { message: `Route not found: ${req.method} ${req.originalUrl}` }
  });
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: { message: "Validation failed.", details: err.issues.map(i => ({ field: i.path.join("."), message: i.message })) }
    });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    return res.status(409).json({ success: false, error: { message: "A user with this email already exists." } });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ success: false, error: { message: "Resource not found." } });
  }
  if (err.status === 400) {
    return res.status(400).json({ success: false, error: { message: err.message } });
  }
  console.error(err);
  res.status(500).json({ success: false, error: { message: "Internal server error." } });
}
