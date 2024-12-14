import pkg from "twilio";
const { twiml } = pkg;

import logger from "../utils/logger.js";
import { initiateSTKPushRequest, handleCallback } from "./mpesaController.js";

import { sendTwilioMessage } from "../utils/helper.js";
import {
  checkRegistrationNumber,
  userSessions,
  cleanPhoneNumber,
  SessionStates,
  SessionManager,
  MessageTemplates,
} from "../utils/sessionUtils.js";

export const handleIncomingMessage = async (req, res) => {
  const { AccountSid: accountSid, From: fromNumber, Body: body } = req.body;
  console.log("All sessions:", userSessions);
  console.log("All sessions:", req.body);

  try {
    logger.info(`Received message from ${fromNumber}: ${body.trim()}`);

    await processUserMessage(req.body, body.trim());
  } catch (error) {
    console.error(error);
    handleMessageProcessingError(fromNumber, error, res);
  }
};

async function processUserMessage(reqbody, body) {
  const currentSession = userSessions[reqbody?.AccountSid];

  if (!currentSession) {
    return handleNewSession(reqbody);
  }

  switch (currentSession.state) {
    case SessionStates.AWAITING_REGISTRATION:
      // console.log("Curtrent Session", currentSession || null);
      return handleRegistrationState(reqbody);

    case SessionStates.PROCESSING_PAYMENT:
      return handlePaymentProcessing(reqbody);

    case SessionStates.PAYMENT_DONE:
      return handlePaymentDone(reqbody?.AccountSid);

    default:
      return handleUnrecognizedState(reqbody?.AccountSid);
  }
}

async function handleNewSession(reqbody) {
  await sendTwilioMessage(
    reqbody?.From,
    MessageTemplates.WELCOME(reqbody?.ProfileName)
  );
  SessionManager.initializeSession(userSessions, reqbody?.AccountSid);
}

function handleRegistrationState(reqbody) {
  const regNumber = reqbody.Body.trim();
  const fromNumber = reqbody.From;
  const accountSid = reqbody.AccountSid;
  const [isValid, userInfo] = checkRegistrationNumber(regNumber);

  if (isValid) {
    userSessions[accountSid] = {
      state: SessionStates.PROCESSING_PAYMENT,
      registration_number: regNumber,
      user_info: userInfo,
      wa_info: reqbody,
    };

    sendTwilioMessage(
      fromNumber,
      MessageTemplates.PAYMENT_PROCESSING(userInfo.name)
    );

    handlePaymentProcessing(reqbody);

    return {
      status: "success",
      message: `User ${userInfo.name} moved to processing payment state.`,
    };
  } else {
    userSessions[accountSid].state = SessionStates.AWAITING_REGISTRATION;
    sendTwilioMessage(
      fromNumber,
      MessageTemplates.INVALID_REGISTRATION(regNumber)
    );

    return {
      status: "error",
      message: "Invalid registration number. Prompted user to retry.",
    };
  }
}

function handlePaymentProcessing(reqbody) {
  const accountSid = reqbody.AccountSid; // Extract session ID
  const fromNumber = reqbody.From; // Extract user's phone number

  // Retrieve the current session
  const currentSession = userSessions[accountSid];
  if (
    !currentSession ||
    currentSession.state !== SessionStates.PROCESSING_PAYMENT
  ) {
    console.warn(`Invalid session state for AccountSid ${accountSid}`);
    return {
      status: "error",
      message: "Invalid session state. Unable to process payment.",
    };
  }

  // Extract user info from the session
  const userInfo = currentSession.user_info;

  // Simulate initiating an STK push for payment
  // console.log(`Initiating payment for ${userInfo.name} (${fromNumber})`);

  setTimeout(async () => {
    try {
      const paymentResponse = await initiateSTKPushRequest({
        phone: cleanPhoneNumber(fromNumber),
        amount: 1, // Replace with your dynamic amount logic if needed
      });

      if (paymentResponse?.ResponseCode === "0") {
        currentSession.mpesa_id = paymentResponse?.MerchantRequestID;
        currentSession.checkout_id = paymentResponse?.CheckoutRequestID;

        sendTwilioMessage(
          fromNumber,
          `✅ ${paymentResponse.ResponseDescription}. Please reply with a password to complete your transaction.`
        );
// currentSession.state = SessionStates.PAYMENT_DONE

        // console.info(
        //   `Payment initiated successfully for ${userInfo.name} (${fromNumber}).`
        // );
      } else {
        // Payment initiation failed
        sendTwilioMessage(
          fromNumber,
          "❌ Payment initiation failed. Please try again later."
        );

        console.error(
          `Payment initiation failed for ${userInfo.name} (${fromNumber}).`
        );
      }
    } catch (error) {
      console.error("Error initiating payment:", error);

      // Notify the user of the failure
      sendTwilioMessage(
        fromNumber,
        "❌ An error occurred while processing your payment. Please try again."
      );
    }
  }, 2000); // Simulate a delay to mimic payment processing

  return {
    status: "success",
    message: "Payment processing initiated.",
  };
}
const handlePaymentDone = async (accountSid) => {
  try {
    // Step 1: Fetch user data from the database using the accountSid (simulate with a mock function)
    // const user = await getUserData(accountSid); // Function that retrieves user data based on accountSid

    const user = userSessions[accountSid]?.user_info;

    if (!user) {
      throw new Error('User not found');
    }

    // Step 2: Format the message with the user's results
    const message = formatUserResultsMessage(user);

    // Step 3: Send the message using Twilio
    await sendTwilioMessage(userSessions[accountSid].wa_info?.From, message); // You might want to replace email with phone number if that's required by Twilio

    logger.info(`Message sent to ${user.email} successfully.`);
  } catch (error) {
    logger.error('Error in handlePaymentDone', { error: error.message });
  }
};
const formatUserResultsMessage = (user) => {
  let message = `Hello ${user.name},\n\nHere are your test results:\n\n`;

  user.results.forEach((result, index) => {
    message += `Test ${index + 1}: ${result.food} - ${result.testType}\n`;
    for (const [key, value] of Object.entries(result.result)) {
      message += `${key}: ${value}\n`;
    }
    message += "\n";
  });

  message += `Status: ${user.status}\n\nThank you for using our service!`;
  return message;
};
// export const handleIncomingMessage1 = async (req, res) => {
//   const { AccountSid: accountSid, From: fromNumber, Body: body } = req.body;

