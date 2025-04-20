import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  signIn,
} from '../controllers/users.controller';

const router = Router();

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/signin', signIn);

export default router;
