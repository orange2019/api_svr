const Sequelize = require('sequelize')
const BaseModel = require('./base_model')

class UserAssetsModel extends BaseModel {

  constructor() {
    super()

    let model = this.db().define('user_assets', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      user_id : {
        type: Sequelize.BIGINT,
        defaultValue: 0
      },
      fod_num: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
        get() {
          const num = this.getDataValue('fod_num')
          return num / 100000000
        },
        set(val) {
          this.setDataValue('fod_num', val * 100000000)
        }
      },
      fod_num_frozen: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
        get() {
          const num = this.getDataValue('fod_num_frozen')
          return num / 100000000
        },
        set(val) {
          this.setDataValue('fod_num_frozen', val * 100000000)
        }
      },
      create_time: {
        type: Sequelize.BIGINT(11),
        defaultValue: parseInt(Date.now() / 1000)
      },
      update_time: {
        type: Sequelize.BIGINT(11),
        defaultValue: parseInt(Date.now() / 1000)
      },
      score: {
        type: Sequelize.BIGINT,
        defaultValue: 0
      },

    }, {
      timestamps: true,
      createdAt: 'create_time',
      updatedAt: 'update_time',
      freezeTableName: true,
      tableName: 't_user_assets'
    })

    this._model = model
    return this
  }

}

module.exports = function () {
  return new UserAssetsModel()
}