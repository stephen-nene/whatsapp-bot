import { addKeyword, EVENTS } from "@builderbot/bot";

import { welcomeFlow } from "../welcome.flow.js";

const serviceDummyData = {
  kcse: {
    KC12345: { name: "John Doe", grade: "A", status: "Pass" },
    KC31729: { name: "Jane Smith", grade: "B+", status: "Pass" },
  },
};

// KCSE Checker Flow
export const kcseCheckFlow = addKeyword([EVENTS.ACTION, "kcse"])
  .addAnswer(
    "Please enter your KCSE index number (e.g., KC12345):",
    { capture: true },
    async (ctx, { globalState, flowDynamic, fallBack,endFlow }) => {
      console.log(globalState.getAllState());
      const indexNumber = ctx.body.trim().toUpperCase(); // Normalize input to uppercase
      const isValidFormat = /^KC\d{5}$/.test(indexNumber); // Validate input format
      if (indexNumber === "EXIT") {
        return endFlow(
          "Thank you for using the KCSE Checker! Returning to the main menu. ��"
        );
        // return;
      }
      if (!isValidFormat) {
        // Invalid format response
        return fallBack(
          "❌ Invalid format! Please enter your index number in the format `KC12345` or `exit` to end.."
        );
        // return; // Allow user to re-enter input
      }

      const result = serviceDummyData.kcse[indexNumber];

      if (result) {
        // Show results
        await flowDynamic(`✅ *KCSE Results*:
📛 Name: ${result.name}
🏆 Grade: ${result.grade}
📊 Status: ${result.status}`);

        // Option to retry or exit
        await flowDynamic(
          "Would you like to check another result? Type `yes` to try again or `exit` to end."
        );
      } else {
        // No results found response
        await flowDynamic(
          "❌ No results found for that index number. Please check and try again."
        );
      }
    }
  )
  .addAnswer(
    "Type `yes` to check another KCSE result or `exit` to return to the main menu.",
    { capture: true },
    async (ctx, { gotoFlow, flowDynamic }) => {
      const userChoice = ctx.body.trim().toLowerCase();

      if (userChoice === "yes") {
        // Restart the flow
        return gotoFlow(kcseCheckFlow);
      } else if (userChoice === "exit") {
        await flowDynamic(
          "Thank you for using the KCSE Checker! Returning to the main menu. 😊"
        );
        return gotoFlow(welcomeFlow);
      } else {
        await flowDynamic(
          "⚠️ Invalid response. Type `yes` to check again or `exit` to return to the main menu."
        );
      }
    }
  );
