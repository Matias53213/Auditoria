// src/services/email.service.ts
import nodemailer from 'nodemailer';

// Configuración del transporter (igual a tu ejemplo que funciona)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Función para enviar confirmación de pago
export const sendPaymentConfirmationEmail = async (email: string, username: string, amount: number) => {
  try {
    const currentDate = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    await transporter.sendMail({
      from: '"AeroCastle" <no-reply@aerocastle.com>',
      to: email,
      subject: "Confirmación de Pago",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: #000; padding: 25px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">¡Pago Confirmado, ${username}!</h1>
          </div>
          
          <div style="padding: 25px;">
            <p style="font-size: 16px; line-height: 1.6; color: #333;">Hemos recibido tu pago de <strong>$${amount.toFixed(2)}</strong> el ${currentDate}.</p>
            
            <div style="background: #f8f8f8; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold; color: #000;">Tu reserva ha sido confirmada exitosamente.</p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #333;">Si tienes alguna pregunta sobre tu reserva, no dudes en contactarnos respondiendo a este correo.</p>
            
            <p style="font-size: 14px; color: #777; margin-top: 30px;">Gracias por elegir AeroCastle.</p>
          </div>
          
          <div style="background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p style="margin: 0;">© ${new Date().getFullYear()} AeroCastle. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
    });
    console.log('Correo de confirmación de pago enviado');
  } catch (error) {
    console.error('Error al enviar correo de confirmación:', error);
    throw error;
  }
};