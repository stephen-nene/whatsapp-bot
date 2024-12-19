"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class UserSubscription extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserSubscription.belongsTo(models.User, { foreignKey: "user_id" });
      UserSubscription.belongsTo(models.Subscription, {
        foreignKey: "subscription_id",
      });
    }
  }
  UserSubscription.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
      },
      user_id: DataTypes.BIGINT,
      subscription_id: DataTypes.BIGINT,
      remaining_Qs: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: "UserSubscription",
    }
  );
  return UserSubscription;
};
