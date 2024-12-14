import { addKeyword, EVENTS } from "@builderbot/bot";
import { welcomeFlow } from "./welcome.flow.js";

const kcpeDummyData = {
  KCPE12345: { name: "Alice Wanjiku", score: 423, status: "Pass" },
  KCPE67890: { name: "Brian Otieno", score: 372, status: "Pass" },
};

// KCPE Checker Flow
export const kcpeCheckFlow = addKeyword(EVENTS.ACTION)
  .addAnswer(
    "Please enter your KCPE index number (e.g., KCPE12345):",
    { capture: true },
    async (ctx, { flowDynamic }) => {
      const indexNumber = ctx.body.trim().toUpperCase(); // Normalize input to uppercase
      const isValidFormat = /^KCPE\d{5}$/.test(indexNumber); // Validate input format

      if (!isValidFormat) {
        // Invalid format response
        await flowDynamic(
          "❌ Invalid format! Please enter your index number in the format `KCPE12345`."
        );
        return;
      }

      const result = kcpeDummyData[indexNumber];

      if (result) {
        // Show results
        await flowDynamic(`✅ *KCPE Results*:
📛 Name: ${result.name}
📋 Total Score: ${result.score}
📊 Status: ${result.status}`);

        // Option to retry or exit
        await flowDynamic(
          "Would you like to check another result? Type `yes` to try again or `exit` to end."
        );
      } else {
        // No results found
        await flowDynamic(
          "❌ No results found for that index number. Please check and try again."
        );
      }
    }
  )
  .addAnswer(
    "Type `yes` to check another KCPE result or `exit` to return to the main menu.",
    { capture: true },
    async (ctx, { gotoFlow, flowDynamic }) => {
      const userChoice = ctx.body.trim().toLowerCase();

      if (userChoice === "yes") {
        return gotoFlow(kcpeCheckFlow);
      } else if (userChoice === "exit") {
        await flowDynamic(
          "Thank you for using the KCPE Checker! Returning to the main menu. 😊"
        );
        return gotoFlow(welcomeFlow);
      } else {
        await flowDynamic(
          "⚠️ Invalid response. Type `yes` to try again or `exit` to return to the main menu."
        );
      }
    }
  );
