import express from 'express';
import { handleIncomingMessage, handleStatus } from '../controllers/twilioController.js';
import { initiateSTKPush, handleCallback } from '../controllers/mpesaController.js';
import { getWelcomeMessage } from '../controllers/homeController.js';
import { getDatabaseController } from '../controllers/databaseController.js';

const router = express.Router();

// Welcome route
router.get('/', getWelcomeMessage);

// Twilio routes
router.post('/twilio/webhook', handleIncomingMessage);
router.post('/twilio/status', handleStatus);

// M-Pesa routes
router.post('/mpesa/stkpush', initiateSTKPush);
router.post('/mpesa/callback', handleCallback);


// Database routes
// Users
router.get('/users', getDatabaseController.getAllUsers);
router.get('/users/:id', getDatabaseController.getUserById);

// // Test Results
router.get('/results', getDatabaseController.getAllTestResults);
router.get('/users/:userId/results', getDatabaseController.getTestResultsByUser);

// // Sessions
router.get('/sessions', getDatabaseController.getAllSessions);
router.get('/users/:userId/sessions', getDatabaseController.getSessionsByUser);

export default router;