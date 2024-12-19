import db from "../../models/index.js"; // Assuming you've already configured Sequelize

export const modelsController = {
  // Create a new AI model
  async createModel(req, res) {
    try {
      const { name, model, price, question_limit, description } = req.body;

      const newModel = await db.Subscription.create({
        name,
        model,
        price,
        question_limit,
        description,
      });

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(newModel));
    } catch (error) {
      console.error("Error creating model:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Error creating model",
          error: error.message,
        })
      );
    }
  },

  // Get all AI models
  async getAllModels(req, res) {
    try {
      const models = await db.Subscription.findAll();
      console.log("Total users in database:", models.length);

      // Send the JSON response manually
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(models));
    } catch (error) {
      console.error("Error fetching models:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Error fetching models",
          error: error.message,
        })
      );
    }
  },
  // Get a specific AI model by ID
  // Get a specific AI model by ID
  async getModelById(req, res) {
    try {
        const { id } = req.params;
        console.log("ID is",id);
      const model = await db.Subscription.findByPk(id);

      if (model) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(model));
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Model not found" }));
      }
    } catch (error) {
      console.error("Error fetching model by ID:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Error fetching model by ID",
          error: error.message,
        })
      );
    }
  },

  // Update an AI model
  async updateModel(req, res) {
    try {
      const { id } = req.params;
      const { name, model, price, question_limit, description } = req.body;

      const aiModel = await db.Subscription.findByPk(id);

      if (!aiModel) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "AI model not found" }));
      }

      aiModel.name = name || aiModel.name;
      aiModel.model = model || aiModel.model;
      aiModel.price = price || aiModel.price;
      aiModel.question_limit = question_limit || aiModel.question_limit;
      aiModel.description = description || aiModel.description;

      await aiModel.save();

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(aiModel));
    } catch (error) {
      console.error("Error updating AI model:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Error updating AI model",
          error: error.message,
        })
      );
    }
  },

  // Delete an AI model
  async deleteModel(req, res) {
    try {
      const { id } = req.params;

      const aiModel = await db.Subscription.findByPk(id);
      if (!aiModel) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Model not found" }));
      }

      await aiModel.destroy();

      res.writeHead(204, { "Content-Type": "application/json" });
      res.end();
    } catch (error) {
      console.error("Error deleting model:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Error deleting model",
          error: error.message,
        })
      );
    }
  },
};
