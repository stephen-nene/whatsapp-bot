import { addKeyword, EVENTS } from "@builderbot/bot";
import { welcomeFlow } from "./welcome.flow.js";

const drivingLicenseDummyData = {
  DL12345: { name: "Samuel Kariuki", status: "Valid", expiry: "2025-09-30" },
  DL67890: { name: "Ruth Kamau", status: "Expired", expiry: "2023-05-12" },
};

// Driving License Checker Flow
export const drivingLicenseCheckFlow = addKeyword(EVENTS.ACTION)
  .addAnswer(
    "Please enter your Driving License reference number (e.g., DL12345):",
    { capture: true },
    async (ctx, { flowDynamic }) => {
      const refNumber = ctx.body.trim().toUpperCase(); // Normalize input to uppercase
      const isValidFormat = /^DL\d{5}$/.test(refNumber); // Validate input format

      if (!isValidFormat) {
        await flowDynamic(
          "❌ Invalid format! Please enter your reference number in the format `DL12345`."
        );
        return;
      }

      const result = drivingLicenseDummyData[refNumber];

      if (result) {
        await flowDynamic(`✅ *Driving License Status*:
📛 Name: ${result.name}
📋 Status: ${result.status}
📅 Expiry Date: ${result.expiry}`);

        await flowDynamic(
          "Would you like to check another Driving License? Type `yes` to try again or `exit` to end."
        );
      } else {
        await flowDynamic(
          "❌ No record found for that reference number. Please check and try again."
        );
      }
    }
  )
  .addAnswer(
    "Type `yes` to check another license or `exit` to return to the main menu.",
    { capture: true },
    async (ctx, { gotoFlow, flowDynamic }) => {
      const userChoice = ctx.body.trim().toLowerCase();

      if (userChoice === "yes") {
        return gotoFlow(drivingLicenseCheckFlow);
      } else if (userChoice === "exit") {
        await flowDynamic(
          "Thank you for using the Driving License Checker! Returning to the main menu. 😊"
        );
        return gotoFlow(welcomeFlow);
      } else {
        await flowDynamic(
          "⚠️ Invalid response. Type `yes` to try again or `exit` to return to the main menu."
        );
      }
    }
  );
