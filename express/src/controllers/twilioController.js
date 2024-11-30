import pkg from "twilio";
const { twiml } = pkg;

import logger from "../utils/logger.js";
import { initiateSTKPushRequest } from "../controllers/mpesaController.js";
const registeredUsers = {
  12345: {
    id: 1234,
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "+1234567890",
    membership_level: "Gold",
  },
};

const userSessions = {};

const checkRegistrationNumber = (regNumber) => {
  const userInfo = registeredUsers[regNumber.toUpperCase()];
  if (userInfo) {
    return [true, userInfo];
  }
  return [false, null];
};

const cleanPhoneNumber = (phoneNumber) => {
  const cleaned = phoneNumber.replace(/[^\d]/g, "");
  const regex = /^2547\d{8}$/;
  if (!regex.test(cleaned)) {
    throw new Error("Invalid phone number format");
  }
  return parseInt(cleaned);
};

export const handleIncomingMessage = async (req, res) => {
  const { From: fromNumber, Body: body } = req.body;
  const response = new twiml.MessagingResponse();

  try {
    logger.info(`Received message from ${fromNumber}: ${body.trim()}`);

    if (!userSessions[fromNumber]) {
      userSessions[fromNumber] = { state: "awaiting_registration" };
      response.message(
        "👋 Welcome! Please send your registration number to proceed."
      );
    } else if (userSessions[fromNumber].state === "awaiting_registration") {
      const regNumber = body.trim();
      userSessions[fromNumber].registration_number = regNumber;

      const [isValid, userInfo] = checkRegistrationNumber(regNumber);
      if (isValid) {
        userSessions[fromNumber].state = "processing_payment";
        userSessions[fromNumber].user_info = userInfo;

        response.message(
          `✅ Registration number ${regNumber} found for ${userInfo.name}.\nProceeding to payment...`
        );
        response.message(
          `💵 A payment request of Ksh 100 has been sent to your phone ${fromNumber}. Please approve the transaction.`
        );

        logger.info(
          `Registration number ${regNumber} found for ${userInfo.name}. Proceeding to payment.`
        );

        initiateSTKPushRequest({
          phone: cleanPhoneNumber(fromNumber),
          amount: 100,
        })
          .then((mpesaResponse) => {
            if (mpesaResponse) {
              response.message(
                `✅ Payment request sent! Please approve the transaction on your phone.`
              );
              userSessions[fromNumber].state = "awaiting_password";
            } else {
              response.message(
                `❌ There was an issue with the payment request. Please try again.`
              );
            } 

            response.message(mpesaResponse.ResponseDescription);

          })
          .catch((error) => {
            console.error("Error with M-Pesa STK push:", error);
            response.message(
              "❌ Error processing payment. Please try again later."
            );
            userSessions[fromNumber].state = "awaiting_registration"; 
          });

      } else {
        response.message(
          `❌ Registration number ${regNumber} not found. Please check and try again.`
        );
        userSessions[fromNumber].state = "awaiting_registration"; 

        logger.warn(
          `Invalid registration number ${regNumber} for user ${fromNumber}.`
        );
      }
    } else if (userSessions[fromNumber].state === "awaiting_password") {
      userSessions[fromNumber].password = body.trim();
      userSessions[fromNumber].state = "completed";

      const userInfo = userSessions[fromNumber].user_info || {};
      response.message(
        `✅ Payment successful! Thank you, ${userInfo.name}.\nHere are your details:\n` +
          `- Name: ${userInfo.name}\n- Email: ${userInfo.email}\n- Phone: ${userInfo.phone}\n- Membership Level: ${userInfo.membership_level}`
      );

      logger.info(
        `Payment successful for user ${fromNumber}. Transaction complete.`
      );

      delete userSessions[fromNumber];
    } else {
      response.message(
        "❓ I'm sorry, I didn't understand that. Please start again by sending your registration number."
      );
      userSessions[fromNumber].state = "awaiting_registration"; // Reset state

      // Log unrecognized input
      logger.warn(`Unrecognized input from ${fromNumber}. Resetting session.`);
    }

    res.type("text/xml").send(response.toString());
  } catch (error) {
    console.error("Error processing message:", error);

    // Log error
    logger.error(
      `Error processing message from ${fromNumber}: ${error.message}`
    );

    // response.message(
    //   `🚨 There was an error processing your request: ${error.message}`
    // );
    res.type("text/xml").send(response.toString());
  }
};
