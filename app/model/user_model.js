const Sequelize = require('sequelize')
const BaseModel = require('./base_model')
const UuidUtils = require('./../utils/uuid_utils')
const dateUtils = require('./../utils/date_utils')
const uuidUtils = require('./../utils/uuid_utils')

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
      code: {
        type: Sequelize.STRING(12),
        defaultValue: uuidUtils.random(8)
      }

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

  infoModel(){
    let model = this.db().define('user_info' , {
      id : {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: false
      },
      user_id: {
        type : Sequelize.BIGINT,
        defaultValue: 0
      },
      nickname: {
        type: Sequelize.STRING(128),
        defaultValue:''
      },
      realname: {
        type: Sequelize.STRING(128),
        defaultValue:''
      },
      sex: {
        type : Sequelize.TINYINT(1),
        defaultValue:0
      },
      birth: {
        type : Sequelize.BIGINT(11),
        defaultValue:0
      },
      idcard_no: {
        type: Sequelize.STRING(32),
        defaultValue:''
      },
      idcard_positive: {
        type: Sequelize.STRING(255),
        defaultValue:''
      },
      idcard_reverse: {
        type: Sequelize.STRING(255),
        defaultValue:''
      },
      address: {
        type: Sequelize.TEXT,
        defaultValue: '',
        get() {
          const text = this.getDataValue('address')
          return text ? JSON.parse(text) : {}
        },
        set(val) {
          let text = val ? JSON.stringify(val) : ''
          this.setDataValue('address', text)
        }
      },
      create_time: {
        type: Sequelize.BIGINT(11),
        defaultValue: parseInt(Date.now() / 1000)
      },
      update_time: {
        type: Sequelize.BIGINT(11),
        defaultValue: parseInt(Date.now() / 1000)
      }
    },{
      timestamps: true,
      createdAt: 'create_time',
      updatedAt: 'update_time',
      freezeTableName: true,
      tableName: 't_user_info'
    })

    return model
  }

  transactionModel(){
    let model = this.db().define('user_transaction' , {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      user_id : {
        type: Sequelize.BIGINT,
        defaultValue: 0
      },
      type: {
        type: Sequelize.TINYINT(2),
        defaultValue:1
      },
      num_get: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
        get() {
          const num = this.getDataValue('num_get')
          return num / 100000000
        },
        set(val) {
          this.setDataValue('num_get', val * 100000000)
        }
      },
      num_sent: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
        get() {
          const num = this.getDataValue('num_sent')
          return num / 100000000
        },
        set(val) {
          this.setDataValue('num_sent', val * 100000000)
        }
      },
      score_get:{
        type: Sequelize.BIGINT,
        defaultValue:0
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
        defaultValue:0
      },
      uuid: {
        type:Sequelize.STRING(64),
        defaultValue: Sequelize.UUIDV4
      }
    }, {
      timestamps: true,
      createdAt: 'create_time',
      updatedAt: 'update_time',
      freezeTableName: true,
      tableName: 't_user_transaction'
    })

    return model
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