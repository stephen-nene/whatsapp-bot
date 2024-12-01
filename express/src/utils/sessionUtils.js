export const userSessions = new Map();

export const SessionStates = {
  AWAITING_REGISTRATION: "awaiting_registration",
  PROCESSING_PAYMENT: "processing_payment",
  PAYMENT_DONE: "payment done",
};

export class SessionManager {
  static updateSessionState(userSessions, fromNumber, newState) {
    if (!userSessions[fromNumber]) {
      userSessions[fromNumber] = {};
    }
    userSessions[fromNumber].state = newState;
  }

  static initializeSession(userSessions, fromNumber) {
    userSessions[fromNumber] = { 
      state: SessionStates.AWAITING_REGISTRATION 
    };
  }
}

export const MessageTemplates = {
  WELCOME: ()=>'👋 Welcome! Please send your registration number to proceed.',
  INVALID_REGISTRATION: (regNumber) => 
    `❌ Registration number ${regNumber} not found. Please check and try again.`,
  PAYMENT_PROCESSING: (name) => 
    `🔓 Welcome back ${name}.\n⌛Processing your 💸 payment ...`,
  PAYMENT_SUCCESS: (userInfo) => 
    `✅ Payment successful! Thank you, ${userInfo.name}.\nHere are your details:\n` +
    `- Name: ${userInfo.name}\n- Email: ${userInfo.email}\n- Phone: ${userInfo.phone}\n- Membership Level: ${userInfo.membership_level}`,
  UNRECOGNIZED_INPUT: '❓ I\'m sorry, I didn\'t understand that. Please start again by sending your registration number.'
};

const registeredUsers = [
  {
    id: "1234a",
    name: "steve",
    email: "stevenene@gmail.com",
    status: "Failed",
    results: [
      {
        food: "Tomato Sauce",
        testType: "Microbial Analysis",
        submissionDate: "2024-11-15",
        completionDate: "2024-11-18",
        sentDate: "2024-11-19",
        result: {
          salmonella: "Absent",
          eColi: "Present",
          yeastMoldCount: "High",
        },
      },
    ],
  },
  {
    id: "1234b",
    name: "john",
    email: "johnsmith@example.com",
    status: "Passed",
    results: [
      {
        food: "Whole Wheat Bread",
        testType: "Nutritional Analysis",
        submissionDate: "2024-11-10",
        completionDate: "2024-11-13",
        sentDate: "2024-11-14",
        result: {
          protein: "12g/100g",
          fiber: "7g/100g",
          fat: "3g/100g",
        },
      },
      {
        food: "Peanut Butter",
        testType: "Allergen Test",
        submissionDate: "2024-11-20",
        completionDate: "2024-11-22",
        sentDate: "2024-11-23",
        result: {
          aflatoxins: "Low Level",
          peanutResidues: "Acceptable",
        },
      },
    ],
  },
  {
    id: "1234c",
    name: "jane",
    email: "janedoe@example.com",
    status: "Failed",
    results: [
      {
        food: "Fresh Milk",
        testType: "Chemical Analysis",
        submissionDate: "2024-11-05",
        completionDate: "2024-11-07",
        sentDate: "2024-11-08",
        result: {
          antibiotics: "Detected",
          pH: "6.4",
          fatContent: "4%",
        },
      },
    ],
  },
  {
    id: "1234d",
    name: "emily",
    email: "emilywhite@example.com",
    status: "Passed",
    results: [
      {
        food: "Canned Tuna",
        testType: "Heavy Metal Test",
        submissionDate: "2024-11-12",
        completionDate: "2024-11-14",
        sentDate: "2024-11-15",
        result: {
          mercury: "0.01 ppm",
          lead: "Not Detected",
        },
      },
    ],
  },
  {
    id: "1234e",
    name: "daviii",
    email: "davidbrown@example.com",
    status: "Failed",
    results: [
      {
        food: "Frozen Spinach",
        testType: "Pesticide Residue Test",
        submissionDate: "2024-11-18",
        completionDate: "2024-11-20",
        sentDate: "2024-11-21",
        result: {
          pesticideResidues: "Excessive Levels Detected",
          safeConsumption: "No",
        },
      },
      {
        food: "Orange Juice",
        testType: "Nutritional Analysis",
        submissionDate: "2024-11-01",
        completionDate: "2024-11-03",
        sentDate: "2024-11-04",
        result: {
          vitaminC: "30mg/100ml",
          sugar: "10g/100ml",
          fiber: "0.5g/100ml",
        },
      },
    ],
  },
];

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
