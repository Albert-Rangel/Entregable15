
import { userModel } from '../dao/models/user.model.js';
import { logger } from '../utils/logger.js';

export default class usersService {

    async changeRol(uid) {
        try {

            
            var newRol = ""
            const user = await userModel.find({ _id: uid });
            const role = user[0].role
           
            if (role === "Admin" || role === "admin") {
                
                newRol="Premium"
                await userModel.updateOne(
                    { "_id": uid },
                    { $set: { role: "Premium" } }
                )

            } else if (role === "Premium" || role === "premium") {
                
                newRol="Admin"
                await userModel.updateOne(
                    { "_id": uid },
                    { $set: { role: "Admin" } }
                )
            }

            return `SUC|`+ newRol
        } catch (error) {
            logger.error("Error en UseressService/changeRol: " + error)
            return `ERR|Error generico. Descripcion :${error}`
        }
    }

}