import { z } from "zod";

const dateString = z.iso.datetime({ offset: true }).or(z.iso.date());

export const createItemSchema = z.object({
  type: z.enum(["LOST", "FOUND"]),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(5).max(2000),
  category: z.string().trim().min(2).max(60),
  location: z.string().trim().min(2).max(160),
  itemDate: dateString.transform(v => new Date(v)),
  imageUrl: z.url().optional().nullable()
});

export const updateItemSchema = createItemSchema.partial().omit({ type: true }).extend({
  status: z.enum(["OPEN", "RECOVERED"]).optional()
});

export const listItemsSchema = z.object({
  q: z.string().trim().max(120).optional(),
  type: z.enum(["LOST", "FOUND"]).optional(),
  category: z.string().trim().max(60).optional(),
  location: z.string().trim().max(160).optional(),
  status: z.enum(["OPEN", "RECOVERED"]).optional(),
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.enum(["newest", "oldest"]).default("newest")
});
