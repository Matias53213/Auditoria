const nodemailer = require("nodemailer");


export const transporters = nodemailer.createTransport({
  host: "smtp.gmail.com", // 'smtp.gmail.com'
  port: "465", // 465 para segura, 587 para insegura
  secure: true,
  auth: {
    user: "matiassolis894@gmail.com", // 'tu correo electrónico',
    pass: "majt xlfe izkg blph", // 'tu contraseña de aplicación' esto se hace si tenes la verificación en dos pasos activada
  },
});

(async () => {
  try {
    await transporters.verify();
    console.log("✅ Listo para enviar correos electrónicos");
  } catch (err) {
    console.error("❌ Error al verificar transporter:", err);
  }
})();