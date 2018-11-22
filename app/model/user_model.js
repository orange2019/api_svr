const Sequelize = require('sequelize')
const BaseModel = require('./base_model')
const UuidUtils = require('./../utils/uuid_utils')
const dateUtils = require('./../utils/date_utils')

class UserModel extends BaseModel {

  constructor() {
    super()

    let model = this.db().define('user', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      pid : {
        type: Sequelize.BIGINT,
        defaultValue: 0
      },
      mobile: {
        type: Sequelize.STRING(16)
      },
      password: {
        type: Sequelize.STRING(128)
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
      auth_token: {
        type: Sequelize.STRING(128),
        defaultValue: ''
      },
      fod_token: {
        type: Sequelize.STRING(128),
        defaultValue: ''
      },
      uuid: {
        type: Sequelize.STRING(128),
        defaultValue: UuidUtils.v4()
      },

    }, {
      timestamps: true,
      createdAt: 'create_time',
      updatedAt: 'update_time',
      freezeTableName: true,
      tableName: 't_user'
    })

    this._model = model
    return this
  }

  formulaModel(){
    let model = this.db().define('user_formula' , {
      user_id : {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: false
      },
      invest_formula: {
        type: Sequelize.TEXT,
        defaultValue: '',
        get() {
          const text = this.getDataValue('invest_formula')
          return text ? JSON.parse(text) : {}
        },
        set(val) {
          let text = val ? JSON.stringify(val) : ''
          this.setDataValue('invest_formula', text);
        }
      }
    },{
      timestamps: false,
      createdAt: false,
      updatedAt: false,
      freezeTableName: true,
      tableName: 't_user_formula'
    })

    return model
  }

  investLogsModel(){
    let model = this.db().define('user_invest_logs' , {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      user_id : {
        type: Sequelize.BIGINT,
        defaultValue: 0
      },
      create_time: {
        type: Sequelize.BIGINT(11),
        defaultValue: parseInt(Date.now() / 1000)
      },
      log_date: {
        type: Sequelize.STRING(8),
        defaultValue: dateUtils.dateFormat(null , 'YYYYMMDD')
      },
      num : {
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
      num_frozen : {
        type: Sequelize.BIGINT,
        defaultValue: 0,
        get() {
          const num = this.getDataValue('num_frozen')
          return num / 100000000
        },
        set(val) {
          this.setDataValue('num_frozen', val * 100000000)
        }
      },
      num_self : {
        type: Sequelize.BIGINT,
        defaultValue: 0,
        get() {
          const num = this.getDataValue('num_self')
          return num / 100000000
        },
        set(val) {
          this.setDataValue('num_self', val * 100000000)
        }
      },
      num_child : {
        type: Sequelize.BIGINT,
        defaultValue: 0,
        get() {
          const num = this.getDataValue('num_child')
          return num / 100000000
        },
        set(val) {
          this.setDataValue('num_child', val * 100000000)
        }
      },
    },{
      timestamps: true,
      createdAt: 'create_time',
      updatedAt: false,
      freezeTableName: true,
      tableName: 't_user_invest_logs'
    })

    return model
  }

}

module.exports = function () {
  return new UserModel()
}