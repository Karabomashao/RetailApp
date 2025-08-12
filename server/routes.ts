import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import { loginSchema, registerSchema, insertSaleSchema, insertInventoryEntrySchema, insertProductSchema } from "@shared/schema";
import { ZodError } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// JWT middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = await storage.createUser(userData);
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({ 
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
        token 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.validateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({ 
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
        token 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName 
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Product routes
  app.get('/api/products', authenticateToken, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/products', authenticateToken, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      console.error('Create product error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Sales routes
  app.get('/api/sales', authenticateToken, async (req, res) => {
    try {
      const sales = await storage.getSales();
      res.json(sales);
    } catch (error) {
      console.error('Get sales error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/sales', authenticateToken, async (req, res) => {
    try {
      const saleData = insertSaleSchema.parse(req.body);
      const sale = await storage.createSale(saleData);
      res.json(sale);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      console.error('Create sale error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Inventory routes
  app.get('/api/inventory', authenticateToken, async (req, res) => {
    try {
      const inventory = await storage.getInventoryEntries();
      res.json(inventory);
    } catch (error) {
      console.error('Get inventory error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/inventory', authenticateToken, async (req, res) => {
    try {
      const inventoryData = insertInventoryEntrySchema.parse(req.body);
      const entry = await storage.createInventoryEntry(inventoryData);
      res.json(entry);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      console.error('Create inventory error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Dashboard analytics routes
  app.get('/api/analytics/dashboard', authenticateToken, async (req, res) => {
    try {
      const { period = 'current_month' } = req.query;
      
      // Calculate date ranges based on period
      const now = new Date();
      let startDate: Date, endDate: Date;
      
      switch (period) {
        case 'current_month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'last_3_months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }

      // Get sales data for the period
      const sales = await storage.getSalesByDateRange(startDate, endDate);
      const allProducts = await storage.getProducts();
      const allInventory = await storage.getInventoryEntries();

      // Calculate metrics
      const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.salesPrice) * sale.quantitySold, 0);
      const totalQuantitySold = sales.reduce((sum, sale) => sum + sale.quantitySold, 0);
      
      // Calculate cost of sales (simplified - using latest purchase price per product)
      const costOfSales = sales.reduce((sum, sale) => {
        const productInventory = allInventory.filter(inv => inv.productId === sale.productId);
        const latestPurchase = productInventory.sort((a, b) => 
          new Date(b.datePurchased).getTime() - new Date(a.datePurchased).getTime()
        )[0];
        
        if (latestPurchase) {
          return sum + parseFloat(latestPurchase.purchasePrice) * sale.quantitySold;
        }
        return sum;
      }, 0);

      const grossProfit = totalSales - costOfSales;
      const grossMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

      // Product stock levels
      const stockLevels = allProducts.map(product => {
        const productInventory = allInventory.filter(inv => inv.productId === product.id);
        const totalReceived = productInventory.reduce((sum, inv) => sum + inv.quantityReceived, 0);
        
        const productSales = sales.filter(sale => sale.productId === product.id);
        const totalSold = productSales.reduce((sum, sale) => sum + sale.quantitySold, 0);
        
        const currentStock = totalReceived - totalSold;
        
        return {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          currentStock,
          isLowStock: currentStock < 10,
          isCritical: currentStock < 5
        };
      });

      const lowStockCount = stockLevels.filter(item => item.isLowStock).length;

      const metrics = {
        totalSales,
        grossMargin,
        totalProducts: allProducts.length,
        lowStockCount,
        costOfSales,
        grossProfit,
        totalQuantitySold,
        stockLevels,
        salesTrend: sales.map(sale => ({
          date: sale.dateSold,
          amount: parseFloat(sale.salesPrice) * sale.quantitySold
        }))
      };

      res.json(metrics);
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // AI Insights route
  app.get('/api/ai/insights', authenticateToken, async (req, res) => {
    try {
      // Get recent data for analysis
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const sales = await storage.getSalesByDateRange(lastMonth, now);
      const products = await storage.getProducts();
      const inventory = await storage.getInventoryEntries();

      // Generate AI insights based on data patterns
      const insights = [];

      // Check for low stock items
      const stockLevels = products.map(product => {
        const productInventory = inventory.filter(inv => inv.productId === product.id);
        const totalReceived = productInventory.reduce((sum, inv) => sum + inv.quantityReceived, 0);
        
        const productSales = sales.filter(sale => sale.productId === product.id);
        const totalSold = productSales.reduce((sum, sale) => sum + sale.quantitySold, 0);
        
        const currentStock = totalReceived - totalSold;
        const avgDailySales = totalSold / 30; // Approximate daily sales over last month
        
        return {
          product,
          currentStock,
          avgDailySales,
          daysOfStock: avgDailySales > 0 ? currentStock / avgDailySales : 999
        };
      });

      // Generate stock alerts
      stockLevels.forEach(item => {
        if (item.currentStock < 10 && item.avgDailySales > 0) {
          const daysLeft = Math.floor(item.daysOfStock);
          insights.push({
            type: item.currentStock < 5 ? 'critical' : 'warning',
            title: 'Stock Alert',
            message: `${item.product.name} (SKU: ${item.product.sku}) needs reorder. Current: ${item.currentStock} units, expected stockout in ${daysLeft} days.`,
            action: `Reorder ${Math.ceil(item.avgDailySales * 30)} units to maintain 30-day stock.`
          });
        }
      });

      // Check for sales trends
      if (sales.length > 0) {
        const currentMonthSales = sales.filter(sale => 
          new Date(sale.dateSold).getMonth() === now.getMonth()
        );
        const lastMonthSales = sales.filter(sale => 
          new Date(sale.dateSold).getMonth() === now.getMonth() - 1
        );

        const currentTotal = currentMonthSales.reduce((sum, sale) => 
          sum + parseFloat(sale.salesPrice) * sale.quantitySold, 0
        );
        const lastTotal = lastMonthSales.reduce((sum, sale) => 
          sum + parseFloat(sale.salesPrice) * sale.quantitySold, 0
        );

        if (lastTotal > 0) {
          const growth = ((currentTotal - lastTotal) / lastTotal) * 100;
          
          if (growth > 10) {
            insights.push({
              type: 'success',
              title: 'Growth Opportunity',
              message: `Sales are up ${growth.toFixed(1)}% this month. Consider expanding inventory for trending products.`,
              action: 'Review top-selling items and increase stock levels.'
            });
          } else if (growth < -10) {
            insights.push({
              type: 'warning',
              title: 'Sales Decline',
              message: `Sales are down ${Math.abs(growth).toFixed(1)}% this month. Review pricing and marketing strategies.`,
              action: 'Analyze product performance and consider promotional campaigns.'
            });
          }
        }
      }

      // Add general recommendations if no specific insights
      if (insights.length === 0) {
        insights.push({
          type: 'info',
          title: 'Business Health',
          message: 'Your business metrics are stable. Continue monitoring key performance indicators.',
          action: 'Focus on customer retention and product diversification.'
        });
      }

      res.json({ insights });
    } catch (error) {
      console.error('AI insights error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Lessons and progress routes
  app.get('/api/lessons', authenticateToken, async (req, res) => {
    try {
      const lessons = await storage.getLessons();
      res.json(lessons);
    } catch (error) {
      console.error('Get lessons error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/lessons/progress', authenticateToken, async (req: any, res) => {
    try {
      const progress = await storage.getUserProgress(req.user.userId);
      res.json(progress);
    } catch (error) {
      console.error('Get progress error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
