'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here
      // User.hasMany(models.TestResult, { foreignKey: 'user_id' });
      // User.hasMany(models.Session, { foreignKey: 'user_id', as: "Sessions"});
    }
  }

  User.init({
    registration_number: DataTypes.STRING,
    full_name: DataTypes.STRING,
    email: DataTypes.STRING,
    id_number: DataTypes.STRING,
    kra_pin: DataTypes.STRING,
    huduma_number: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};
