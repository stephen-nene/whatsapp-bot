import { addKeyword } from "@builderbot/bot";
import { OpenAIGrok } from "../../services/grok.js";

const grokAI = new OpenAIGrok(process.env.GROK_MAGIC_WAND);
// languages.js
const programmingLanguages = [
  { id: 1, name: "JavaScript", emoji: "✨" },
  { id: 2, name: "Python", emoji: "🐍" },
  { id: 3, name: "Ruby", emoji: "💎" },
  { id: 4, name: "C", emoji: "📘" },
  { id: 5, name: "Java", emoji: "☕" },
  { id: 6, name: "Go", emoji: "💨" },
  { id: 7, name: "C++", emoji: "⚙️" },
  { id: 8, name: "Rust", emoji: "🛠️" },
  { id: 9, name: "PHP", emoji: "🐘" },
  { id: 10, name: "Swift", emoji: "🦅" },
  { id: 11, name: "Kotlin", emoji: "🎨" },
  { id: 12, name: "TypeScript", emoji: "🔵" },
  { id: 13, name: "Perl", emoji: "🐪" },
  { id: 14, name: "Scala", emoji: "⛷️" },
  { id: 15, name: "Haskell", emoji: "🔮" },
  { id: 16, name: "Dart", emoji: "🎯" },
  { id: 17, name: "Elixir", emoji: "🧪" },
  { id: 18, name: "Erlang", emoji: "📡" },
  { id: 19, name: "MATLAB", emoji: "📊" },
  { id: 20, name: "Exit", emoji: "🚪" },
];

// Function to dynamically generate programming language insights
async function generateLanguageDetails(language) {
  const messages = [
    {
      role: "system",
      content:
        "You are Grok, an AI expert in programming languages since the time of ENIAC and EDVAC. Provide brief, factual, and structured information when requested. Use Grok humor on the roating section like elon musk would if he was a robot. dont try to be professional in any way just try being correct but funny and not tooo detailed and also include emojis in the response to invoke emotions but not too much. Try to talk in first person speech since you will be responding to a whatapp message so be in time.now(). NA be as sunny in all your lines and humor use even when explaining.",
    },
    {
      role: "user",
      content: `Provide the following details about ${language}:
      1. A brief history of the language.
      2. An unexpected or fun fact about the language.
      3. Roast it, with humor and jokes.
      4. summarise how it has hepled do great things in life
      5. Then some thing chuck would say about it(know about the chuck gems/fakers)`,
    },
  ];

  try {
    const response = await grokAI.processMessage(messages);
    return response;
  } catch (error) {
    console.error("Error generating language details:", error.message);
    return "❌ Unable to fetch programming language details at this time. Please try again later.";
  }
}

const languageOptions = programmingLanguages
  .map(({ id, name, emoji }) => `${id}. ${emoji} ${name}`)
  .join("\n");

// Programming Language Flow with Grok
export const grokTalkFlow = addKeyword(["grok", "languages"]).addAnswer(
  `Select a programming language to learn about:\n${languageOptions}`,
  { capture: true },
  async (ctx, { flowDynamic,  fallBack }) => {
    const userChoice = parseInt(ctx.body.trim(), 10);
    const selectedLanguage = programmingLanguages.find(
      (lang) => lang.id === userChoice
    );

    // if (selectedLanguage.name === "Exit") {
    //   return endFlow(
    //     "🚪 Goodbye! Feel free to explore programming languages later."
    //   );
    // }

    if (!selectedLanguage) {
      return fallBack("❌ Invalid choice. Please try again.");
    }

    await flowDynamic("🤖 *Grok is thinking... Hang tight!*\n");

    // Fetch language details using Grok
    const languageDetails = await generateLanguageDetails(
      selectedLanguage.name
    );
    await flowDynamic(
      `🌐 *${selectedLanguage.name} Insights*:\n${languageDetails}`
    );
  }
);
