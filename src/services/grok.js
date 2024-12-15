// grok will live here. rocessing users inust on call
// use oo princiles to male the ai modulus
// he will be called otionally when i need him to sulement stuff
// liek maybe when sending results encourage students based on their results
// it will then be aended to what teh user ws gonna receive, if it is called make sure you get resonse

// Module: Grok AI Integration
// Description: This module will serve as an optional AI assistant for processing user-specific data and enhancing interactions.
// - Designed using Object-Oriented Programming (OOP) principles for modularity and scalability.
// - Grok will be invoked on-demand to supplement existing responses with dynamic, AI-generated content.
// - Example Use Case: When sending results, Grok can analyze the scores and provide motivational or personalized messages based on student performance.
// - Ensure every invocation of Grok returns a response before appending it to the primary message flow.
// - Future Extensions: Grok may handle additional tasks, such as summarizing results or providing actionable advice.

// import OpenAI from "openai";
// import Anthropic from "@anthropic-ai/sdk";

// class AIChatService {
//   constructor(apiKey, baseURL, model) {
//     this.apiKey = apiKey;
//     this.baseURL = baseURL;
//     this.model = model;
//   }

//   async getResponse(messages, options = {}) {
//     return {
//       role: "system",
//       content:
//         "🤖 I'm not intelligent yet, but one day I will be! Please use a specific AI service (OpenAI or Anthropic) for smarter answers.",
//     };
//   }
// }

// class OpenAIChatService extends AIChatService {
//   constructor(apiKey) {
//     super(apiKey, "https://api.x.ai/v1", "grok-beta");
//     this.openai = new OpenAI({
//       apiKey: this.apiKey,
//       baseURL: this.baseURL,
//     });
//   }

//   async getResponse(messages, options = {}) {
//     const response = await this.openai.chat.completions.create({
//       model: this.model,
//       messages,
//       ...options,
//     });
//     return response.choices[0].message;
//   }
// }

// class AnthropicChatService extends AIChatService {
//   constructor(apiKey) {
//     super(apiKey, "https://api.x.ai/v1/chat/completions", "grok-beta");
//     this.anthropic = new Anthropic({
//       apiKey: this.apiKey,
//       baseURL: this.baseURL,
//     });
//   }

//   async getResponse(messages, options = {}) {
//     const response = await this.anthropic.messages.create({
//       model: this.model,
//       system: options.system || "",
//       messages,
//       ...options,
//     });
//     return response;
//   }
// }

// // Example Usage
// (async () => {
//   const apiKey = process.env.GROK_MAGIC_WAND;
//   const messages = [
//     {
//       role: "system",
//       content:
//         "You are Grok, a chatbot inspired by the Hitchhiker's Guide to the Galaxy.",
//     },
//     {
//       role: "user",
//       content: "What is the meaning of life, the universe, and everything?",
//     },
//   ];
//   // Using the base bot directly (fallback message)
//   const baseBot = new AIChatService(apiKey, "", "");
//   const baseResponse = await baseBot.getResponse(messages);
//   console.log("Base Bot Response:", baseResponse.content);

//   // OpenAI Example
//   const openAIChat = new OpenAIChatService(apiKey);
//   const openAIResponse = await openAIChat.getResponse(messages);
//   console.log("OpenAI Response:", openAIResponse);

//   // Anthropic Example
//   const anthropicChat = new AnthropicChatService(apiKey);
//   const anthropicResponse = await anthropicChat.getResponse(messages, {
//     system:
//       "You are Grok, a chatbot inspired by the Hitchhiker's Guide to the Galaxy.",
//     max_tokens: 128,
//     messages: [
//       {
//         role: "user",
//         content: "What is the meaning of life, the universe, and everything?",
//       },
//     ],
//   });
//   console.log("Anthropic Response:", anthropicResponse);
// })();

// const API_KEY = process.env.GROK_MAGIC_WAND;

// import OpenAI from "openai";
// const openai = new OpenAI({
//   apiKey: API_KEY,
//   baseURL: "https://api.x.ai/v1",
// });

// const completion = await openai.chat.completions.create({
//   model: "grok-beta",
//   messages: [
//     {
//       role: "system",
//       content:
//         "You are Grok, a chatbot inspired by the Hitchhiker's Guide to the Galaxy.",
//     },
//     {
//       role: "user",
//       content: "What is the meaning of life, the universe, and everything?",
//     },
//   ],
// });

// console.log(completion.choices[0].message);

// import Anthropic from "@anthropic-ai/sdk";

// const anthropic = new Anthropic({
//   apiKey: API_KEY,
//   baseURL: "https://api.x.ai/v1/chat/completions",
// });
// const msg = await anthropic.messages.create({
//   model: "grok-beta",
//   max_tokens: 128,
//   system:
//     "You are Grok, a chatbot inspired by the Hitchhiker's Guide to the Galaxy.",
//   messages: [
//     {
//       role: "user",
//       content: "What is the meaning of life, the universe, and everything?",
//     },
//   ],
// });
// console.log(msg);// Base Grok class

import dotenv from "dotenv";
dotenv.config();

// import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
// const GROK_MAGIC_WAND = process.env.GROK_MAGIC_WAND;
class BaseGrok {
  constructor() {
    this.name = "Base Grok";
    this.context = {}; // Stores session-based data
  }

  async processMessage(messages) {
    return `🤖 I have no intelligence yet for ${messages}, but I'm here for you! ✨`;
  }

  setContext(key, value) {
    this.context[key] = value;
  }

  getContext(key) {
    return this.context[key];
  }
}

export class OpenAIGrok extends BaseGrok {
  constructor(apiKey) {
    super();
    this.name = "OpenAI Grok";
    this.openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.x.ai/v1",
    });
  }

  async processMessage(messages) {
    try {
      const completion = await this.openai.chat.completions.create({
          // model: "grok-beta",
          model: 'grok-2-1212',
        messages,
      });
      return completion.choices[0].message.content;
    } catch (error) {
      return `❌ OpenAI Grok failed: ${error.message}`;
    }
  }
}

class AnthropicGrok extends BaseGrok {
  constructor(apiKey) {
    super();
    this.name = "Anthropic Grok";
    this.anthropic = new (require("@anthropic-ai/sdk"))({
      apiKey: apiKey,
      baseURL: "https://api.x.ai/v1/chat/completions",
    });
  }

  async processMessage(messages) {
    try {
      const response = await this.anthropic.messages.create({
        model: "grok-beta",
        max_tokens: 128,
        messages,
      });
      return response.completion;
    } catch (error) {
      return `❌ Anthropic Grok failed: ${error.message}`;
    }
  }
}

export default {
  BaseGrok,
  OpenAIGrok,
  AnthropicGrok,
};
// module.exports = {
// };
