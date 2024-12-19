import { addKeyword } from "@builderbot/bot";
import db from "../../../models/index.js";

const formatModelList = (models) => {
  return models
    .map(
      (model, index) =>
        `${index + 1}. ${model.name} (${model.model}) - ${
          model.price
        } KSH for ${model.messages} messages 🤖`
    )
    .join("\n");
};

const formatModelDetails = (model) => {
  return `📱 Model Details:
Name: ${model.name}
Type: ${model.model}
Price: ${model.price} KSH
Messages: ${model.messages}
Description: ${model.description || "No description available"}

💫 To purchase, send the amount to MPESA: XXXXXX
Reply with "confirm" once you've sent the payment.`;
};
const models = await db.Subscription.findAll();

export const neneFlow = addKeyword(["nene"])
  .addAnswer("🌟 Welcome to Nene AI Services! 🌟")
  .addAnswer(
    [
      "Choose your AI model by sending its number:",
      `${formatModelList(models)}`,
      "\n✨ Reply with a number to select your model!",
      "\nOr type 'EXIT' to end the conversation.",
    ].join("\n"),
    { capture: true },
    async (ctx, { flowDynamic, state, endFlow }) => {
      try {
        // const models = await db.Subscription.findAll();

        // Handle exit command
        if (ctx.body.trim().toUpperCase() === "EXIT") {
          return endFlow(
            "👋 Thank you for using Nene AI Services! Come back soon!"
          );
        }

        // Handle no models available
        if (models.length === 0) {
          return flowDynamic(
            "🚫 No AI models available right now! Check back soon! ✨"
          );
        }

        const modelId = parseInt(ctx.body);
        if (isNaN(modelId)) {
          return flowDynamic(
            "❌ Please send a valid number to select a model!"
          );
        }

        const selectedModel = models[modelId - 1];
        if (!selectedModel) {
          return flowDynamic("❌ Invalid model number! Please try again!");
        }

        // Store the selected model in state
        await state.update({ selectedModel });
      } catch (error) {
        console.error("Error fetching models:", error);
        await flowDynamic(
          "❌ Oops! Something went wrong! Please try again later! 🔄"
        );
      }
    }
  )
  .addAction(async (_, { flowDynamic, state }) => {
    const selectedModel = state.get("selectedModel");
    if (selectedModel) {
      await flowDynamic(formatModelDetails(selectedModel));
    }
  });
