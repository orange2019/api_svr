const Sequelize = require('sequelize')
const BaseModel = require('./base_model')
const UuidUtils = require('./../utils/uuid_utils')
const dateUtils = require('./../utils/date_utils')
const uuidUtils = require('./../utils/uuid_utils')
const errCode = require('./../common/err_code')

class UserModel extends BaseModel {

  constructor() {
    super()

    let model = this.db().define('user', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      pid: {
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
      auth_token_1: {
        type: Sequelize.STRING(128),
        defaultValue: ''
      },
      auth_token_2: {
        type: Sequelize.STRING(128),
        defaultValue: ''
      },
      uuid: {
        type: Sequelize.STRING(128),
        defaultValue: UuidUtils.v4()
      },
      invite_code: {
        type: Sequelize.STRING(12),
        defaultValue: uuidUtils.random(8)
      },
      wallet_address: {
        type: Sequelize.STRING(64),
        defaultValue: ''
      },
      private_key: {
        type: Sequelize.STRING(128),
        defaultValue: ''
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

  infoModel() {
    let model = this.db().define('user_info', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: false
      },
      user_id: {
        type: Sequelize.BIGINT,
        defaultValue: 0
      },
      nickname: {
        type: Sequelize.STRING(128),
        defaultValue: ''
      },
      realname: {
        type: Sequelize.STRING(128),
        defaultValue: ''
      },
      sex: {
        type: Sequelize.TINYINT(1),
        defaultValue: 0
      },
      birth: {
        type: Sequelize.BIGINT(11),
        defaultValue: 0
      },
      idcard_no: {
        type: Sequelize.STRING(32),
        defaultValue: ''
      },
      idcard_positive: {
        type: Sequelize.STRING(255),
        defaultValue: ''
      },
      idcard_reverse: {
        type: Sequelize.STRING(255),
        defaultValue: ''
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
      },
    }, {
      timestamps: true,
      createdAt: 'create_time',
      updatedAt: 'update_time',
      freezeTableName: true,
      tableName: 't_user_info'
    })

    return model
  }

  transactionModel() {
    let model = this.db().define('user_transaction', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.BIGINT,
        defaultValue: 0
      },
      type: {
        type: Sequelize.TINYINT(2),
        defaultValue: 1
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
      score: {
        type: Sequelize.BIGINT,
        defaultValue: 0
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
        defaultValue: 0
      },
      uuid: {
        type: Sequelize.STRING(64),
        defaultValue: Sequelize.UUIDV4
      },
      to_user_id: {
        type: Sequelize.BIGINT(20),
        defaultValue: 0
      },
      hash: {
        type: Sequelize.STRING(128),
        defaultValue: ''
      },
      gas_used: {
        type: Sequelize.BIGINT,
        defaultValue: ''
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

  formulaModel() {
    let model = this.db().define('user_formula', {
      user_id: {
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
    }, {
      timestamps: false,
      createdAt: false,
      updatedAt: false,
      freezeTableName: true,
      tableName: 't_user_formula'
    })

    return model
  }

  investLogsModel() {
    let model = this.db().define('user_invest_logs', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.BIGINT,
        defaultValue: 0
      },
      create_time: {
        type: Sequelize.BIGINT(11),
        defaultValue: parseInt(Date.now() / 1000)
      },
      log_date: {
        type: Sequelize.STRING(8),
        defaultValue: dateUtils.dateFormat(null, 'YYYYMMDD')
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
      num_frozen: {
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
      num_self: {
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
      num_child: {
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
    }, {
      timestamps: true,
      createdAt: 'create_time',
      updatedAt: false,
      freezeTableName: true,
      tableName: 't_user_invest_logs'
    })

    return model
  }

  assetsModel() {
    let model = this.db().define('user_assets', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.BIGINT,
        defaultValue: 0
      },
      token_num: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
        get() {
          const num = this.getDataValue('token_num')
          return num / 100000000
        },
        set(val) {
          this.setDataValue('token_num', val * 100000000)
        }
      },
      token_num_frozen: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
        get() {
          const num = this.getDataValue('token_num_frozen')
          return num / 100000000
        },
        set(val) {
          this.setDataValue('token_num_frozen', val * 100000000)
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

    return model
  }

  /**
   * 创建用户交易
   * @param {*} userId 
   * @param {*} amount 
   * @param {*} type 
   * @param {*} locationUserId 
   * @param {*} remark 
   * @param {*} t 
   */
  async userTransactionCreate(userId, amount, type = 1, locationUserId = 0, remark = {}, t = null) {
    let ret = {
      code: errCode.FAIL.code,
      message: errCode.FAIL.message
    }

    if (amount <= 0) {
      ret.message = 'amount err'
      return ret
    }

    let num = 0
    let score = 0

    // 完成的时候找
    // let userAssest = await this.assetsModel().findOne({
    //   where : {user_id : userId}
    // })

    if (type == 1 || type == 3 || type == 5 || type == 9) {
      num = amount
    } else if (type == 2 || type == 4 || type == 6) {
      num = -1 * amount
    } else if (type == 7) {
      score = amount
    } else if (type == 8) {
      score = -1 * amount
    }

    // let numOld =0
    // let numNew = 0
    // let scoreOld = 0
    // let scoreNew = 0

    // if(userAssest){
    //   numOld = userAssest.token_num
    //   scoreOld = userAssest.score

    //   if(type == 9){
    //     numNew = num
    //   }else {
    //     numNew = numOld + num 
    //   }

    //   scoreNew = scoreOld + score
    //   if(numNew < 0 || scoreNew < 0){
    //     ret.message = 'amount new err'
    //     return ret
    //   }

    // }else {
    //   numOld = 0
    //   numNew = num
    //   scoreOld = 0
    //   scoreNew = score
    // }

    let createData = {
      user_id: userId,
      num: num,
      // num_old: numOld,
      // num_new: numNew,
      score: score,
      // score_old: scoreOld,
      // score_new: scoreNew,
      remark: remark ? JSON.stringify(remark) : '',
      location_user_id: locationUserId
    }

    let opts = {}
    if (t) {
      opts.transaction = t
    }

    let createRet = await this.transactionModel().create(createData, opts)
    if (!createRet.id) {
      ret.message = 'create err'
      return ret
    }

    ret.data = {
      id: createRet.id,
      uuid: createRet.uuid
    }
    ret.code = errCode.SUCCESS.code
    ret.message = errCode.SUCCESS.message
    return ret
  }

  /**
   * 用户交易完成，资产更新
   * @param {*} uuid 
   */
  async userTransUpdateComplete(uuid, userId, t = null) {
    let ret = {
      code: errCode.FAIL.code,
      message: errCode.FAIL.message
    }

    let userTrans = await this.transactionModel().findOne({
      where: {
        uuid: uuid
      }
    })

    if (!userTrans != userTrans.user_id != userId) {
      ret.message = 'trans item find err'
      return ret
    }

    let userAssets = await this.assetsModel().findOne({
      where: {
        user_id: userTrans.user_id
      }
    })
    // if(!userAssets){
    //   ret.message = 'user assest find err'
    //   return ret
    // }
    let num = userTrans.num
    let score = userTrans.score

    let numOld = 0
    let numNew = 0
    let scoreOld = 0
    let scoreNew = 0
    let type = userTrans.dataValues.type

    if (userAssets) {
      numOld = userAssets.token_num
      scoreOld = userAssets.score

      if (type == 9) {
        numNew = num
      } else {
        numNew = numOld + num
      }

      scoreNew = scoreOld + score
      if (numNew < 0 || scoreNew < 0) {
        ret.message = 'amount new err'
        return ret
      }

    } else {
      numOld = 0
      numNew = num
      scoreOld = 0
      scoreNew = score
    }

    let opts = {}
    if (t) {
      opts.transaction = t
    }
    userAssets.token_num = numNew
    userAssets.score = scoreNew

    let userAssestRet = await userAssets.save(opts)
    if (!userAssestRet) {
      ret.message = 'user assets update err'
      return ret
    }

    userTrans.status = 1
    userTrans.num_old = numOld
    userTrans.num_new = numNew
    userTrans.score_old = scoreOld
    userTrans.score_new = scoreNew
    let userTransRet = await userTrans.save(opts)
    if (!userTransRet) {
      ret.message = 'user trans update err'
      return ret
    }

    ret.code = errCode.SUCCESS.code
    ret.message = errCode.SUCCESS.message
    return ret
  }


}

module.exports = function () {
  return new UserModel()
}