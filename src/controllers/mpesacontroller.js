import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// console.log(process.env);

export async function getMpesaToken() {
  const { MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET } = process.env;
  if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
    // logger.error(
    //   "Missing MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET in environment variables"
    // );
    throw new Error(
      "Missing MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET in environment variables"
    );
  }
  const auth = Buffer.from(
    `${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  try {
    // logger.info("Requesting Mpesa token...");
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );
    // logger.info("Mpesa token received successfully");
    return response.data.access_token;
  } catch (error) {
    // logger.error("Failed to get Mpesa token", { error: error.message });
    throw new Error("Failed to get Mpesa token");
  }
}
 
export const initiateSTKPush = async ({ phone, amount }) => {
  const token = await getMpesaToken();
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T.Z]/g, "")
    .slice(0, 14);

  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  ).toString("base64");

  const data = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: process.env.CALLBACK_URL,
    AccountReference: "Test result ",
    TransactionDesc: "Test Payment",
  };
  // console.log(data);
  try {
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("Mpesa STK push response: ",response.data);
    return response.data;
  } catch (error) {
    console.error("error here amnzeee", error.response.data);
    throw new Error(error.response.data.errorMessage);
  }
};

// mesacontroller.js
export const handleCallback = async (req, res) => {
  const callbackData = req.body;

  try {
    // Log or process the callback data (you can save it to a database or log it for now)
    console.log("Mpesa Callback Data: ", callbackData);

    // Process the callback data, for example, check the status of the transaction
    if (callbackData.ResultCode === 0) {
      // Transaction successful, handle success
      console.log("Payment was successful");
    } else {
      // Transaction failed, handle failure
      console.log("Payment failed");
    }

    // Respond to Mpesa to acknowledge receipt of the callback
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ status: "received" }));
  } catch (error) {
    console.error("Error handling callback: ", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: error.message }));
  }
};
