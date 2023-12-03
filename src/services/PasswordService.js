
import { userModel } from '../dao/models/user.model.js';
import { userPasswordModel } from '../dao/models/user-password.model.js';
import { logger } from '../utils/logger.js';
import { generateRandomString } from '../utils/credentials.util.js';
import emailsService from '../services/emailService.js';

import bcrypt from 'bcrypt';
const emailService = new emailsService()


export default class passwordService {

    async sendEmailToResetPassword(req, res) {
        try {
            console.log("entro en CERVICE sendEmailToResetPassword")

            const { email } = req.params;
            console.log("email" + email)

            const user = await userModel.findOne({
                where: {
                    email: email
                }
            });

            if (!user) {
                console.log("ENTRO EN IF")
                return `E02|El email no se encuentra agregado.`;
            }

            // let userPassword = await UserPassword.findOne({
            //     where: {
            //         userId: user.getDataValue('id'),
            //         isUsed: false
            //     }
            // });

            // if (userPassword) {
            //     userPassword.setDataValue('isUsed', true);
            //     await userPassword.save();
            // }

            const token = generateRandomString(16);
            console.log("TOKEN" + token)

            userPassword = new userPasswordModel({
                userId: user._id,
                email: email,
                token: token,
                is_used: false
            });

            const data = {
                email: email,
                token: token
            }
            console.log("data" + data)

            console.log("creare al template")
            const emailHTMLTemplate = emailService.getEmailTemplate(data);
            console.log("emailHTMLTemplate " + emailHTMLTemplate)

            await emailService.sendEmailRecover(email, 'Recuperar contraseña', emailHTMLTemplate);
            await userPassword.save();
            console.log("se salvo el token en bd")

            return `SUC|Exito.`;

        } catch (error) {
            logger.error("Error en PasswordService/sendEmailToResetPassword: " + error)

            return `ERR|Error generico. Descripcion :${error}`
        }
    }

    async resetPassword(req, res) {
        try {

            const { token } = req.params;
            const { password, password2 } = req.body;

            var userPassword = await userPasswordModel.findOne({
                where: {
                    token: token
                }
            });
            var email = userPassword.email

            if (!userPassword) {
                return `E02|No se encontro el token en base de datos.`;
            }

            if (userPassword.getDataValue('isUsed') === true) {
                return `E02|Token ya usado o expirado.`;
            }

            if (password !== password2) {
                return `E02|las contraseñas son diferentes.`;
            }

            const usertoUpdate = await userModel.findOne({ email }).lean();

            if (!usertoUpdate) {
                return `E02|No existe usuario con el correo asociado al token.`;
            }

            usertoUpdate.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
            await userModel.updateOne({ email }, usertoUpdate);


            userPassword.setDataValue('isUsed', true);
            await userPassword.save();

            return `SUC|Exito.`;

        } catch (error) {
            logger.error("Error en PasswordService/resetPassword: " + error)

            return `ERR|Error generico. Descripcion :${error}`
        }
    }
}