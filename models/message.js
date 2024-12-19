'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Message.belongsTo(models.User, { foreignKey: "user_id" });
      Message.belongsTo(models.Subscription, {
        foreignKey: "model",
        targetKey: "model",
      });
    }
  }
  Message.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
      },
      user_id: DataTypes.BIGINT,
      content: DataTypes.TEXT,
      response: DataTypes.TEXT,
      model: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Message",
    }
  );
  return Message;
};