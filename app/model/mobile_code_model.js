const Sequelize = require('sequelize')
const BaseModel = require('./base_model')

class MobileCodeModel extends BaseModel {
  constructor() {
    super()
    let model = this.db().define('mall_code', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      mobile: {
        type: Sequelize.STRING(30)
      },
      code: {
        type: Sequelize.STRING(12)
      },
      status: {
        type: Sequelize.SMALLINT(1),
        defaultValue: 0
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
    //   timestamps: true,  
      createdAt: 'create_time',
      updatedAt: 'update_time',
      freezeTableName: true,
      tableName: 't_mobile_code'
    })
    this._model = model
    return this
  }
}

module.exports = function () {
  return new MobileCodeModel()
}