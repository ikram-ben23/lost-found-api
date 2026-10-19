import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middleware/auth.js";
import { createItemSchema, updateItemSchema, listItemsSchema } from "../validation/items.js";

export const itemsRouter = Router();

// Public, paginated search and filters.
itemsRouter.get("/", asyncHandler(async (req, res) => {
  const filters = listItemsSchema.parse(req.query);
  const { q, type, category, location, status, from, to, page, limit, sort } = filters;

  const where = {
    ...(type ? { type } : {}),
    ...(category ? { category: { contains: category, mode: "insensitive" } } : {}),
    ...(location ? { location: { contains: location, mode: "insensitive" } } : {}),
    ...(status ? { status } : {}),
    ...(q ? { OR: [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } }
    ] } : {}),
    ...(from || to ? { itemDate: {
      ...(from ? { gte: new Date(`${from}T00:00:00.000Z`) } : {}),
      ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {})
    } } : {})
  };

  const [items, total] = await Promise.all([
    prisma.itemReport.findMany({
      where,
      orderBy: { createdAt: sort === "oldest" ? "asc" : "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { owner: { select: { id: true, name: true } } }
    }),
    prisma.itemReport.count({ where })
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
}));

itemsRouter.get("/:id", asyncHandler(async (req, res) => {
  const item = await prisma.itemReport.findUnique({
    where: { id: req.params.id },
    include: { owner: { select: { id: true, name: true } } }
  });
  if (!item) return res.status(404).json({ success: false, error: { message: "Item report not found." } });
  res.json({ success: true, data: item });
}));

itemsRouter.post("/", requireAuth, asyncHandler(async (req, res) => {
  const input = createItemSchema.parse(req.body);
  const item = await prisma.itemReport.create({
    data: { ...input, ownerId: req.user.id }
  });
  res.status(201).json({ success: true, data: item });
}));

itemsRouter.patch("/:id", requireAuth, asyncHandler(async (req, res) => {
  const input = updateItemSchema.parse(req.body);
  const existing = await prisma.itemReport.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: { message: "Item report not found." } });
  if (existing.ownerId !== req.user.id) {
    return res.status(403).json({ success: false, error: { message: "You can only edit your own reports." } });
  }

  const data = { ...input };
  if (input.status === "RECOVERED") data.recoveredAt = new Date();
  if (input.status === "OPEN") data.recoveredAt = null;

  const item = await prisma.itemReport.update({ where: { id: req.params.id }, data });
  res.json({ success: true, data: item });
}));

itemsRouter.patch("/:id/recover", requireAuth, asyncHandler(async (req, res) => {
  const existing = await prisma.itemReport.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: { message: "Item report not found." } });
  if (existing.ownerId !== req.user.id) {
    return res.status(403).json({ success: false, error: { message: "Only the report owner can mark it recovered." } });
  }
  if (existing.status === "RECOVERED") {
    return res.status(400).json({ success: false, error: { message: "This item is already marked as recovered." } });
  }

  const item = await prisma.itemReport.update({
    where: { id: req.params.id },
    data: { status: "RECOVERED", recoveredAt: new Date() }
  });
  res.json({ success: true, message: "Item marked as recovered.", data: item });
}));

itemsRouter.delete("/:id", requireAuth, asyncHandler(async (req, res) => {
  const existing = await prisma.itemReport.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: { message: "Item report not found." } });
  if (existing.ownerId !== req.user.id) {
    return res.status(403).json({ success: false, error: { message: "You can only delete your own reports." } });
  }
  await prisma.itemReport.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));
