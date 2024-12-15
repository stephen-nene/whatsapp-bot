import { addKeyword, EVENTS } from "@builderbot/bot";
import { welcomeFlow } from "../welcome.flow.js";

const goodConductDummyData = {
  GC12345: {
    name: "Peter Njoroge",
    status: "Approved",
    issuedOn: "2023-08-15",
  },
  GC67890: { name: "Esther Achieng", status: "Pending", issuedOn: null },
};

// Good Conduct Checker Flow
export const goodConductCheckFlow = addKeyword(EVENTS.ACTION)
  .addAnswer(
    "Please enter your Good Conduct certificate reference number (e.g., GC12345):",
    { capture: true },
    async (ctx, { flowDynamic }) => {
      const refNumber = ctx.body.trim().toUpperCase(); // Normalize input to uppercase
      const isValidFormat = /^GC\d{5}$/.test(refNumber); // Validate input format

      if (!isValidFormat) {
        await flowDynamic(
          "❌ Invalid format! Please enter your reference number in the format `GC12345`."
        );
        return;
      }

      const result = goodConductDummyData[refNumber];

      if (result) {
        const issuedOn = result.issuedOn
          ? `📅 Issued On: ${result.issuedOn}`
          : "⏳ Issuance Pending";

        await flowDynamic(`✅ *Good Conduct Status*:
📛 Name: ${result.name}
📜 Status: ${result.status}
${issuedOn}`);

        await flowDynamic(
          "Would you like to check another Good Conduct certificate? Type `yes` to try again or `exit` to end."
        );
      } else {
        await flowDynamic(
          "❌ No record found for that reference number. Please check and try again."
        );
      }
    }
  )
  .addAnswer(
    "Type `yes` to check another certificate or `exit` to return to the main menu.",
    { capture: true },
    async (ctx, { gotoFlow, flowDynamic }) => {
      const userChoice = ctx.body.trim().toLowerCase();

      if (userChoice === "yes") {
        return gotoFlow(goodConductCheckFlow);
      } else if (userChoice === "exit") {
        await flowDynamic(
          "Thank you for using the Good Conduct Checker! Returning to the main menu. 😊"
        );
        return gotoFlow(welcomeFlow);
      } else {
        await flowDynamic(
          "⚠️ Invalid response. Type `yes` to try again or `exit` to return to the main menu."
        );
      }
    }
  );
