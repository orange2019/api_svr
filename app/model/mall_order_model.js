const Sequelize = require('sequelize')
const BaseModel = require('./base_model')

class MallOrderModel extends BaseModel {

  constructor() {
    super()

    let model = this.db().define('mall_order', 
    {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.BIGINT,
      },
      goods_ids: {
        type: Sequelize.TEXT()
      },
      goods_items: {
        type: Sequelize.TEXT()
      },
      amount: {
        type: Sequelize.FLOAT(20)
      },
      addr_name: {
        type: Sequelize.STRING(64),
      },
      addr_mobile: {
        type: Sequelize.STRING(12),
      },
      addr_info: {
        type: Sequelize.STRING(255),
      },
      addr_postcode: {
        type: Sequelize.STRING(12),
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
      logistics_company: {
        type: Sequelize.STRING(12),
        defaultValue: 0
      },
      logistics_no: {
        type: Sequelize.STRING(64),
        defaultValue: 0
      }

    }, 
    {
      timestamps: true,
      createdAt: 'create_time',
      updatedAt: 'update_time',
      freezeTableName: true,
      tableName: 't_mall_order'
    })

    this._model = model
    return this
  }


}

module.exports = function () {
  return new MallOrderModel()
}