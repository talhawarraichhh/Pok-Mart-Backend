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

export async function editListing(req: Request, res: Response) {
  try {
    const userId = Number(req.params.userId);
    const listingId = Number(req.params.listingId);
    const { price, stock } = req.body as {
      price?: number;
      stock?: number;
    };

    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) {
      res.status(404).json({ error: "Seller not found" });
      return;
    }

    const listing = await prisma.listing.findFirst({
      where: { id: listingId, sellerId: seller.id },
    });
    if (!listing) {
      res.status(404).json({ error: "Listing not found for this seller" });
      return;
    }

    const updated = await prisma.listing.update({
      where: { id: listing.id },
      data: {
        price: price !== undefined ? price : listing.price,
        stock: stock !== undefined ? stock : listing.stock,
      },
      include: { product: true },
    });

    res.json(updated);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}
