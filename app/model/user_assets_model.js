const Sequelize = require('sequelize')
const BaseModel = require('./base_model')
const errCode = require('./../common/err_code')
const DECIMALS = require('./../../config').decimals
class UserAssetsModel extends BaseModel {

  constructor() {
    super()

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

    this._model = model
    return this
  }

  /**
   * 添加用户tokenNum
   * @param {*} userId 
   * @param {*} num 
   * @param {*} t 
   */
  async addtokenNum(ctx, userId, num, t = null) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    if (num < 0) {
      ret.code = errCode.FAIL.code
      ret.message = 'num error'
      return ret
    }

    let data = await this.model().findOne({
      where: {
        user_id: userId
      }
    })
    let opts = {}
    if (t) opts.transaction = t

    if (!data) {
      data = await this.model().create({
        user_id: userId,
        token_num: num
      })
    } else {
      data.token_num = (data.token_num * DECIMALS + num * DECIMALS) / DECIMALS
      data.save()
    }

    return ret

  }

}

module.exports = function () {
  return new UserAssetsModel()
}