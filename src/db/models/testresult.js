'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class TestResult extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      TestResult.belongsTo(models.User, { foreignKey: 'user_id' });

    }
  }
  TestResult.init({
    user_id: DataTypes.INTEGER,
    food: DataTypes.STRING,
    status: DataTypes.STRING,
    test_type: DataTypes.STRING,
    submission_date: DataTypes.DATE,
    completion_date: DataTypes.DATE,
    sent_date: DataTypes.DATE,
    result_details: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'TestResult',
  });


  return TestResult;
};