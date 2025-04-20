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
