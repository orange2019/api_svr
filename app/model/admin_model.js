const Sequelize = require('sequelize')
const BaseModel = require('./base_model')

class AdminModel extends BaseModel {

  constructor() {
    super()

    let model = this.db().define('admin', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: Sequelize.STRING(128)
      },
      password: {
        type: Sequelize.STRING(12)
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
      }

    }, {
      timestamps: true,
      createdAt: 'create_time',
      updatedAt: 'update_time',
      freezeTableName: true,
      tableName: 't_admin'
    })

    this._model = model
    return this
  }


}

module.exports = function () {
  return new AdminModel()
}