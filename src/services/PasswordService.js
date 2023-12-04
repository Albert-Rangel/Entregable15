
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

            const { email } = req;

            const user = await userModel.find({ email: email });

            if (!user) {
                return `E02|El email no se encuentra agregado.`;
            }

            const token = generateRandomString(16);

            var userPassword = new userPasswordModel({
                userId: user._id,
                email: email,
                token: token,
                is_used: false
            });

            const data = {
                email: email,
                token: token
            }

            const emailHTMLTemplate = await emailService.getEmailTemplate(data);

            await emailService.sendEmailRecover(email, 'Recuperar contraseña', emailHTMLTemplate);

            await userPassword.save();

            return `SUC|Exito! Se envio un link a su correo para continuar con el restablecimiento de contraseña/`;

        } catch (error) {
            logger.error("Error en PasswordService/sendEmailToResetPassword: " + error)

            return `ERR|Error generico. Descripcion :${error}`
        }
    }

    async resetPassword(req, res) {
        try {

            var { token_, password, password2 } = req

            const userPassword = await userPasswordModel.find({ token: token_ });
            
            const email = userPassword[0].email;

            if (!userPassword || userPassword == null || Object.keys(userPassword).length === 0 ) {
                return `E02|No se encontro el token en base de datos.`;
            }

            if (userPassword[0].isUsed === true) {
                return `E02|Token ya usado o expirado.`;
            }

            if (password !== password2) {
                return `E02|las contraseñas son diferentes.`;
            }

            const usertoUpdate = await userModel.findOne({ email }).lean();

            var previouspassEncryp = usertoUpdate.password
            console.log("previouspassEncryp " + previouspassEncryp)

            var newpassEncryp = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
            var newpassEncryp1 = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
            console.log("newpassEncryp " + newpassEncryp)
            console.log("newpassEncryp1 " + newpassEncryp1)

            if(previouspassEncryp == newpassEncryp){
                return `E02|La contraseña ingresada es la misma que la anterior.`;
            }

            if (!usertoUpdate) {
                return `E02|No existe usuario con el correo asociado al token.`;
            }

            usertoUpdate.password = newpassEncryp;
            await userModel.updateOne({ email }, usertoUpdate);

            await userPasswordModel.updateOne(
                { "email": email },
                { $set: { isUsed: true } }
            )

            return `SUC|Exito.`;

        } catch (error) {
            logger.error("Error en PasswordService/resetPassword: " + error)

            return `ERR|Error generico. Descripcion :${error}`
        }
    }
}