import {
  searchBusinesses,
  getBusiness,
  registerBusiness,
  updateBusiness,
  deleteBusiness,
  rateBusiness,
  verifyBusiness,
  addRep,
  removeRep,
  addPhone,
  removePhone,
  addService,
  removeService,
  addSocialMedia,
  removeSocialMedia
} from '../controller/businessController';
import { Router } from 'express';
import { auth } from '../middleware/auth';
import { verifyPhones, verifyRCNoWithName, verifyEmail } from '../middleware/verification';

const router = Router();

router.get('/', searchBusinesses)
router.get('/:id', getBusiness)
router.post('/', verifyRCNoWithName, verifyPhones, verifyEmail, registerBusiness)
router.patch('/:id', auth, updateBusiness)
router.delete('/:id', auth, deleteBusiness)
router.patch('/:id/rate', auth, rateBusiness)
router.post('/:id/verify', auth, verifyBusiness)
router.patch('/:id/rep/add', auth, addRep)
router.patch('/:id/rep/remove', auth, removeRep)
router.patch('/:id/phone/add', auth, verifyPhones, addPhone)
router.patch('/:id/phone/remove', auth, removePhone)
router.patch('/:id/service/add', auth, addService)
router.patch('/:id/service/remove', auth, removeService)
router.patch('/:id/socialmedia/add', auth, addSocialMedia)
router.patch('/:id/socialmedia/remove', auth, removeSocialMedia)

export default router;
