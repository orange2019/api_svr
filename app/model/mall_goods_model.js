const Sequelize = require('sequelize')
const BaseModel = require('./base_model')
// const UuidUtils = require('./../utils/uuid_utils')
// const dateUtils = require('./../utils/date_utils')
// const uuidUtils = require('./../utils/uuid_utils')
// const errCode = require('./../common/err_code')
// const Op = Sequelize.Op
class mallGoodsModel extends BaseModel {
  constructor() {
    super()
    let model = this.db().define('mall_goods', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      c_id: {
        type: Sequelize.BIGINT,
        defaultValue: 0
      },
      name: {
        type: Sequelize.STRING(255)
      },
      cover: {
        type: Sequelize.STRING(255)
      },
      info: {
        type: Sequelize.TEXT(),
        defaultValue: ''
      },
      price: {
        type: Sequelize.DECIMAL(),
        defaultValue: 0
      },
      stock: {
        type: Sequelize.INTEGER(11),
        defaultValue: 0
      },
      description: {
          type: Sequelize.STRING(255),
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
        type: Sequelize.INTEGER(2),
        defaultValue: 0
      }
    }, {
      timestamps: true,
      createdAt: 'create_time',
      updatedAt: 'update_time',
      freezeTableName: true,
      tableName: 't_mall_goods'
    })
    this._model = model
    return this
  }
}

module.exports = function () {
  return new mallGoodsModel()
}