import { Request, Response } from 'express';
import { User } from '../entities/usuario';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { transporters } from '../nodemailer/mailer';

export const register = async (req: Request, res: Response) => {
    const { username, email, password, dni, telefono, birthday } = req.body;

    try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ where: [{ email }, { dni }] });
        if (existingUser) {
            res.status(400).json({ message: 'El email o DNI ya están registrados' });
            return;
        }

        // Crear nuevo usuario
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = User.create({
            username,
            email,
            password: hashedPassword,
            dni,
            telefono,
            birthday: new Date(birthday),
            admin: false,
            confirmacion: false,
            confirmationCode: Math.floor(100000 + Math.random() * 900000).toString()
        });

        await newUser.save();

        await transporters.sendMail({
            from: '"AeroCastle" <no-reply@aerocastle.com>',
            to: email,
            subject: "Código de confirmación AeroCastle",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #0066cc; padding: 20px; text-align: center; color: white;">
                        <h1>¡Bienvenido a AeroCastle, ${username}!</h1>
                    </div>
                    <div style="padding: 20px; background: #f9f9f9;">
                        <p>Tu código de confirmación es:</p>
                        <h2 style="text-align: center; letter-spacing: 3px;">${newUser.confirmationCode}</h2>
                        <p>Ingresa este código en la página de confirmación para activar tu cuenta.</p>
                    </div>
                </div>
            `,
        });

        res.status(201).json({ 
            message: 'Usuario registrado. Por favor revisa tu email para el código de confirmación.',
            userId: newUser.id
        });

    } catch (error) {
        res.status(500).json({ message: 'Error al registrar usuario' });
    }
};

export const confirmAccount = async (req: Request, res: Response) => {
    const { userId, code } = req.body;

    try {
        const user = await User.findOneBy({ id: userId });
        if (!user) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }

        if (user.confirmationCode !== code) {
            res.status(400).json({ message: 'Código de confirmación inválido' });
            return;
        }

        user.confirmacion = true;
        user.confirmationCode = null;
        await user.save();

        res.json({ message: 'Cuenta confirmada exitosamente' });

    } catch (error) {
        res.status(500).json({ message: 'Error al confirmar cuenta' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            res.status(400).json({ message: 'Usuario no encontrado' });
            return;
        }

        if (!user.confirmacion) {
            res.status(400).json({ message: 'Por favor confirma tu cuenta antes de iniciar sesión' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Contraseña incorrecta' });
            return;
        }

        const token = jwt.sign({ 
            id: user.id,
            admin: user.admin // Incluye el estado de admin en el token
        }, "secreto", { expiresIn: "1h" });

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                admin: user.admin // Envía esta información al frontend
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Error al iniciar sesión" });
    }
};