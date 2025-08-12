import {
  users,
  products,
  inventoryEntries,
  sales,
  lessons,
  userLessonProgress,
  metricsCache,
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type InventoryEntry,
  type InsertInventoryEntry,
  type Sale,
  type InsertSale,
  type Lesson,
  type InsertLesson,
  type UserLessonProgress,
  type InsertUserLessonProgress,
  type MetricsCache,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser & { password: string }): Promise<User>;
  validateUser(email: string, password: string): Promise<User | null>;

  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product>;

  // Inventory operations
  getInventoryEntries(): Promise<InventoryEntry[]>;
  createInventoryEntry(entry: InsertInventoryEntry): Promise<InventoryEntry>;
  getInventoryByProduct(productId: string): Promise<InventoryEntry[]>;

  // Sales operations
  getSales(): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;
  getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]>;
  getSalesByProduct(productId: string): Promise<Sale[]>;

  // Lesson operations
  getLessons(): Promise<Lesson[]>;
  getLesson(id: string): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  getLessonsByCategory(category: string): Promise<Lesson[]>;

  // User progress operations
  getUserProgress(userId: string): Promise<UserLessonProgress[]>;
  updateProgress(progress: InsertUserLessonProgress): Promise<UserLessonProgress>;
  getUserLessonProgress(userId: string, lessonId: string): Promise<UserLessonProgress | undefined>;

  // Analytics operations
  getDashboardMetrics(periodKey: string): Promise<any>;
  updateMetricsCache(periodKey: string, kpis: any): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser & { password: string }): Promise<User> {
    const passwordHash = await bcrypt.hash(userData.password, 12);
    const { password, ...userDataWithoutPassword } = userData;
    
    const [user] = await db
      .insert(users)
      .values({
        ...userDataWithoutPassword,
        passwordHash,
      })
      .returning();
    return user;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async getInventoryEntries(): Promise<InventoryEntry[]> {
    return await db.select().from(inventoryEntries).orderBy(desc(inventoryEntries.createdAt));
  }

  async createInventoryEntry(entry: InsertInventoryEntry): Promise<InventoryEntry> {
    const [newEntry] = await db.insert(inventoryEntries).values(entry).returning();
    return newEntry;
  }

  async getInventoryByProduct(productId: string): Promise<InventoryEntry[]> {
    return await db
      .select()
      .from(inventoryEntries)
      .where(eq(inventoryEntries.productId, productId))
      .orderBy(desc(inventoryEntries.createdAt));
  }

  async getSales(): Promise<Sale[]> {
    return await db.select().from(sales).orderBy(desc(sales.createdAt));
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const [newSale] = await db.insert(sales).values(sale).returning();
    return newSale;
  }

  async getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]> {
    return await db
      .select()
      .from(sales)
      .where(and(gte(sales.dateSold, startDate), lte(sales.dateSold, endDate)))
      .orderBy(desc(sales.dateSold));
  }

  async getSalesByProduct(productId: string): Promise<Sale[]> {
    return await db
      .select()
      .from(sales)
      .where(eq(sales.productId, productId))
      .orderBy(desc(sales.dateSold));
  }

  async getLessons(): Promise<Lesson[]> {
    return await db.select().from(lessons).orderBy(lessons.category, lessons.title);
  }

  async getLesson(id: string): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson;
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const [newLesson] = await db.insert(lessons).values(lesson).returning();
    return newLesson;
  }

  async getLessonsByCategory(category: string): Promise<Lesson[]> {
    return await db
      .select()
      .from(lessons)
      .where(eq(lessons.category, category))
      .orderBy(lessons.title);
  }

  async getUserProgress(userId: string): Promise<UserLessonProgress[]> {
    return await db
      .select()
      .from(userLessonProgress)
      .where(eq(userLessonProgress.userId, userId))
      .orderBy(desc(userLessonProgress.lastViewedAt));
  }

  async updateProgress(progress: InsertUserLessonProgress): Promise<UserLessonProgress> {
    // First try to find existing progress
    const existing = await this.getUserLessonProgress(progress.userId, progress.lessonId);
    
    if (existing) {
      const [updated] = await db
        .update(userLessonProgress)
        .set({
          ...progress,
          lastViewedAt: new Date(),
          completedAt: progress.status === "completed" ? new Date() : existing.completedAt,
        })
        .where(and(
          eq(userLessonProgress.userId, progress.userId),
          eq(userLessonProgress.lessonId, progress.lessonId)
        ))
        .returning();
      return updated;
    } else {
      const [newProgress] = await db
        .insert(userLessonProgress)
        .values({
          ...progress,
          lastViewedAt: new Date(),
          completedAt: progress.status === "completed" ? new Date() : null,
        })
        .returning();
      return newProgress;
    }
  }

  async getUserLessonProgress(userId: string, lessonId: string): Promise<UserLessonProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userLessonProgress)
      .where(and(
        eq(userLessonProgress.userId, userId),
        eq(userLessonProgress.lessonId, lessonId)
      ));
    return progress;
  }

  async getDashboardMetrics(periodKey: string): Promise<any> {
    const [cache] = await db
      .select()
      .from(metricsCache)
      .where(eq(metricsCache.periodKey, periodKey));
    return cache?.kpis;
  }

  async updateMetricsCache(periodKey: string, kpis: any): Promise<void> {
    await db
      .insert(metricsCache)
      .values({ periodKey, kpis })
      .onConflictDoUpdate({
        target: metricsCache.periodKey,
        set: { kpis, updatedAt: new Date() },
      });
  }
}

export const storage = new DatabaseStorage();
