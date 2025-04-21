// routes/products.routes.ts
import { Router } from "express";
import {
  getAllProducts,
  getActiveListingsByUserId,
  editListing,
  deleteListing,
  createListing,
} from "../controllers/products.controller";

const router = Router();

router.get("/products", getAllProducts);
router.get("/products/user/:userId/listings", getActiveListingsByUserId);
router.post("/products/user/:userId/listings", createListing);
router.put("/products/user/:userId/listings/:listingId", editListing);
router.delete("/products/user/:userId/listings/:listingId", deleteListing);

export default router;
