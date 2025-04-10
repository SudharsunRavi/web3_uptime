import express from 'express';
import { createWeb, getStatus, getWebsites, deleteWeb } from '../controllers/endpoints.controller.js';
import authenticateUser from '../authenticateUser.js';

const router = express.Router();

router.post('/', authenticateUser, createWeb);
router.get('/', authenticateUser, getWebsites);
router.delete('/delete', authenticateUser, deleteWeb);
router.get('/status', authenticateUser, getStatus);

export default router;