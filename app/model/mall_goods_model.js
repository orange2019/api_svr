const Sequelize = require('sequelize')
const BaseModel = require('./base_model')

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
      price_logistics: {
        type: Sequelize.DECIMAL(),
        defaultValue: 0
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
      },
      pics: {
        type: Sequelize.TEXT,
        defaultValue: '',
        get() {
          const text = this.getDataValue('pics')
          return text ? JSON.parse(text) : []
        },
        set(val) {
          let text = val ? JSON.stringify(val) : ''
          this.setDataValue('pics', text)
        }
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