const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config(); // Carga las variables de entorno desde el archivo .env

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ruta del formulario de contacto
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  // Validación básica
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "Todos los campos son obligatorios." });
  }

  // Configuración del transporte SMTP usando las variables .env
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true", // "true" o "false" como texto en el .env
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // Opciones del correo
  const mailOptions = {
    from: `"Formulario Web" <${process.env.SMTP_USER}>`,
    to: process.env.TO_EMAIL,
    subject: "Nuevo mensaje desde la web de Mi Refugio Olmué",
    html: `
      <h3>Nuevo mensaje desde el formulario de contacto</h3>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${message}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Mensaje enviado con éxito." });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).json({ success: false, error: "Error al enviar el correo." });
  }
});

// Puerto del servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
