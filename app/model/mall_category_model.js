const Sequelize = require('sequelize')
const BaseModel = require('./base_model')

class mallCategoryModel extends BaseModel {
  constructor() {
    super()
    let model = this.db().define('mall_category', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      pid: {
        type: Sequelize.BIGINT,
        defaultValue: 0
      },
      name: {
        type: Sequelize.STRING(24)
      },
      sort: {
        type: Sequelize.INTEGER(11)
      },
      status: {
        type: Sequelize.INTEGER(2),
      },
      create_time: {
        type: Sequelize.BIGINT(11),
        defaultValue: parseInt(Date.now() / 1000)
      },
      update_time: {
        type: Sequelize.BIGINT(11),
        defaultValue: parseInt(Date.now() / 1000)
      },
      
    }, {
      timestamps: true,
      createdAt: 'create_time',
      updatedAt: 'update_time',
      freezeTableName: true,
      tableName: 't_mall_category'
    })
    this._model = model
    return this
  }
}

module.exports = function () {
  return new mallCategoryModel()
}