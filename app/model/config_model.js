const Sequelize = require('sequelize')
const BaseModel = require('./base_model')

class ConfigModel extends BaseModel {

  constructor() {
    super()

    let model = this.db().define('config', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: Sequelize.STRING(64),
        defaultValue: ''
      },
      name: {
        type: Sequelize.STRING(24)
      },
      info: {
        type: Sequelize.TEXT,
        defaultValue: ''
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
      type: {
        type: Sequelize.INTEGER(2),
        defaultValue: 1
      },


    }, {
      timestamps: true,
      createdAt: 'create_time',
      updatedAt: 'update_time',
      freezeTableName: true,
      tableName: 't_config'
    })

    this._model = model
    return this
  }


}

module.exports = function () {
  return new ConfigModel()
}