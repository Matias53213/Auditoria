import { Request, Response } from "express";
import {
  getUserByIdService,
  getAllUsers,
  deleteUserByIdService,
  updateUserService,
  updateUserAdminStatusService
} from "../services/user.services";

export const getAll = async (_: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch {
    res.status(500).json({ message: "Usuarios no encontrados" });
  }
};

export const userId = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  try {
    const user = await getUserByIdService(userId);
    res.status(200).json(user);
  } catch {
    res.status(500).json({ message: "Usuario no encontrado" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    await deleteUserByIdService(parseInt(userId));
    res.status(200).json({ message: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el usuario" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { username, email, admin, telefono, confirmacion } = req.body;

  try {
    const user = await updateUserService(parseInt(userId), username, email, admin, telefono, confirmacion);
    res.status(200).json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updateUserAdmin = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { admin } = req.body;

  try {
    const user = await updateUserAdminStatusService(parseInt(userId), admin);
    res.status(200).json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};