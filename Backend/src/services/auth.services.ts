import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../entities/usuario";
import { AppDataSource } from "../dbconfig/db";

const userRepo = AppDataSource.getRepository(User);

export const loginUser = async (email: string, password: string) => {
  const user = await userRepo.findOneBy({ email });
  if (!user) throw new Error("Usuario no encontrado");

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error("Contraseña incorrecta");


  //canbiar "Secreto" en .env
  const token = jwt.sign({ id: user.id }, "secreto", { expiresIn: "1h" });
  return { token, user };
};

export const registerUser = async (username: string, email: string, password: string) => {
  const existingEmail = await userRepo.findOneBy({ email });
  const existingUsername = await userRepo.findOneBy({ username });

  if (existingEmail) throw new Error("Ya existe un usuario con ese email");
  if (existingUsername) throw new Error("Ya existe un usuario con ese nombre");

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = userRepo.create({
    username,
    email,
    password: hashedPassword
  });

  await userRepo.save(newUser);
};