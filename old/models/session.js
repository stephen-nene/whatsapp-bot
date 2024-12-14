'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Session extends Model {
    static associate(models) {
      // Association with User model
      Session.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }

  Session.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      session_state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      AccountSid: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ProfileName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      WaId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    {
      sequelize,
      modelName: 'Session',
    }
  );

  return Session;
};
