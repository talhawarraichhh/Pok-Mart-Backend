// routes/products.routes.ts
import { Router } from "express";
import {
  getAllProducts,
  getActiveListingsByUserId,
  editListing,
} from "../controllers/products.controller";

const router = Router();

router.get("/products", getAllProducts);
router.get("/products/user/:userId/listings", getActiveListingsByUserId);
router.put("/products/user/:userId/listings/:listingId", editListing);

export default router;
