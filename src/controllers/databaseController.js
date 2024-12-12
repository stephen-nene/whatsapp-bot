import db from "../db/models/index.js";

export const getDatabaseController = {
  // Get all users
  async getAllUsers(req, res) {
    try {
      const users = await db.User.findAll({
        include: [
            {
                model: db.TestResult,
                as: 'TestResults'
            }
        ]
      });

    console.log("Total users in database:", users.length);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({
        message: "Error fetching users",
        error: error.message,
      });
    }
  },

  // Get a specific user by ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      console.log("Attempting to find user with ID:", id);
      const user = await db.User.findByPk(id, {
        include: [
          {
            model: db.TestResult,
            as: "TestResults",
          },
        ],
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({
        message: "Error fetching user",
        error: error.message,
      });
    }
  },

  // Get all test results
  async getAllTestResults(req, res) {
    try {
      const results = await db.TestResult.findAll({
        include: [
          {
            model: db.User,
            attributes: ["id", "name", "email"],
          },
        ],
      });
      res.json(results);
    } catch (error) {
      console.error("Error fetching test results:", error);
      res.status(500).json({
        message: "Error fetching test results",
        error: error.message,
      });
    }
  },

  // Get test results for a specific user
  async getTestResultsByUser(req, res) {
    try {
      const { userId } = req.params;
      const results = await db.TestResult.findAll({
        where: { UserId: userId },
        include: [
          {
            model: db.User,
            attributes: ["id", "name", "email"],
          },
        ],
      });

      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "No test results found for this user" });
      }

      res.json(results);
    } catch (error) {
      console.error("Error fetching user test results:", error);
      res.status(500).json({
        message: "Error fetching user test results",
        error: error.message,
      });
    }
  },

  // Get all active sessions
  async getAllSessions(req, res) {
    try {
      const sessions = await db.Session.findAll({
        include: [
          {
            model: db.User,
            attributes: ["id", "name", "email"],
          },
        ],
      });
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({
        message: "Error fetching sessions",
        error: error.message,
      });
    }
  },

  // Get sessions for a specific user
  async getSessionsByUser(req, res) {
    try {
      const { userId } = req.params;
      const sessions = await db.Session.findAll({
        where: { UserId: userId },
        include: [
          {
            model: db.User,
            attributes: ["id", "name", "email"],
          },
        ],
      });

      if (sessions.length === 0) {
        return res
          .status(404)
          .json({ message: "No sessions found for this user" });
      }

      res.json(sessions);
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      res.status(500).json({
        message: "Error fetching user sessions",
        error: error.message,
      });
    }
  },
};
