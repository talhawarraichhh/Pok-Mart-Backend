import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllProducts(req: Request, res: Response) {
  try {
    const products = await prisma.product.findMany({
      include: {
        set: true,
        listings: true,
        singleCard: true,
        sealedProduct: true,
      },
    });
    res.json(products);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getActiveListingsByUserId(req: Request, res: Response) {
  try {
    const userId = Number(req.params.userId);
    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) {
      res.status(404).json({ error: "Seller not found" });
      return;
    }
    const listings = await prisma.listing.findMany({
      where: { sellerId: seller.id, stock: { gt: 0 } },
      include: { product: true },
    });
    res.json(listings);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}
