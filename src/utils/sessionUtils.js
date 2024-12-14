export const userSessions = new Map();

export const SessionStates = {
  AWAITING_REGISTRATION: "awaiting_registration",
  PROCESSING_PAYMENT: "processing_payment",
  PAYMENT_DONE: "payment_done",
};

export class SessionManager {
  static updateSessionState(userSessions, fromNumber, newState) {
    if (!userSessions[fromNumber]) {
      userSessions[fromNumber] = {};
    }
    userSessions[fromNumber].state = newState;
  }

  static initializeSession(userSessions, accountSid) {
    userSessions[accountSid] = {
      state: SessionStates.AWAITING_REGISTRATION,
    };
  }
}

export const MessageTemplates = {
  WELCOME: (name) =>
    `👋 Welcome! ${name} Please send your registration number to proceed.`,
  INVALID_REGISTRATION: (regNumber) =>
    `❌ Registration number ${regNumber} not found. Please check and try again.`,
  PAYMENT_PROCESSING: (name) =>
    `👋 Welcome back, ${name}!\n\n💳 We're initiating your payment process.\n📲 You will soon receive a prompt to input your 🔐 password.\n\n Please be patient as we process your request.\nThank you for your cooperation! 🙏`,
  PAYMENT_SUCCESS: (userInfo) =>
    `✅ Payment successful! Thank you, ${userInfo.name}.\nHere are your details:\n` +
    `- Name: ${userInfo.name}\n- Email: ${userInfo.email}\n- Phone: ${userInfo.phone}\n- Membership Level: ${userInfo.membership_level}`,
  UNRECOGNIZED_INPUT:
    "❓ I'm sorry, I didn't understand that. Please start again by sending your registration number.",
};


export const cleanPhoneNumber = (phoneNumber) => {
  const cleaned = phoneNumber.replace(/[^\d]/g, "");
  const regex = /^2547\d{8}$/;
  if (!regex.test(cleaned)) {
    throw new Error("Invalid phone number format");
  }
  return parseInt(cleaned);
};

export const checkRegistrationNumber = (regNumber) => {
  // console.log("Received: ", typeof regNumber);
  const userInfo = registeredUsers.find((user) => user.id === regNumber);
  return userInfo ? [true, userInfo] : [false, null];
};
