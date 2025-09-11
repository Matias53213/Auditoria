import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../entities/usuario";
import { AppDataSource } from "../dbconfig/db";
import UserRepository from "../repositories/user.repository";

const userRepo = AppDataSource.getRepository(User);

export const getUserByIdService = async (id: number): Promise<User> => {
  try {
    const user = await UserRepository.findById(id);
    return user;
  } catch (error) {
    throw error;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const users = await UserRepository.findAllUser();
    return users;
  } catch (error) {
    throw error;
  }
};

export const updateUserService = async (
  id: number, 
  username: string, 
  email: string,
  admin: boolean,
  telefono: string, 
    confirmacion: boolean
): Promise<User> => {
  const user = await userRepo.findOneBy({ id });
  if (!user) throw new Error("Usuario no encontrado");

  user.username = username;
  user.email = email;
  user.admin = admin;
  user.telefono = telefono;
  user.confirmacion = confirmacion;

  return await userRepo.save(user);
};

export const updateUserAdminStatusService = async (
  id: number, 
  admin: boolean
): Promise<User> => {
  const user = await userRepo.findOneBy({ id });
  if (!user) throw new Error("Usuario no encontrado");

  user.admin = admin;

  return await userRepo.save(user);
};

export const deleteUserByIdService = async (id: number): Promise<void> => {
  const user = await userRepo.findOneBy({ id });
  if (!user) throw new Error("Usuario no encontrado");

  await userRepo.remove(user);
};