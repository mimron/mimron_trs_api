'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Member extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Member.init({
    branch_id: DataTypes.STRING,
    rep_id: DataTypes.STRING,
    name: DataTypes.STRING,
    current_position: DataTypes.STRING,
    manager_id: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Member',
  });
  return Member;
};