const nodemailer = require('nodemailer');

/**
 * Envía un correo electrónico con archivos adjuntos
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const enviarCorreo = async (req, res) => {
  try {
    const { para, cc, asunto, mensaje, archivos_info } = req.body;
    
    // Validar campos requeridos
    if (!para || !asunto || !mensaje) {
      return res.status(400).json({
        success: false,
        message: 'Los campos para, asunto y mensaje son requeridos'
      });
    }

    // Configurar el transporter de nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Configurar los archivos adjuntos
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push({
          filename: file.originalname,
          content: file.buffer,
          contentType: file.mimetype
        });
      });
    }

    // Debug: Mostrar el mensaje recibido
    console.log('📧 Mensaje recibido en backend:', mensaje);
    console.log('📧 ¿Contiene HTML?', mensaje.includes('<') && mensaje.includes('>'));
    
    // Determinar si el mensaje contiene HTML
    const isHTML = mensaje.includes('<') && mensaje.includes('>');
    
    // Configurar el correo
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: para,
      cc: cc || undefined,
      subject: asunto,
      text: isHTML ? mensaje.replace(/<[^>]*>/g, '') : mensaje, // Texto plano sin HTML
      html: isHTML ? mensaje : mensaje.replace(/\n/g, '<br>'), // HTML preservado o convertido
      attachments: attachments
    };

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Correo enviado exitosamente',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al enviar el correo',
      error: error.message
    });
  }
};

/**
 * Verifica la configuración del servicio de correo
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const verificarConfiguracion = async (req, res) => {
  try {
    // Verificar que las variables de entorno estén configuradas
    const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Configuración incompleta',
        missingVariables: missingVars
      });
    }

    // Crear transporter para verificar la conexión
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Verificar la conexión
    await transporter.verify();

    res.json({
      success: true,
      message: 'Configuración de correo verificada correctamente'
    });

  } catch (error) {
    console.error('Error al verificar configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar la configuración del correo',
      error: error.message
    });
  }
};

module.exports = {
  enviarCorreo,
  verificarConfiguracion
};