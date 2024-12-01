import express from 'express';
import { handleIncomingMessage, handleStatus } from '../controllers/twilioController.js';
import { initiateSTKPush, handleCallback } from '../controllers/mpesaController.js';
import { getWelcomeMessage } from '../controllers/homeController.js';

const router = express.Router();

// Twilio routes
router.post('/twilio/webhook', handleIncomingMessage);
router.post('/twilio/status', handleStatus);

// M-Pesa routes
router.post('/mpesa/stkpush', initiateSTKPush);
router.post('/mpesa/callback', handleCallback);

router.get('/', getWelcomeMessage);

export default router;
