import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

// Import combined routes
import apiRoutes from './routes/routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRoutes);  // Add a common prefix like /api for all routes

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  const host = `http://localhost:${PORT}`;  // Full URL with localhost
  console.log(`Server is running at ${host}`);
});
