import { Router } from 'express';
import {
  signupUser, loginUser, resetPassword, updateUsers, logoutUser, verifyUser/*, setResetToken, verifyUser, forgotPassword, resendVerificationEmail*/
} from '../controller/userController';
import { auth, oneTimeTokenAuth } from '../middleware/auth';
const router = Router();

router.post('/register', signupUser);
//router.patch('/verify/:id', oneTimeTokenAuth, verifyUser);
//router.get('/verify/:id', resendVerificationEmail);
router.post('/login', loginUser);
//router.patch('/forgotPassword', forgotPassword);
//router.post('/resetPassword/:id', setResetToken);
//router.patch('/resetPassword/:id', oneTimeTokenAuth, resetPassword);
router.patch('/update/:id', auth, updateUsers);
router.get('/logout', logoutUser)
router.post('/kyc/:id', auth, verifyUser);


export default router;
