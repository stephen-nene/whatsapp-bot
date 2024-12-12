// homecontroller.js
import logger from '../utils/logger.js';
// List of Ruby on Rails jokes
const jokes = [
    'Why do Ruby on Rails developers never go broke? Because they always get a good return on investment (RoR)!',
    'Why did the Ruby developer go broke? He couldn’t get a good *block* in his career!',
    'What’s the difference between a Ruby on Rails developer and a magician? One pulls rabbits out of a hat, and the other pulls out *controllers*!',
    'Why don’t Ruby on Rails developers ever have arguments? Because they just *resolve* them!',
    'Why do Ruby on Rails developers make terrible secret agents? Because they’re always caught in the *MVC*!',
  ];

export const getWelcomeMessage = (req, res) => {
  const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
  logger.info(`GET / - Responding with joke: ${randomJoke}`);
  res.json({
    message: 'Welcome to the API!',
    joke: randomJoke,
  });
};
