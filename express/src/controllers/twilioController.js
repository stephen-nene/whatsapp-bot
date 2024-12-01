import pkg from "twilio";
const { twiml } = pkg;

import logger from "../utils/logger.js";
import {
  initiateSTKPushRequest,
  handleCallback,
} from "../controllers/mpesaController.js";

import { sendTwilioMessage } from "../utils/helper.js";
import {
  checkRegistrationNumber,
  userSessions,
  cleanPhoneNumber,
  SessionStates,
  SessionManager,
  MessageTemplates
} from "../utils/sessionUtils.js";


export const handleIncomingMessage = async (req, res) => {
  const {AccountSid: accountSid, From: fromNumber, Body: body } = req.body;
  console.log("All sessions:", userSessions);
  console.log("Session for this account:", userSessions[accountSid]);

  try {
    logger.info(`Received message from ${fromNumber}: ${body.trim()}`);
    
    const response = await processUserMessage(accountSid, body.trim());
    
    res.type("text/xml").send(response.toString());
  } catch (error) {
    handleMessageProcessingError(fromNumber, error, res);
  }
};


async function processUserMessage(accountSid, body) {
  const twimlResponse = new twiml.MessagingResponse();
  
  const currentSession = userSessions[accountSid];
  
  if (!currentSession) {
    return handleNewSession(accountSid, twimlResponse);
  }
  
  switch (currentSession.state) {
    case SessionStates.AWAITING_REGISTRATION:
      return handleRegistrationState(accountSid, body, twimlResponse);
    
    case SessionStates.PROCESSING_PAYMENT:
      return handlePaymentProcessing(accountSid, body, twimlResponse);
    
    case SessionStates.PAYMENT_DONE:
      return handlePaymentDone(accountSid, body, twimlResponse);
    
    default:
      return handleUnrecognizedState(accountSid, twimlResponse);
  }
}

function handleNewSession(fromNumber, twimlResponse) {
  SessionManager.initializeSession(userSessions, fromNumber);
  twimlResponse.message(MessageTemplates.WELCOME);
  return twimlResponse;
}

function handleRegistrationState(fromNumber, twimlResponse) {
  SessionManager.initializeSession(userSessions, fromNumber);
  twimlResponse.message(MessageTemplates.WELCOME);
  return twimlResponse;
}

export const handleIncomingMessage2 = async (req, res) => {
  const { AccountSid: accountSid, From: fromNumber, Body: body } = req.body;


  const response = new twiml.MessagingResponse();

  try {
    logger.info(
      `Received message from ${fromNumber} (AccountSid: ${accountSid}): ${body.trim()}`
    );

    if (!userSessions[accountSid]) {
      userSessions[accountSid] = { state: "awaiting_registration" };
      response.message(
        `👋 Welcome! ${req?.body?.ProfileName} Please send your registration number to proceed.`
      );
    } else if (userSessions[accountSid].state === "awaiting_registration") {
      const regNumber = body.trim();
      userSessions[accountSid].registration_number = regNumber;

      const [isValid, userInfo] = checkRegistrationNumber(regNumber);
      if (isValid) {
        userSessions[accountSid].state = "processing_payment";
        userSessions[accountSid].user_info = userInfo;

        response.message(
          `🔓 Welcome back ${userInfo.name}.\n⌛Processing your 💸 payment ...`
        );
        logger.info(
          `Registration number ${regNumber} found for ${userInfo.name}. Proceeding to payment.`
        );
        setTimeout(async () => {
          const moneyres = await initiateSTKPushRequest({
            phone: cleanPhoneNumber(fromNumber),
            amount: 1000,
          });
          if (moneyres?.ResponseCode === "0") {
            sendTwilioMessage(fromNumber, `✅ ${moneyres.ResponseDescription}`);
          }
        }, 4000);
      } else {
        response.message(
          `❌ Registration number ${regNumber} not found. Please check and try again.`
        );
        userSessions[accountSid].state = "awaiting_registration";

        logger.warn(
          `Invalid registration number ${regNumber} for AccountSid ${accountSid}.`
        );
      }
    } else if (userSessions[accountSid].state === "awaiting_password") {
      userSessions[accountSid].password = body.trim();
      userSessions[accountSid].state = "completed";

      const userInfo = userSessions[accountSid].user_info || {};
      response.message(
        `✅ Payment successful! Thank you, ${userInfo.name}.\nHere are your details:\n` +
          `- Name: ${userInfo.name}\n- Email: ${userInfo.email}\n- Phone: ${userInfo.phone}\n- Membership Level: ${userInfo.membership_level}`
      );

      logger.info(
        `Payment successful for AccountSid ${accountSid}. Transaction complete.`
      );

      delete userSessions[accountSid];
    } else {
      response.message(
        "❓ I'm sorry, I didn't understand that. Please start again by sending your registration number."
      );
      userSessions[accountSid].state = "awaiting_registration"; // Reset state

      // Log unrecognized input
      logger.warn(
        `Unrecognized input from AccountSid ${accountSid}. Resetting session.`
      );
    }

    res.type("text/xml").send(response.toString());
  } catch (error) {
    console.error("Error processing message:", error);

    // Log error
    logger.error(
      `Error processing message from AccountSid ${accountSid}: ${error.message}`
    );

    res.type("text/xml").send(response.toString());
  }
};

function handleMessageProcessingError(fromNumber, error, res) {
  console.error("Error processing message:", error);
  
  logger.error(
    `Error processing message from ${fromNumber}: ${error.message}`
  );
  
  const twimlResponse = new twiml.MessagingResponse();
  res.type("text/xml").send(twimlResponse.toString());
}

export const handleStatus = async (req, res) => {
  const statusData = req.body;
  // console.log(statusData);

  try {
    // Log the received status data
    logger.info("Received Twilio status update", { statusData });

    const {
      MessageSid,
      MessageStatus,
      SmsStatus,
      To,
      From,
      ApiVersion,
      StructuredMessage,
    } = statusData;

    switch (MessageStatus) {
      case "sent":
        logger.info(
          `Message with SID ${MessageSid} has been sent successfully.`
        );
        break;
      case "delivered":
        logger.info(
          `Message with SID ${MessageSid} was delivered to ${To} from ${From}.`
        );
        break;
      case "undelivered":
        logger.warn(
          `Message with SID ${MessageSid} failed to deliver. Please check the recipient's number or network issues.`
        );
        break;
      case "failed":
        logger.error(
          `Message with SID ${MessageSid} encountered a failure. Twilio API version: ${ApiVersion}`
        );
        break;
      default:
        logger.debug(
          `Unhandled status ${MessageStatus} for message SID ${MessageSid}`
        );
        break;
    }

    // res.status(200).send("Status update received");
    // console.log(res.body)
  } catch (error) {
    logger.error("Error processing Twilio status update", { error });
    // res.status(500).send("Internal Server Error");
  }
};
