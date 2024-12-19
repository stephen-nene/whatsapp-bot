"use strict";

const { faker } = require("@faker-js/faker");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const aiModels = [
      {
        name: "Grok",
        sub_models: ["grok-alpha", "grok-vision", "grok-2"],
      },
      {
        name: "GPT by OpenAI",
        sub_models: ["gpt-3.5-turbo", "gpt-4", "gpt-4-xl"],
      },
      {
        name: "Gemini by Google DeepMind",
        sub_models: [
          "gemini-1-small",
          "gemini-1-medium",
          "gemini-1-large",
          "gemini-1-xl",
        ],
      },
      {
        name: "AI Voyager",
        sub_models: ["voyager-1", "voyager-2", "voyager-pro"],
      },
      {
        name: "Optimus by Tesla",
        sub_models: ["optimus-alpha", "optimus-beta", "optimus-quantum"],
      },
    ];

    const subscriptions = aiModels.flatMap((model) =>
      model.sub_models.map((sub_model) => ({
        name: model.name,
        model: sub_model,
        price: parseFloat(faker.commerce.price(10, 50, 2)), // Random price between 10 and 100
        question_limit: faker.number.int({ min: 6, max: 20 }), // Random limit
        description: `${faker.hacker.phrase()} `,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    await queryInterface.bulkInsert("Subscriptions", subscriptions, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Subscriptions", null, {});
  },
};
