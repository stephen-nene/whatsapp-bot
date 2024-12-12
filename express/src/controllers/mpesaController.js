// mesacontroller.js
import axios from "axios";
import { getMpesaToken } from "../utils/helper.js";
import logger from "../utils/logger.js";
import { userSessions } from "../utils/sessionUtils.js";
import { sendTwilioMessage } from "../utils/helper.js";
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
  // console.log("Response from callback: ", req.body?.Body.stkCallback);
  try {
    const callbackBody = req.body?.Body?.stkCallback;

    if (!callbackBody) {
      logger.error("Invalid callback payload received", { payload: req.body });
      return res.status(400).json({
        error: "Invalid callback payload received",
      });
    }
    
    // Destructure the relevant data from the callback
    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } = callbackBody;

    logger.info("M-Pesa Callback Received", {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
    });

    // Find the session matching the CheckoutRequestID
    const session = Object.values(userSessions).find(
      (session) => session.checkout_id === CheckoutRequestID
    );

    if (!session) {
      logger.warn("No matching user session found for this callback", {
        CheckoutRequestID,
      });
      return res.status(404).json({ error: "User session not found" });
    }

    // console.log("User session found", session);

    // Update session state based on payment result
    session.state = ResultCode === "0" ? "payment_done" : "payment_done";
    // session.state = "payment_done"

    // Handle specific result codes
    let message = '';
    switch (ResultCode) {
      case "0": // Success
        logger.info("Transaction successful", {
          MerchantRequestID,
          CheckoutRequestID,
        });
        message = `✅ Payment successful! Thank you, ${session.user_info.name}.\nHere are your details:\n- Name: ${session.user_info.name}\n- Email: ${session.user_info.email}\n- Phone: ${session.user_info.phone}\n- Membership Level: ${session.user_info.membership_level}`;
        break;

      case "1032": // Request canceled by user
        logger.warn("User canceled the request", {
          MerchantRequestID,
          CheckoutRequestID,
        });
        message = "❌ Transaction canceled by you. Please try again if you wish.";
        break;

      case "1037": // User cannot be reached
        logger.warn("DS timeout: User cannot be reached", {
          MerchantRequestID,
          CheckoutRequestID,
        });
        message = "❌ We couldn't reach your phone. Please ensure your number is correct and try again later.";
        break;

      case "2001": // Invalid initiator information
        logger.error("Invalid initiator information", {
          MerchantRequestID,
          CheckoutRequestID,
        });
        message = "❌ Invalid payment details. Please check your information and try again.";
        break;

      default:
        logger.error("Unhandled ResultCode received", {
          ResultCode,
          ResultDesc,
        });
        message = `❓ An error occurred: ${ResultDesc}. Please try again later.`;
        break;
    }

    // Send a WhatsApp message to the user with the relevant message
    if (session.wa_info?.WaId) {
      sendTwilioMessage(session.wa_info.From, message)
        .then(() => {
          logger.info("Message sent successfully to user", { WaId: session.wa_info.WaId });
        })
        .catch((error) => {
          logger.error("Error sending message to user", { error: error.message });
        });
    } else {
      logger.warn("No WhatsApp number found for user session");
    }

    // Respond with the appropriate status and message
    // res.status(200).json({
    //   message: `Transaction processed successfully with ResultCode ${ResultCode}`,
    //   MerchantRequestID,
    //   CheckoutRequestID,
    // });
  } catch (error) {
    logger.error("Error handling M-Pesa Callback", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).send("An unexpected error occurred while processing the callback.");
  }
};