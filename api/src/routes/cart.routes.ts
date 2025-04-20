// routes/cart.routes.ts
import { Router } from 'express';
import {
  getCartById,
  getCartByCustomerId,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cart.controller';

const router = Router();

router.get('/carts/:id', getCartById);
router.get('/carts/customer/:customerId', getCartByCustomerId);
router.post('/carts/customer/:customerId/items', addItemToCart);
router.put('/carts/:cartId/items/:itemId', updateCartItem);
router.delete('/carts/:cartId/items/:itemId', removeCartItem);
router.delete('/carts/:cartId/clear', clearCart);

export default router;
