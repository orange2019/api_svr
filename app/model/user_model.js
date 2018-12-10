const Sequelize = require('sequelize')
const BaseModel = require('./base_model')
const UuidUtils = require('./../utils/uuid_utils')
const dateUtils = require('./../utils/date_utils')
const uuidUtils = require('./../utils/uuid_utils')
const errCode = require('./../common/err_code')
const Op = Sequelize.Op

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
      password_trade: {
        type: Sequelize.STRING(128),
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
      avatar: {
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

  investModel() {
    let model = this.db().define('user_invest', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.BIGINT,
        defaultValue: 0
      },
      invest_id: {
        type: Sequelize.BIGINT,
        defaultValue: 0
      },
      create_time: {
        type: Sequelize.BIGINT(11),
        defaultValue: parseInt(Date.now() / 1000)
      },
      start_time: {
        type: Sequelize.BIGINT(11),
        defaultValue: 0
      },
      end_time: {
        type: Sequelize.BIGINT(11),
        defaultValue: 0
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
      uuid: {
        type: Sequelize.STRING(64),
        defaultValue: Sequelize.UUIDV4
      }
    }, {
      timestamps: true,
      createdAt: 'create_time',
      updatedAt: false,
      freezeTableName: true,
      tableName: 't_user_invest'
    })

    return model
  }

  investChildModel() {
    let model = this.db().define('user_invest_child', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.BIGINT,
        defaultValue: 0
      },
      child_id: {
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
      }
    }, {
      timestamps: true,
      createdAt: 'create_time',
      updatedAt: 'update_time',
      freezeTableName: true,
      tableName: 't_user_invest_child'
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
      invest_id: {
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
      // num: {
      //   type: Sequelize.BIGINT,
      //   defaultValue: 0,
      //   get() {
      //     const num = this.getDataValue('num')
      //     return num / 100000000
      //   },
      //   set(val) {
      //     this.setDataValue('num', val * 100000000)
      //   }
      // },
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
      user_invest_id: {
        type: Sequelize.BIGINT,
        defaultValue: 0
      }
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
      }

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
   * 获取用户资产
   * @param {*} userId 
   */
  async getAssetsByUserId(userId) {
    let ret = await this.assetsModel().findOne({
      where: {
        user_id: userId
      }
    })
    if (!ret) {
      ret = await this.assetsModel().create({
        user_id: userId
      })
    }
    return ret
  }

  /**
   * 获取所有子级
   * @param {*} userIds 
   * @param {*} level 
   * @param {*} arr 
   */
  async getAllChilds(userIds = [], level = 0, arr = []) {
    let map = {
      pid: {
        [Op.in]: userIds
      }
    }

    let items = await this.model().findAll({
      where: map
    })
    if (items.length) {
      let pids = []
      arr[level] = []
      items.forEach(item => {
        arr[level].push(item.dataValues)
        pids.push(item.id)
      })

      level++

      return await this.getAllChilds(pids, level, arr)

    } else {
      return arr
    }
  }


  /**
   * 记录子级收益加成
   * @param {*} userId 
   * @param {*} childId 
   * @param {*} num 
   */
  async recordChildInvest(userId, childId, num) {
    // let item = await this.investChildModel().findOne({
    //   where: {
    //     user_id: userId,
    //     child_id: childId
    //   }
    // })

    // if (item) {
    //   item.num = item.num + num
    //   await item.save()

    // } else {
    //   item = await this.investChildModel().create({
    //     user_id: userId,
    //     child_id: childId,
    //     num: num
    //   })
    // }
    let item = await this.investChildModel().create({
      user_id: userId,
      child_id: childId,
      num: num
    })

    return item
  }

  async getUserInfoByUserId(userId) {
    let ret = await this.infoModel().findOne({
      where: {
        user_id: userId
      }
    })
    if (!ret) {
      ret = await this.infoModel().create({
        user_id: userId
      })
    }
    return ret
  }

}

module.exports = function () {
  return new UserModel()
}