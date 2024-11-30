// In-memory session store
export const userSessions = new Map();

// Mock registered users
const registeredUsers = new Map([
  ["123", { name: "John Doe", email: "john@example.com", phone: "+254712345678", membershipLevel: "Gold" }],
  ["789", { name: "Jane Smith", email: "jane@example.com", phone: "+254723456789", membershipLevel: "Silver" }],
]);

// Function to check registration number
export const checkRegistrationNumber = (regNumber) => {
  const userInfo = registeredUsers.get(regNumber.toUpperCase());
  return userInfo ? [true, userInfo] : [false, null];
};
