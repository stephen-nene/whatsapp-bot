import express from 'express';
import { handleIncomingMessage } from '../controllers/twilioController.js';
import { initiateSTKPush, handleCallback } from '../controllers/mpesaController.js';
import { getWelcomeMessage } from '../controllers/homeController.js';

const router = express.Router();

// Twilio routes
router.post('/twilio/webhook', handleIncomingMessage);

// M-Pesa routes
router.post('/mpesa/stkpush', initiateSTKPush);
router.post('/mpesa/callback', handleCallback);

// Default route to return a welcome message with a random Ruby joke
router.get('/', getWelcomeMessage);

export default router;
