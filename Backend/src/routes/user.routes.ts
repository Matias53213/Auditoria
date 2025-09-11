import { Router } from "express";
import {
  getAll,
  userId,
  updateUser,
  deleteUser,
  updateUserAdmin
} from "../controllers/user.controller";

const router = Router();

router.get("/usuarios", getAll);
router.get("/usuarios/:userId", userId);
router.put("/usuarios/:userId", updateUser);
router.delete("/usuarios/:userId", deleteUser);
router.patch('/:userId/admin', updateUserAdmin); // Nueva ruta para actualizar solo el estado de admin


export default router;