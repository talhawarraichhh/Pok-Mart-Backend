// routes/order.routes.ts
import { Router } from 'express';
import {
  getOrdersByCustomerUserId,
  getOrdersBySellerUserId,
  getOrderById,
  createOrder,
} from '../controllers/order.controller';

const router = Router();

router.get('/orders/user/:userId', getOrdersByCustomerUserId);
router.get('/orders/seller/:userId', getOrdersBySellerUserId);
router.get('/orders/:id', getOrderById);
router.post('/orders/user/:userId', createOrder);

export default router;
