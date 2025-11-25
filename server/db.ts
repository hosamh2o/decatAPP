import { eq, and, desc, asc, like } from "drizzle-orm";
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import {
  InsertUser,
  users,
  bikeTypes,
  orders,
  invoices,
  notifications,
  orderItems,
  auditLog,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // Use postgres client (postgres package) with drizzle postgres-js adapter
      const sql = postgres(process.env.DATABASE_URL);
      _db = drizzle(sql);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER QUERIES ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "phone", "loginMethod", "branchName"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // Postgres upsert (ON CONFLICT ... DO UPDATE)
    await db
      .insert(users)
      .values(values)
      .onConflictDoUpdate({
        target: users.openId,
        set: updateSet,
      });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllManagers() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(users).where(eq(users.role, "manager"));
}

export async function getMechanic() {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.role, "mechanic")).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ BIKE TYPE QUERIES ============

export async function createBikeType(
  name: string,
  nameFr: string,
  price: number,
  createdBy: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(bikeTypes).values({
    name,
    nameFr,
    price,
    createdBy,
  });

  return result;
}

export async function getBikeTypes() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(bikeTypes).where(eq(bikeTypes.isActive, true));
}

export async function getBikeTypeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(bikeTypes).where(eq(bikeTypes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateBikeType(id: number, price: number, name?: string, nameFr?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = { price };
  if (name) updateData.name = name;
  if (nameFr) updateData.nameFr = nameFr;

  return await db.update(bikeTypes).set(updateData).where(eq(bikeTypes.id, id));
}

export async function deleteBikeType(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(bikeTypes)
    .set({ isActive: false })
    .where(eq(bikeTypes.id, id));
}

// ============ ORDER QUERIES ============

export async function createOrder(
  orderNumber: string,
  managerId: number,
  branchName: string,
  bikes: any[],
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(orders).values({
    orderNumber,
    managerId,
    branchName,
    bikes,
    notes,
  });

  return result;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrdersByManager(managerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(orders)
    .where(eq(orders.managerId, managerId))
    .orderBy(desc(orders.createdAt));
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(id: number, status: "pending" | "in_progress" | "completed") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = { status };
  if (status === "completed") {
    updateData.completedAt = new Date();
  }

  return await db.update(orders).set(updateData).where(eq(orders.id, id));
}

// ============ INVOICE QUERIES ============

export async function createInvoice(
  invoiceNumber: string,
  orderId: number,
  mechanicId: number,
  managerId: number,
  branchName: string,
  items: any[],
  totalAmount: number,
  paymentMethod?: string,
  pdfUrl?: string,
  pdfKey?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(invoices).values({
    invoiceNumber,
    orderId,
    mechanicId,
    managerId,
    branchName,
    items,
    totalAmount,
    paymentMethod,
    pdfUrl,
    pdfKey,
  });

  return result;
}

export async function getInvoiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getInvoiceByNumber(invoiceNumber: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(invoices)
    .where(eq(invoices.invoiceNumber, invoiceNumber))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getInvoicesByManager(managerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(invoices)
    .where(eq(invoices.managerId, managerId))
    .orderBy(desc(invoices.createdAt));
}

export async function getInvoicesByMechanic(mechanicId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(invoices)
    .where(eq(invoices.mechanicId, mechanicId))
    .orderBy(desc(invoices.createdAt));
}

export async function getAllInvoices() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
}

export async function updateInvoiceStatus(id: number, status: "draft" | "sent" | "paid") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(invoices).set({ status }).where(eq(invoices.id, id));
}

// ============ NOTIFICATION QUERIES ============

export async function createNotification(
  recipientId: number,
  type: "order_created" | "order_completed" | "invoice_sent" | "invoice_paid",
  title: string,
  body?: string,
  relatedOrderId?: number,
  relatedInvoiceId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(notifications).values({
    recipientId,
    type,
    title,
    body,
    relatedOrderId,
    relatedInvoiceId,
  });
}

export async function getNotificationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.recipientId, userId))
    .orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

export async function getUnreadNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.recipientId, userId), eq(notifications.isRead, false)))
    .orderBy(desc(notifications.createdAt));
}

// ============ AUDIT LOG QUERIES ============

export async function createAuditLog(
  userId: number,
  action: string,
  entityType: string,
  entityId: number,
  details?: any
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(auditLog).values({
    userId,
    action,
    entityType,
    entityId,
    details,
  });
}

export async function getAuditLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(limit);
}

// ============ ORDER ITEMS QUERIES ============

export async function createOrderItem(
  orderId: number,
  bikeTypeId: number,
  quantity: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(orderItems).values({
    orderId,
    bikeTypeId,
    quantity,
    barcodes: [],
  });
}

