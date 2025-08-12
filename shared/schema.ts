import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  role: varchar("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sku: varchar("sku").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inventory entries table
export const inventoryEntries = pgTable("inventory_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).notNull(),
  datePurchased: timestamp("date_purchased").notNull(),
  grnNumber: varchar("grn_number").notNull(),
  quantityReceived: integer("quantity_received").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sales table
export const sales = pgTable("sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  salesPrice: decimal("sales_price", { precision: 10, scale: 2 }).notNull(),
  dataSold: varchar("data_sold").notNull(), // Keep exact field name as specified
  dateSold: timestamp("date_sold").notNull(), // Also store as date internally
  quantitySold: integer("quantity_sold").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Metrics cache for fast dashboard loads
export const metricsCache = pgTable("metrics_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  periodKey: varchar("period_key").notNull().unique(),
  kpis: jsonb("kpis").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lessons table
export const lessons = pgTable("lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  category: varchar("category").notNull(),
  content: text("content"), // Could be markdown content
  contentUrl: text("content_url"), // Or URL to external content
  durationMins: integer("duration_mins").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User lesson progress
export const userLessonProgress = pgTable("user_lesson_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  lessonId: varchar("lesson_id").notNull().references(() => lessons.id),
  status: varchar("status").notNull().default("not_started"), // not_started, in_progress, completed
  progress: integer("progress").default(0), // 0-100
  lastViewedAt: timestamp("last_viewed_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const productsRelations = relations(products, ({ many }) => ({
  inventoryEntries: many(inventoryEntries),
  sales: many(sales),
}));

export const inventoryEntriesRelations = relations(inventoryEntries, ({ one }) => ({
  product: one(products, {
    fields: [inventoryEntries.productId],
    references: [products.id],
  }),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  product: one(products, {
    fields: [sales.productId],
    references: [products.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  lessonProgress: many(userLessonProgress),
}));

export const lessonsRelations = relations(lessons, ({ many }) => ({
  userProgress: many(userLessonProgress),
}));

export const userLessonProgressRelations = relations(userLessonProgress, ({ one }) => ({
  user: one(users, {
    fields: [userLessonProgress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [userLessonProgress.lessonId],
    references: [lessons.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInventoryEntrySchema = createInsertSchema(inventoryEntries).omit({
  id: true,
  createdAt: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
  createdAt: true,
});

export const insertUserLessonProgressSchema = createInsertSchema(userLessonProgress).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InventoryEntry = typeof inventoryEntries.$inferSelect;
export type InsertInventoryEntry = z.infer<typeof insertInventoryEntrySchema>;
export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type UserLessonProgress = typeof userLessonProgress.$inferSelect;
export type InsertUserLessonProgress = z.infer<typeof insertUserLessonProgressSchema>;
export type MetricsCache = typeof metricsCache.$inferSelect;

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = loginSchema.extend({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
