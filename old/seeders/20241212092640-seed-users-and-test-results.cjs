"use strict";

const { faker } = require("@faker-js/faker");
let counter = 1000; // Start from 1000, you can adjust this as needed

// Function to generate custom registration numbers
function generateCustomRegNumber() {
  const regPrefix = "USR"; // Or any other prefix
  const regNumber = `${regPrefix}${String(counter++).padStart(4, "0")}`; // Zero-padded to 4 digits
  return regNumber;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = [];
    const testResults = [];

    for (let i = 1; i <= 10; i++) {
      const firstName = faker.person.firstName();
      const middleName = faker.person.middleName(); // Faker doesn't have a specific middleName generator
      const lastName = faker.person.lastName();
      const email = faker.internet
        .exampleEmail({
          firstName: firstName,
          lastName: lastName,
          allowSpecialCharacters: false,
        })
        .replace("@example.com", "@test.com"); // Change domain to test.com

      // Create a user
      const user = {
        id: i, // Explicitly set the ID to match relational data
        registration_number: generateCustomRegNumber(),
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        full_name: `${firstName} ${middleName} ${lastName}`, // Concatenate first, middle, and last name
        email: email,
        id_number: faker.finance.creditCardNumber().toString(),
        kra_pin: `KRA${faker.vehicle.vin()}`,
        huduma_number: `HDM${faker.vehicle.vin()}`,
        updatedAt: new Date(),
        createdAt: new Date(),
      };

      users.push(user);

      // Create test results for this user
      const numTestResults = faker.number.int({ min: 3, max: 7 });
      for (let j = 0; j < numTestResults; j++) {
        const testResult = {
          user_id: user.id, // Use the user's actual ID
          food: faker.commerce.productName(),
          status: faker.helpers.arrayElement([
            "Pending",
            "Completed",
            "In Progress",
          ]),
          test_type: faker.helpers.arrayElement([
            "Food Quality",
            "Health Check",
            "Chemical Analysis",
          ]),
          submission_date: faker.date.past(),
          completion_date: faker.date.future(),
          sent_date: faker.date.future(),
          result_details: faker.hacker.phrase(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        testResults.push(testResult);
      }
    }

    // Insert users and test results into the database
    await queryInterface.bulkInsert("Users", users, {});
    await queryInterface.bulkInsert("TestResults", testResults, {});
  },

  async down(queryInterface, Sequelize) {
    // Delete all records from the tables
    await queryInterface.bulkDelete("TestResults", null, {});
    await queryInterface.bulkDelete("Users", null, {});
  },
};
