"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Payment.belongsTo(models.User, { foreignKey: "user_id" });
      Payment.belongsTo(models.Subscription, { foreignKey: "subscription_id" });
    }
  }
  Payment.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
      },
      user_id: DataTypes.BIGINT,
      subscription_id: DataTypes.STRING,
      amount: DataTypes.FLOAT,
      status: { type: DataTypes.ENUM("success", "failed", "pending") },
    },
    {
      sequelize,
      modelName: "Payment",
    }
  );
  return Payment;
};
