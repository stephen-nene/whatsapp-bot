import axios from "axios";
import { getMpesaToken } from "../utils/helper.js";
import logger from "../utils/logger.js";

// function to call the mpesa STK push service
export const initiateSTKPushRequest = async ({ phone, amount }) => {
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
    // console.log("Mpesa STK push response: ",response.data);
    return response.data;
  } catch (error) {
    console.error("error here amnzeee", error.response.data);
    throw new Error(error.response.data.errorMessage);
  }
};

// endpoint for post STK mpesa request
export const initiateSTKPush = async (req, res) => {
  const { phone, amount } = req.body;

  try {
    const response = await initiateSTKPushRequest({ phone, amount });

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const handleCallback = (req, res) => {
  console.log("response from callback: ",req.body);
  try {
    const callbackBody = req.body?.Body?.stkCallback;

    if (!callbackBody) {
      logger.error("Invalid callback payload received", { payload: req.body });
      return res.status(400).json({
        error: "Invalid callback payload received",
      });
    }
// return the usersession.status, message, ResultDesc
    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } =
      callbackBody;

    logger.info("M-Pesa Callback Received", {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
    });

    // Handle specific result codes
    switch (ResultCode) {
      case 0: // Success
        logger.info("Transaction successful", {
          MerchantRequestID,
          CheckoutRequestID,
        });
        res.status(200).json({
          message: "Transaction processed successfully",
          MerchantRequestID,
          CheckoutRequestID,
        });
        break;

      case 1032: // Request canceled by user
        logger.warn("User canceled the request", {
          MerchantRequestID,
          CheckoutRequestID,
        });
        res.status(200).json({
          error: "User canceled the transaction",
          suggestion: "Inform the user to retry or check their actions.",
        });
        break;

      case 1037: // User cannot be reached
        logger.warn("DS timeout: User cannot be reached", {
          MerchantRequestID,
          CheckoutRequestID,
        });
        res.status(200).json({
          error: "User cannot be reached. Retry later.",
          suggestion: "Ensure the target SIM is active and reachable.",
        });
        break;

      case 2001: // Invalid initiator information
        logger.error("Invalid initiator information", {
          MerchantRequestID,
          CheckoutRequestID,
        });
        res.status(200).json({
          error: "Invalid initiator information.",
          suggestion:
            "Verify credentials or ask user to input the correct PIN.",
        });
        break;

      default:
        logger.error("Unhandled ResultCode received", {
          ResultCode,
          ResultDesc,
        });
        res.status(500).json({
          error: `An error occurred: ${ResultDesc}`,
          ResultCode,
        });
        break;
    }
  } catch (error) {
    logger.error("Error handling M-Pesa Callback", {
      error: error.message,
      stack: error.stack,
    });
    res
      .status(500)
      .send("An unexpected error occurred while processing the callback.");
  }
};
