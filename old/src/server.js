import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan'; // Import morgan for HTTP logging
import logger from './utils/logger.js'; // Import the logger utility

// Import combined routes
import apiRoutes from './routes/routes.js';

const app = express();



// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()), // Use winston for logging
    },
  })
);

// Routes
app.use('/api', apiRoutes); 

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.url} - ${err.message}`);
  res.status(500).json({ error: 'An internal server error occurred' });
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  const host = `http://localhost:${PORT}`; // Full URL with localhost
  console.log(`Starting server on http://localhost:${PORT}`);
  // logger.info(`Server is running at ${host}`)/;
});