//   const response = new twiml.MessagingResponse();

//   try {
//     logger.info(
//       `Received message from ${fromNumber} (AccountSid: ${accountSid}): ${body.trim()}`
//     );

//     if (!userSessions[accountSid]) {
//       handleNewSession(accountSid, response);
//       response.message(MessageTemplates.WELCOME(req?.body?.ProfileName));
//     } else if (userSessions[accountSid].state === "awaiting_registration") {
//       const regNumber = body.trim();
//       userSessions[accountSid].registration_number = regNumber;

//       const [isValid, userInfo] = checkRegistrationNumber(regNumber);
//       if (isValid) {
//         userSessions[accountSid].state = "processing_payment";
//         userSessions[accountSid].user_info = userInfo;

//         response.message(MessageTemplates.PAYMENT_PROCESSING(userInfo.name));
//         logger.info(
//           `Registration number ${regNumber} found for ${userInfo.name}. Proceeding to payment.`
//         );
//         setTimeout(async () => {
//           const moneyres = await initiateSTKPushRequest({
//             phone: cleanPhoneNumber(fromNumber),
//             amount: 1000,
//           });
//           if (moneyres?.ResponseCode === "0") {
//             userSessions[accountSid].mpesa_id = moneyres?.MerchantRequestID;
//             userSessions[accountSid].checkout_id = moneyres?.CheckoutRequestID;
//             sendTwilioMessage(fromNumber, `✅ ${moneyres.ResponseDescription}`);
//           }
//         }, 1000);
//       } else {
//         response.message(
//           `❌ Registration number ${regNumber} not found. Please check and try again.`
//         );
//         userSessions[accountSid].state = "awaiting_registration";

//         logger.warn(
//           `Invalid registration number ${regNumber} for AccountSid ${accountSid}.`
//         );
//       }
//     } else if (userSessions[accountSid].state === "payment_done") {
//       userSessions[accountSid].password = body.trim();
//       userSessions[accountSid].state = "completed";

//       const userInfo = userSessions[accountSid].user_info || {};
//       response.message(
//         `✅ Payment successful! Thank you, ${userInfo.name}.\nHere are your details:\n` +
//           `- Name: ${userInfo.name}\n- Email: ${userInfo.email}\n- Phone: ${userInfo.phone}\n- Membership Level: ${userInfo.membership_level}`
//       );

//       logger.info(
//         `Payment successful for AccountSid ${accountSid}. Transaction complete.`
//       );

//       delete userSessions[accountSid];
//     } else {
//       response.message(
//         "❓ I'm sorry, I didn't understand that. Please start again by sending your registration number."
//       );
//       userSessions[accountSid].state = "awaiting_registration"; // Reset state

//       // Log unrecognized input
//       logger.warn(
//         `Unrecognized input from AccountSid ${accountSid}. Resetting session.`
//       );
//     }

//     res.type("text/xml").send(response.toString());
//   } catch (error) {
//     console.error("Error processing message:", error);

//     // Log error
//     logger.error(
//       `Error processing message from AccountSid ${accountSid}: ${error.message}`
//     );

//     res.type("text/xml").send(response.toString());
//   }
// };

function handleMessageProcessingError(fromNumber, error, res) {
  console.error("Error processing message:", error);

  logger.error(`Error processing message from ${fromNumber}: ${error.message}`);

  const twimlResponse = new twiml.MessagingResponse();
  res.type("text/xml").send(twimlResponse.toString());
}

export const handleStatus = async (req, res) => {
  const statusData = req.body;

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
    // console.log("res status body", req.body);
  } catch (error) {
    logger.error("Error processing Twilio status update", { error });
    // res.status(500).send("Internal Server Error");
  }
};
