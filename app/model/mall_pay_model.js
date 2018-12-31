const Sequelize = require('sequelize')
const BaseModel = require('./base_model')

class MallPayModel extends BaseModel {

  constructor() {
    super()

    let model = this.db().define('mall_pay', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.BIGINT,
        defaultValue: 0
      },
      order_id: {
        type: Sequelize.BIGINT,
        efaultValue: 0
      },
      num: {
        type: Sequelize.FLOAT(11, 2)
      },
      create_time: {
        type: Sequelize.BIGINT(11),
        defaultValue: parseInt(Date.now() / 1000)
      },
      update_time: {
        type: Sequelize.BIGINT(11),
        defaultValue: parseInt(Date.now() / 1000)
      },
      status: {
        type: Sequelize.TINYINT(2),
        defaultValue: 1
      },
      type: {
        type: Sequelize.TINYINT(2),
        defaultValue: 1
      }

    }, {
      timestamps: true,
      createdAt: 'create_time',
      updatedAt: 'update_time',
      freezeTableName: true,
      tableName: 't_mall_pay'
    })

    this._model = model
    return this
  }


}

module.exports = function () {
  return new MallPayModel()
}