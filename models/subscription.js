"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Subscription extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Subscription.hasMany(models.Payment, { foreignKey: "subscription_id" });
      Subscription.hasMany(models.UserSubscription, {
        foreignKey: "subscription_id",
      });
      Subscription.hasMany(models.Message, {
        foreignKey: "model",
        sourceKey: "model",
      });
    }
  }
  Subscription.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
      },
      name: DataTypes.TEXT,
      price: DataTypes.FLOAT,
      model: DataTypes.TEXT,
      // model: {
      //   type: DataTypes.ENUM("grok-beta", "grok-vision-beta", "grok-2-1212"),
      //   allowNull: false,
      // },
      question_limit: DataTypes.INTEGER,
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Subscription",
    }
  );
  return Subscription;
};
