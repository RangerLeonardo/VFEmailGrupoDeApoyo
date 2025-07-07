import { Resend } from 'resend';
// api/send-email.js

const resend = new Resend(process.env.RESEND_API_KEY);

// Esta es la estructura que Vercel espera para sus funciones serverless
module.exports = async (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', 'https://asismonserrat.github.io'); // Cambia esto al dominio de tu portafolio o al localhost para pruebas
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Manejo de la solicitud "preflight" (OPTIONS)
    if (req.method === 'OPTIONS') {
        res.status(200).end(); // Responder con éxito a la preflight y terminar
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).setHeader('Allow', 'POST').json({ message: 'Método no permitido' });
        return;
    }

    let data;
    try {
        data = req.body;
    } catch (error) {
        console.error('Error parsing JSON:', error);
        res.status(400).json({ message: 'JSON de solicitud inválido.' });
        return;
    }

    // --- ¡CAMBIOS AQUÍ! Extraer los datos con los nombres de tu formulario React ---
    const { name,email,message, atack } = data;

    if (atack && atack.trim().length > 0) {
        console.error('Atack detected:', atack);
        res.status(400).json({ message: 'No se ha podido establecer conexión, verifica la información.' });
        return;
    }

    // Validación básica (ajustada a los nuevos nombres)
    if (!name || !email || !message) { 
        res.status(400).json({ message: 'Por favor, completa los campos requeridos (Nombre, email y mensaje).' });
        return;
    }

    try {
        const emailResponse = await resend.emails.send({
            from: 'Grupo de apoyo <GrupoDeApoyo@resend.dev>',
            to: 'asisglez12@gmail.com',
            subject: `Mensaje de Contacto - de ${name}`, // Asunto más detallado
            html: `
                <p>Has recibido un nuevo mensaje desde el formulario de grupo de apoyo:</p>
                <p><strong>Nombre:</strong> ${name}</p>
                <p><strong>Correo Electrónico:</strong> ${email}</p>
                <p><strong>Mensaje:</strong></p>
                <p>${message}</p>
                <br>
                <p>---</p>
                <p>Este correo fue enviado desde tu formulario de contacto del grupo de apoyo.</p>
            `,
        });

        console.log('Email enviado con éxito:', emailResponse);
        res.status(200).json({ message: 'Mensaje enviado con éxito', id: emailResponse.id });

    } catch (error) {
        console.error('Error al enviar el email con Resend:', error);
        res.status(500).json({ message: 'Error al enviar el mensaje. Por favor, inténtalo de nuevo más tarde.', error: error.message });
    }
};