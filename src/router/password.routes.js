import { Router, json } from 'express';
import { sendEmailToResetPassword, resetPassword } from '../dao/Mongo/PasswordManager.js';
const router = Router();

router.post('/sendEmail/:email', sendEmailToResetPassword);
router.post('/resetpassword', resetPassword);

export default router;

