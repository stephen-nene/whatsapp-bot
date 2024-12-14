import axios from 'axios';
import twilio from "twilio";
import logger from './logger.js';

export async function getMpesaToken() {
  const { MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET } = process.env;
  if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
    logger.error("Missing MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET in environment variables");
    throw new Error('Missing MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET in environment variables');
  }
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');

  try {
    logger.info("Requesting Mpesa token...");
    const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: { Authorization: `Basic ${auth}` },
    });
    logger.info("Mpesa token received successfully");
    return response.data.access_token;
  } catch (error) {
    logger.error("Failed to get Mpesa token", { error: error.message });
    throw new Error('Failed to get Mpesa token');
  }
}

export const sendTwilioMessage = async (to, message) => {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  try {
    logger.info(`Sending Twilio message to ${to}: ${message}`);
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: to,
    });
    logger.info("Twilio message sent successfully");
  } catch (error) {
    logger.error("Error sending Twilio message", { to, message, error: error.message });
  }
};
