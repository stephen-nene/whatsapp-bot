import axios from 'axios';

export async function getMpesaToken() {
  const { MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET } = process.env;
  if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
    throw new Error('Missing MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET in environment variables');
  }
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');

  try {
    const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: { Authorization: `Basic ${auth}` },
    });
    // console.log("Token data",response.data)
    return response.data.access_token;
  } catch (error) {
    throw new Error('Failed to get Mpesa token');
  }
}
