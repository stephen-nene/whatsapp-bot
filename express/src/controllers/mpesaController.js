import axios from 'axios';
import { getMpesaToken } from '../utils/mpesaHelper.js';

export const initiateSTKPush = async (req, res) => {
  const { phone, amount } = req.body;
  const token = await getMpesaToken();

  const data = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${Date.now()}`).toString('base64'),
    Timestamp: Date.now().toString(),
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phone,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: process.env.CALLBACK_URL,
    AccountReference: 'Test',
    TransactionDesc: 'Test Payment',
  };

  try {
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const handleCallback = (req, res) => {
  console.log('Mpesa Callback:', req.body);
  res.status(200).send('Callback received');
};
