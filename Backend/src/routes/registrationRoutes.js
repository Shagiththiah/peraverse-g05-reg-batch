import express from 'express';
import {
  getProvinces, getDistricts, getSchools,
  getUniversities, getDepartments, registerVisitor
} from '../controllers/registrationController.js';

const router = express.Router();
router.get('/provinces', getProvinces);
router.get('/districts', getDistricts);
router.get('/schools', getSchools);
router.get('/universities', getUniversities);
router.get('/departments', getDepartments);
router.post('/register', registerVisitor);
export default router;
