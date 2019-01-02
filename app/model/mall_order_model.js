const Sequelize = require('sequelize')
const BaseModel = require('./base_model')

class MallOrderModel extends BaseModel {

  constructor() {
    super()

    let model = this.db().define('mall_order', {
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
        type: Sequelize.TEXT(),
        defaultValue: '',
        get() {
          const val = this.getDataValue('goods_items')
          return val ? JSON.parse(val) : []
        },
        set(val) {
          val = val ? JSON.stringify(val) : ''
          this.setDataValue('goods_items', val)
        }
      },
      amount: {
        type: Sequelize.FLOAT(20 , 2),
        defaultValue:0
      },
      amount_logistics: {
        type: Sequelize.FLOAT(20 , 2),
        defaultValue:0,
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
        defaultValue: ''
      },
      logistics_no: {
        type: Sequelize.STRING(64),
        defaultValue: ''
      },
      address: {
        type: Sequelize.TEXT(),
        defaultValue: '',
        get() {
          const val = this.getDataValue('address')
          return val ? JSON.parse(val) : []
        },
        set(val) {
          val = val ? JSON.stringify(val) : ''
          this.setDataValue('address', val)
        }
      },
      order_no: {
        type: Sequelize.STRING(32),
        defaultValue: ''
      },
      remark: {
        type: Sequelize.STRING(255),
        defaultValue: ''
      }

    }, {
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