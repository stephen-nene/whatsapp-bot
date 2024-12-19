'use strict';
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Payment, { foreignKey: "user_id" });
      User.hasMany(models.Message, { foreignKey: "user_id" });
      User.hasMany(models.UserSubscription, { foreignKey: "user_id" });
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
      },
      phonenumber: DataTypes.BIGINT,
      user_name: DataTypes.STRING,
      email: DataTypes.STRING,
      free_messages: DataTypes.INTEGER,
      service_at: DataTypes.DATE,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};