import { addKeyword, EVENTS } from "@builderbot/bot";
import { welcomeFlow } from "../welcome.flow.js";

const kcpeDummyData = {
  KCPE12345: {
    name: "Alice Wanjiku",
    totalScore: 423,
    status: "Pass",
    subjects: {
      English: 85,
      Kiswahili: 90,
      Mathematics: 88,
      Science: 80,
      SocialStudies: 80,
    },
  },
  KCPE67890: {
    name: "Brian Otieno",
    totalScore: 372,
    status: "Pass",
    subjects: {
      English: 75,
      Kiswahili: 82,
      Mathematics: 80,
      Science: 65,
      SocialStudies: 70,
    },
  },
  KCPE11111: {
    name: "Cynthia Mutiso",
    totalScore: 289,
    status: "Pass",
    subjects: {
      English: 60,
      Kiswahili: 55,
      Mathematics: 58,
      Science: 58,
      SocialStudies: 58,
    },
  },
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
📋 Total Score: ${result.totalScore}
📊 Status: ${result.status}

📚 *Subject Breakdown:*
- 📝 English: ${result.subjects.English}
- 📝 Kiswahili: ${result.subjects.Kiswahili}
- 🧮 Mathematics: ${result.subjects.Mathematics}
- 🔬 Science: ${result.subjects.Science}
- 🌍 Social Studies: ${result.subjects.SocialStudies}
`);

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
