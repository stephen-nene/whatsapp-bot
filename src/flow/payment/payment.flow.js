import { addKeyword } from "@builderbot/bot";
import { initiateSTKPush } from "../../controllers/mpesacontroller.js";

// Models with added information
const models = [
  {
    id: 1,
    name: "grok-beta",
    emoji: "⚡",
    info: { input: "text", output: "text", charges: "10 bob for 10 questions" },
  },
  {
    id: 2,
    name: "grok-vision-beta",
    emoji: "👁️",
    info: { input: "image", output: "text", charges: "20 bob per image" },
  },
  {
    id: 3,
    name: "grok-2-vision-1212",
    emoji: "🎨",
    info: { input: "image", output: "image", charges: "15 bob per image" },
  },
  {
    id: 4,
    name: "grok-2-1212",
    emoji: "🔮",
    info: { input: "text", output: "image", charges: "25 bob per task" },
  },
];

// Function to validate phone number using regex (Kenyan phone number format)
function validatePhoneNumber(phoneNumber) {
  const phoneRegex = /^(\+254|254|0)\d{9}$/;
  return phoneRegex.test(phoneNumber);
}

// Model Selection Flow
export const payGrokFlow = addKeyword("payment")
  .addAnswer(
    `Select a model to start payment for:\n${models
      .map(({ id, name, emoji, info }) => {
        return `${id}. ${emoji} ${name} - ${info.input} ➡️ ${info.output}, Charges: ${info.charges}`;
      })
      .join("\n")}`,
    { capture: true }
  )
  .addAction(async (ctx, { globalState, flowDynamic, fallBack }) => {
    const userChoice = parseInt(ctx.body.trim(), 10);
    const selectedModel = models.find((model) => model.id === userChoice);

    if (!selectedModel) {
      return fallBack("❌ Invalid choice. Please select a valid model number.");
    }

    // Store selected model in globalState
    try {
      await globalState.update("selectedModel", selectedModel);
    } catch (error) {
      console.error("globalState update error:", error);
      return fallBack("❌ An error occurred. Please try again.");
    }

    // Confirm model selection
    await flowDynamic(
      `🌟 *You selected:* ${selectedModel.emoji} *${selectedModel.name}*\n\n` +
        `📥 Input: ${selectedModel.info?.input || "N/A"}\n` +
        `📤 Output: ${selectedModel.info?.output || "N/A"}\n` +
        `💰 Charges: ${selectedModel.info?.charges || "N/A"}\n\n` +
        `📞 Do you want to use your current number (${ctx.from})? Reply *Yes* or *No*`
    );
  })
  .addAction({ capture: true }, async (ctx, { globalState, flowDynamic }) => {
    const userInput = ctx.body.trim().toLowerCase();
    let phoneNumber;

    if (userInput === "yes") {
      phoneNumber = ctx.from;
    } else if (userInput === "no") {
      await flowDynamic("Please enter the phone number you would like to use:");
      return;
    } else {
      await flowDynamic("❌ Invalid input. Please reply with 'Yes' or 'No'.");
      return;
    }

    // Validate and store phone number
    if (!validatePhoneNumber(phoneNumber)) {
      await flowDynamic(
        "❌ Invalid phone number. Please enter a valid Kenyan number."
      );
      return;
    }

    try {
      // Store phone number in globalState
      await globalState.update("phoneNumber", phoneNumber);

      // Initiate payment
      const selectedModel = await globalState.get("selectedModel");

      // Extract amount from the charges string
      console.log(selectedModel, globalState.getAllState());
      const amount = parseInt(selectedModel.info?.charges.split(" ")[0], 10);

      await flowDynamic(
        "📲 Sending STK push to your phone... Please approve the payment."
      );

      // Initiate STK push payment
      const response = await initiateSTKPush({
        phone: phoneNumber,
        amount,
      });

      if (response.success) {
        await flowDynamic(
          "✅ Payment initiated successfully. Please check your phone to complete the process.",
          "Thank you for your payment! Enjoy using Grok."
        );
      } else {
        await flowDynamic(
          "❌ Payment initiation failed. Please try again later."
        );
      }
    } catch (error) {
      console.error("Payment process error:", error);
      await flowDynamic(
        "❌ An error occurred during the payment process. Please try again."
      );
    }
  })
  .addAction({ capture: true }, async (ctx, { globalState, flowDynamic }) => {
    // This is for the manual phone number entry case
    const enteredPhone = ctx.body.trim();

    if (!validatePhoneNumber(enteredPhone)) {
      await flowDynamic(
        "❌ Invalid phone number. Please enter a valid Kenyan number."
      );
      return;
    }

    try {
      // Store phone number in globalState
      await globalState.update("phoneNumber", enteredPhone);

      // Get previously selected model
      const selectedModel = await globalState.get("selectedModel");

      // Extract amount from the charges string
      const amount = parseInt(selectedModel.info?.charges.split(" ")[0], 10);

      await flowDynamic(
        "📲 Sending STK push to your phone... Please approve the payment."
      );

      // Initiate STK push payment
      const response = await initiateSTKPush({
        phone: enteredPhone,
        amount,
      });

      if (response.success) {
        await flowDynamic(
          "✅ Payment initiated successfully. Please check your phone to complete the process.",
          "Thank you for your payment! Enjoy using Grok."
        );
      } else {
        await flowDynamic(
          "❌ Payment initiation failed. Please try again later."
        );
      }
    } catch (error) {
      console.error("Payment process error:", error);
      await flowDynamic(
        "❌ An error occurred during the payment process. Please try again."
      );
    }
  });
