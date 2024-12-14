'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.TestResult, { foreignKey: 'user_id' });
      User.hasMany(models.Session, { foreignKey: 'user_id', as: "Sessions" });
    }
  }

  User.init(
    {
      registration_number: DataTypes.STRING,
      first_name: DataTypes.STRING,
      middle_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email: DataTypes.STRING,
      full_name: DataTypes.STRING,
      id_number: DataTypes.STRING,
      kra_pin: DataTypes.STRING,
      huduma_number: DataTypes.STRING,
      // createdAt: DataTypes.DATE,
      // updatedAt: DataTypes.DATE
    },
    {
      sequelize,
      modelName: 'User',
    }
  );

  return User;
};