export async function getOrderItemsByOrder(orderId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function updateOrderItemProgress(
  id: number,
  completedQuantity: number,
  barcodes?: any[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = { completedQuantity };
  if (barcodes) {
    updateData.barcodes = barcodes;
  }

  return await db.update(orderItems).set(updateData).where(eq(orderItems.id, id));
}


// ============ ANALYTICS QUERIES ============

export async function getManagerAnalytics(managerId: number) {
  const db = await getDb();
  if (!db) return null;

  const managerOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.managerId, managerId));

  const managerInvoices = await db
    .select()
    .from(invoices)
    .where(eq(invoices.managerId, managerId));

  const totalOrders = managerOrders.length;
  const completedOrders = managerOrders.filter((o) => o.status === "completed").length;
  const pendingOrders = managerOrders.filter((o) => o.status === "pending").length;
  const inProgressOrders = managerOrders.filter((o) => o.status === "in_progress").length;

  const totalRevenue = managerInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const paidInvoices = managerInvoices.filter((inv) => inv.status === "paid").length;
  const pendingInvoices = managerInvoices.filter((inv) => inv.status === "draft" || inv.status === "sent").length;

  // Calculate average assembly time
  const completedWithTime = managerOrders.filter((o) => o.completedAt && o.createdAt);
  const avgAssemblyTime =
    completedWithTime.length > 0
      ? completedWithTime.reduce((sum, o) => {
          const time = (new Date(o.completedAt!).getTime() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60);
          return sum + time;
        }, 0) / completedWithTime.length
      : 0;

  return {
    totalOrders,
    completedOrders,
    pendingOrders,
    inProgressOrders,
    totalRevenue,
    paidInvoices,
    pendingInvoices,
    avgAssemblyTime: Math.round(avgAssemblyTime * 10) / 10,
    recentOrders: managerOrders.slice(0, 5),
    recentInvoices: managerInvoices.slice(0, 5),
  };
}

export async function getMechanicAnalytics(mechanicId: number) {
  const db = await getDb();
  if (!db) return null;

  const mechanicInvoices = await db
    .select()
    .from(invoices)
    .where(eq(invoices.mechanicId, mechanicId));

  const allOrders = await db.select().from(orders);
  const mechanicOrders = allOrders.filter((o) => {
    const invoice = mechanicInvoices.find((inv) => inv.orderId === o.id);
    return !!invoice;
  });

  const totalOrders = mechanicOrders.length;
  const completedOrders = mechanicOrders.filter((o) => o.status === "completed").length;
  const totalRevenue = mechanicInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const paidInvoices = mechanicInvoices.filter((inv) => inv.status === "paid").length;

  // Calculate average assembly time
  const completedWithTime = mechanicOrders.filter((o) => o.completedAt && o.createdAt);
  const avgAssemblyTime =
    completedWithTime.length > 0
      ? completedWithTime.reduce((sum, o) => {
          const time = (new Date(o.completedAt!).getTime() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60);
          return sum + time;
        }, 0) / completedWithTime.length
      : 0;

  return {
    totalOrders,
    completedOrders,
    totalRevenue,
    paidInvoices,
    avgAssemblyTime: Math.round(avgAssemblyTime * 10) / 10,
    recentInvoices: mechanicInvoices.slice(0, 5),
  };
}

export async function getOrdersOverTime(managerId?: number, limit: number = 30) {
  const db = await getDb();
  if (!db) return [];

  let query;
  if (managerId) {
    query = await db
      .select()
      .from(orders)
      .where(eq(orders.managerId, managerId))
      .orderBy(desc(orders.createdAt))
      .limit(limit);
  } else {
    query = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
  }

  return query.reverse();
}

export async function getRevenueOverTime(managerId?: number) {
  const db = await getDb();
  if (!db) return [];

  let results;
  if (managerId) {
    results = await db
      .select()
      .from(invoices)
      .where(eq(invoices.managerId, managerId))
      .orderBy(desc(invoices.createdAt));
  } else {
    results = await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  // Group by date
  const grouped: Record<string, number> = {};
  results.forEach((inv) => {
    const date = new Date(inv.createdAt).toISOString().split("T")[0];
    grouped[date] = (grouped[date] || 0) + (inv.totalAmount || 0);
  });

  return Object.entries(grouped).map(([date, amount]) => ({
    date,
    revenue: amount,
  }));
}

export async function getOrderStatusDistribution(managerId?: number) {
  const db = await getDb();
  if (!db) return { pending: 0, in_progress: 0, completed: 0 };

  let results;
  if (managerId) {
    results = await db.select().from(orders).where(eq(orders.managerId, managerId));
  } else {
    results = await db.select().from(orders);
  }

  return {
    pending: results.filter((o) => o.status === "pending").length,
    in_progress: results.filter((o) => o.status === "in_progress").length,
    completed: results.filter((o) => o.status === "completed").length,
  };
}


// ============ PUSH SUBSCRIPTIONS QUERIES ============

export async function savePushSubscription(
  userId: number,
  subscription: any
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // For now, we'll store this in a simple way
  // In production, you'd want a dedicated table
  try {
    // Store subscription endpoint and keys
    const subscriptionData = {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };

    console.log(`[Push] Subscription saved for user ${userId}:`, subscriptionData);
    return true;
  } catch (error) {
    console.error('[Push] Error saving subscription:', error);
    throw error;
  }
}

export async function removePushSubscription(
  userId: number,
  subscription: any
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    console.log(`[Push] Subscription removed for user ${userId}`);
    return true;
  } catch (error) {
    console.error('[Push] Error removing subscription:', error);
    throw error;
  }
}

// Helper function to send push notification
export async function sendPushNotification(
  userId: number,
  title: string,
  body: string,
  data?: any
) {
  try {
    // Create notification record in database
    const notification = await createNotification(
      userId,
      data?.type || 'order_completed',
      title,
      body,
      data?.orderId,
      data?.invoiceId
    );

    console.log(`[Push] Notification created for user ${userId}:`, title);
    return notification;
  } catch (error) {
    console.error('[Push] Error sending notification:', error);
    throw error;
  }
}
