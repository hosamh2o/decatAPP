import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { createAuditLog } from "./db";

// Helper to generate unique IDs
function generateOrderNumber(): string {
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `ORD-${date}-${random}`;
}

function generateInvoiceNumber(): string {
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `INV-${date}-${random}`;
}

// Manager-only procedure
const managerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "manager") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Managers only" });
  }
  return next({ ctx });
});

// Mechanic-only procedure
const mechanicProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "mechanic") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Mechanic only" });
  }
  return next({ ctx });
});

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ BIKE TYPES ROUTER ============
  bikeTypes: router({
    list: publicProcedure.query(async () => {
      return await db.getBikeTypes();
    }),

    create: managerProcedure
      .input(
        z.object({
          name: z.string().min(1),
          nameFr: z.string().min(1),
          price: z.number().int().positive(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await db.createBikeType(
          input.name,
          input.nameFr,
          input.price,
          ctx.user.id
        );

        await createAuditLog(
          ctx.user.id,
          "bike_type_created",
          "bike_type",
          0,
          { name: input.name, price: input.price }
        );

        return result;
      }),

    update: managerProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          nameFr: z.string().optional(),
          price: z.number().int().positive().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await db.updateBikeType(
          input.id,
          input.price || 0,
          input.name,
          input.nameFr
        );

        await createAuditLog(
          ctx.user.id,
          "bike_type_updated",
          "bike_type",
          input.id,
          input
        );

        return result;
      }),

    delete: managerProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.deleteBikeType(input.id);

        await createAuditLog(
          ctx.user.id,
          "bike_type_deleted",
          "bike_type",
          input.id
        );

        return result;
      }),
  }),

  // ============ ORDERS ROUTER ============
  orders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "manager") {
        return await db.getOrdersByManager(ctx.user.id);
      } else if (ctx.user.role === "mechanic") {
        return await db.getAllOrders();
      }
      return [];
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.id);
        if (!order) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Manager can only see their own orders
        if (ctx.user.role === "manager" && order.managerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return order;
      }),

    create: managerProcedure
      .input(
        z.object({
          bikes: z.array(
            z.object({
              bikeTypeId: z.number(),
              quantity: z.number().int().positive(),
            })
          ),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserById(ctx.user.id);
        if (!user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        const orderNumber = generateOrderNumber();
        const bikes = input.bikes.map((b) => ({
          bikeTypeId: b.bikeTypeId,
          quantity: b.quantity,
          barcode: null,
        }));

        const result = await db.createOrder(
          orderNumber,
          ctx.user.id,
          user.branchName || "Unknown Branch",
          bikes,
          input.notes
        );

        await createAuditLog(
          ctx.user.id,
          "order_created",
          "order",
          0,
          { orderNumber, bikes }
        );

        // Notify mechanic
        const mechanic = await db.getMechanic();
        if (mechanic) {
          await db.createNotification(
            mechanic.id,
            "order_created",
            `Nouvelle commande de ${user.branchName}`,
            `Commande ${orderNumber} - ${bikes.reduce((sum, b) => sum + b.quantity, 0)} vélos`
          );
        }

        return { orderNumber };
      }),

    updateStatus: mechanicProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "in_progress", "completed"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.id);
        if (!order) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const result = await db.updateOrderStatus(input.id, input.status);

        await createAuditLog(
          ctx.user.id,
          `order_${input.status}`,
          "order",
          input.id
        );

        // Notify manager when order is completed
        if (input.status === "completed") {
          const manager = await db.getUserById(order.managerId);
          if (manager) {
            await db.createNotification(
              manager.id,
              "order_completed",
              "Commande complétée",
              `La commande ${order.orderNumber} est prête`
            );
          }
        }

        return result;
      }),
  }),

  // ============ INVOICES ROUTER ============
  invoices: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "manager") {
        return await db.getInvoicesByManager(ctx.user.id);
      } else if (ctx.user.role === "mechanic") {
        return await db.getInvoicesByMechanic(ctx.user.id);
      }
      return [];
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const invoice = await db.getInvoiceById(input.id);
        if (!invoice) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Manager can only see their own invoices
        if (ctx.user.role === "manager" && invoice.managerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        // Mechanic can only see their own invoices
        if (ctx.user.role === "mechanic" && invoice.mechanicId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return invoice;
      }),

    create: mechanicProcedure
      .input(
        z.object({
          orderId: z.number(),
          items: z.array(
            z.object({
              bikeTypeName: z.string(),
              quantity: z.number().int().positive(),
              unitPrice: z.number().int().positive(),
              total: z.number().int().positive(),
            })
          ),
          totalAmount: z.number().int().positive(),
          paymentMethod: z.string().optional(),
          pdfUrl: z.string().optional(),
          pdfKey: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.orderId);
        if (!order) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const invoiceNumber = generateInvoiceNumber();
        const result = await db.createInvoice(
          invoiceNumber,
          input.orderId,
          ctx.user.id,
          order.managerId,
          order.branchName,
          input.items,
          input.totalAmount,
          input.paymentMethod,
          input.pdfUrl,
          input.pdfKey
        );

        await createAuditLog(
          ctx.user.id,
          "invoice_created",
          "invoice",
          0,
          { invoiceNumber, orderId: input.orderId }
        );

        // Notify manager
        const manager = await db.getUserById(order.managerId);
        if (manager) {
          await db.createNotification(
            manager.id,
            "invoice_sent",
            "Facture reçue",
            `Facture ${invoiceNumber} - Montant: €${(input.totalAmount / 100).toFixed(2)}`
          );
        }

        return { invoiceNumber };
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["draft", "sent", "paid"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const invoice = await db.getInvoiceById(input.id);
        if (!invoice) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Only manager or mechanic who created it can update
        if (
          ctx.user.role === "manager" &&
          invoice.managerId !== ctx.user.id
        ) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        if (
          ctx.user.role === "mechanic" &&
          invoice.mechanicId !== ctx.user.id
        ) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const result = await db.updateInvoiceStatus(input.id, input.status);

        await createAuditLog(
          ctx.user.id,
          `invoice_${input.status}`,
          "invoice",
          input.id
        );

        return result;
      }),
  }),

  // ============ NOTIFICATIONS ROUTER ============
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getNotificationsByUser(ctx.user.id);
    }),

    unread: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUnreadNotifications(ctx.user.id);
    }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.markNotificationAsRead(input.id);
      }),
  }),

  // ============ USERS ROUTER ============
  users: router({
    list: adminProcedure.query(async () => {
      return await db.getAllManagers();
    }),

    getMechanic: publicProcedure.query(async () => {
      return await db.getMechanic();
    }),
  }),

  // ============ ANALYTICS ROUTER ============
  analytics: router({
    managerDashboard: managerProcedure.query(async ({ ctx }) => {
      return await db.getManagerAnalytics(ctx.user.id);
    }),

    mechanicDashboard: mechanicProcedure.query(async ({ ctx }) => {
      return await db.getMechanicAnalytics(ctx.user.id);
    }),

    ordersOverTime: managerProcedure.query(async ({ ctx }) => {
      return await db.getOrdersOverTime(ctx.user.id);
    }),

    revenueOverTime: managerProcedure.query(async ({ ctx }) => {
      return await db.getRevenueOverTime(ctx.user.id);
    }),

    orderStatusDistribution: managerProcedure.query(async ({ ctx }) => {
      return await db.getOrderStatusDistribution(ctx.user.id);
    }),
  }),

  // ============ PUSH NOTIFICATIONS ROUTER ============
  push: router({
    subscribe: protectedProcedure
      .input(z.object({
        endpoint: z.string(),
        keys: z.object({
          p256dh: z.string(),
          auth: z.string(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          await db.savePushSubscription(ctx.user.id, input);
          return { success: true };
        } catch (error) {
          console.error('Error subscribing to push:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        }
      }),

    unsubscribe: protectedProcedure
      .input(z.object({
        endpoint: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          await db.removePushSubscription(ctx.user.id, input);
          return { success: true };
        } catch (error) {
          console.error('Error unsubscribing from push:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        }
      }),

    getNotifications: protectedProcedure.query(async ({ ctx }) => {
      return await db.getNotificationsByUser(ctx.user.id);
    }),

    markNotificationAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.markNotificationAsRead(input.id);
      }),

    getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
      const unread = await db.getUnreadNotifications(ctx.user.id);
      return { count: unread.length };
    }),
  }),
});

export type AppRouter = typeof appRouter;
