import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();  // Cargar las variables del archivo .env

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ruta para recibir datos del formulario y enviar correo
app.post('/api/contact', async (req, res) => {
  const { name, email, message, phone, checkIn, checkOut, people } = req.body;

  // Validaciones mínimas
  if (!name || !email || !message || !phone || !checkIn || !checkOut || !people) {
    return res.status(400).json({ success: false, error: 'Todos los campos son obligatorios' });
  }

  try {
    // Configuración de Nodemailer para SMTP personalizado
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,  // El host del servidor SMTP
      port: process.env.SMTP_PORT || 587,  // Puerto (587 para STARTTLS o 465 para SSL)
      secure: process.env.SMTP_PORT == 465,  // Usa SSL si el puerto es 465
      auth: {
        user: process.env.MAIL_USER,  // Tu correo electrónico como usuario
        pass: process.env.MAIL_PASS,  // Contraseña o token de acceso
      },
      tls: {
        rejectUnauthorized: false,  // Asegúrate de que los certificados SSL sean válidos
      },
    });

    // Configuración del correo
    const mailOptions = {
      from: `"${name}" <${email}>`,  // De quien es el correo
      to: process.env.MAIL_TO,       // Destinatario del correo (tu correo)
      subject: 'Nuevo mensaje de contacto',  // Asunto del correo
      html: `
        <h3>Nuevo mensaje desde Mi Refugio Olmué</h3>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${phone}</p>
        <p><strong>Fecha de llegada:</strong> ${checkIn}</p>
        <p><strong>Fecha de salida:</strong> ${checkOut}</p>
        <p><strong>Número de personas:</strong> ${people}</p>
        <p><strong>Mensaje:</strong><br/>${message}</p>
      `,
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);

    // Respuesta de éxito
    res.status(200).json({ success: true, message: 'Mensaje enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({ success: false, error: 'Error al enviar el mensaje' });
  }
});

// Configurar el puerto
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
