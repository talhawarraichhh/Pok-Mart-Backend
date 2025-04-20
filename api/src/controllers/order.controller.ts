// controllers/order.controller.ts
import { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const orderIncludes = {
  items: {
    include: {
      product: { include: { listings: true } },
    },
  },
} as const;

export const getOrdersByCustomerUserId: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const customer = await prisma.customer.findUnique({ where: { userId } });
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }
    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      include: orderIncludes,
    });
    res.json(orders);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getOrdersBySellerUserId: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) {
      res.status(404).json({ error: "Seller not found" });
      return;
    }
    const orders = await prisma.order.findMany({
      where: { sellerId: seller.id },
      include: orderIncludes,
    });
    res.json(orders);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getOrderById: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id },
      include: orderIncludes,
    });
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(order);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createOrder: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const { sellerUserId, items } = req.body as {
      sellerUserId: number;
      items: { productId: number; quantity: number; purchase_Price: number }[];
    };

    const customer = await prisma.customer.findUnique({ where: { userId } });
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    const seller = await prisma.seller.findUnique({
      where: { userId: sellerUserId },
    });
    if (!seller) {
      res.status(404).json({ error: "Seller not found" });
      return;
    }

    const cost = items.reduce(
      (sum, i) => sum + i.quantity * i.purchase_Price,
      0
    );

    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        sellerId: seller.id,
        cost,
        items: { create: items },
      },
      include: orderIncludes,
    });

    res.status(201).json(order);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};
