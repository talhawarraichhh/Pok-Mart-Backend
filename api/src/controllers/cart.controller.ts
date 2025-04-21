// controllers/cart.controller.ts
import { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const cartIncludes = {
  items: {
    include: {
      product: { include: { listings: true } },
      listing: true,              
    },
  },
} as const;

export const getCartById: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const cart = await prisma.cart.findUnique({
      where: { id },
      include: cartIncludes,
    });
    if (!cart) {
      res.status(404).json({ error: "Cart not found" });
      return;
    }
    res.json(cart);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCartByCustomerId: RequestHandler = async (req, res) => {
    try {
      const userId = Number(req.params.customerId);
  
      const customer = await prisma.customer.findUnique({ where: { userId } });
      if (!customer) {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }
  
      const customerId = customer.id;
  
      let cart = await prisma.cart.findUnique({
        where: { customerId },
        include: cartIncludes,
      });
  
      if (!cart) {
        await prisma.cart.create({ data: { customerId, numberOfItems: 0 } });
        cart = await prisma.cart.findUnique({
          where: { customerId },
          include: cartIncludes,
        });
        if (!cart) {
          res.status(500).json({ error: 'Could not create cart' });
          return;
        }
      }
  
      res.json(cart);
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  };  

  export const addItemToCart: RequestHandler = async (req, res) => {
    try {
      const userId = Number(req.params.customerId);
      const customer = await prisma.customer.findUnique({ where: { userId } });
      if (!customer) {
        res.status(404).json({ error: "Customer not found" });
        return;
      }
      const customerId = customer.id;
  
      const { productId, quantity, listingId } = req.body as {
        productId: number;
        quantity: number;
        listingId: number;
      };
  
      const listing = await prisma.listing.findUnique({ where: { id: listingId } });
      if (!listing || listing.productId !== productId) {
        res.status(400).json({ error: "Invalid listing for this product" });
        return;
      }
  
      const baseCart = await prisma.cart.upsert({
        where: { customerId },
        create: { customerId, numberOfItems: 0 },
        update: {},
      });
  
      await prisma.cartItem.create({
        data: { cartId: baseCart.id, productId, quantity, listingId },
      });
  
      const totalQty =
        (
          await prisma.cartItem.aggregate({
            _sum: { quantity: true },
            where: { cartId: baseCart.id },
          })
        )._sum.quantity ?? 0;
  
      const fullCart = await prisma.cart.update({
        where: { id: baseCart.id },
        data: { numberOfItems: totalQty },
        include: cartIncludes,
      });
  
      res.status(201).json(fullCart);
    } catch {
      res.status(500).json({ error: "Internal server error" });
    }
  };  

export const updateCartItem: RequestHandler = async (req, res) => {
  try {
    const cartId = Number(req.params.cartId);
    const itemId = Number(req.params.itemId);
    const { quantity } = req.body as { quantity: number };
    const item = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
    await prisma.cart.update({
      where: { id: cartId },
      data: {
        numberOfItems: await prisma.cartItem
          .aggregate({
            _sum: { quantity: true },
            where: { cartId },
          })
          .then((r) => r._sum.quantity ?? 0),
      },
    });
    res.json(item);
  } catch {
    res.status(404).json({ error: "Item not found" });
  }
};

export const removeCartItem: RequestHandler = async (req, res) => {
  try {
    const cartId = Number(req.params.cartId);
    const itemId = Number(req.params.itemId);
    await prisma.cartItem.delete({ where: { id: itemId } });
    await prisma.cart.update({
      where: { id: cartId },
      data: {
        numberOfItems: await prisma.cartItem
          .aggregate({
            _sum: { quantity: true },
            where: { cartId },
          })
          .then((r) => r._sum.quantity ?? 0),
      },
    });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Item not found" });
  }
};

export const clearCart: RequestHandler = async (req, res) => {
  try {
    const cartId = Number(req.params.cartId);
    await prisma.cartItem.deleteMany({ where: { cartId } });
    await prisma.cart.update({
      where: { id: cartId },
      data: { numberOfItems: 0 },
    });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Cart not found" });
  }
};
