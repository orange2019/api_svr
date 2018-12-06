const Sequelize = require('sequelize')
const BaseModel = require('./base_model')

class InvestModel extends BaseModel {

  constructor() {
    super()

    let model = this.db().define('invest', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(64)
      },
      num: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
        get() {
          const num = this.getDataValue('num')
          return num / 100000000
        },
        set(val) {
          this.setDataValue('num', val * 100000000)
        }
      },
      rate: {
        type: Sequelize.DECIMAL(2, 2)
      },
      days: {
        type: Sequelize.BIGINT(11)
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
        defaultValue: 1
      },
      sort: {
        type: Sequelize.BIGINT(11),
        defaultValue: 0
      }

    }, {
      timestamps: true,
      createdAt: 'create_time',
      updatedAt: 'update_time',
      freezeTableName: true,
      tableName: 't_invest'
    })

    this._model = model
    return this
  }


}

module.exports = function () {
  return new InvestModel()
}