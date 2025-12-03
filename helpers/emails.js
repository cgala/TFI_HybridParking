
import nodemailer from 'nodemailer'
import { DATEONLY } from 'sequelize'

const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
    });

    const { email, nombre, token } = datos
    //enviar mail
    await transport.sendMail({
        from: 'HybridParking.com.ar',
        to: email,
        subject: 'Confirma tu cuenta en HybridParking.com.ar',
        text: 'Confirma tu cuenta en HybridParking.com.ar',
        html: `
            <p> Hola ${nombre}, confirma tu cuenta en HybridParking</p>
            <p> Clic en el siguiente enlace: 
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar cuenta</a></p>

            <p> Si usten no creo esta cuenta, ignore el mensaje</p>
        `
    })

}

const emaiLOlvidePassword = async (datos) => {
    const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
    });

    const { email, nombre, token } = datos
    //enviar mail
    await transport.sendMail({
        from: 'HybridParking.com.ar',
        to: email,
        subject: 'Cambiar password en HybridParking.com.ar',
        text: 'Cambiar password en HybridParking.com.ar',
        html: `
            <p> Hola ${nombre}, cambia tu password en HybridParking</p>
            <p> Clic en el siguiente enlace: 
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">Cambiar password</a></p>

            <p> Si usten no solicito el cambio de password, ignore el mensaje</p>
        `
    })

}

export {
    emailRegistro,
    emaiLOlvidePassword
}