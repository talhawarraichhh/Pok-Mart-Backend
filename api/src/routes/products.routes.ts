import { Router } from "express";
import {
  getAllProducts,
  getActiveListingsByUserId,
} from "../controllers/products.controller";

const router = Router();

router.get("/products", getAllProducts);
router.get("/products/user/:userId/listings", getActiveListingsByUserId);

export default router;
