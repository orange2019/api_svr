const Log = require('./../../lib/log')('user_service')
const UserModel = require('./../model/user_model')
const errCode = require('./../common/err_code')
const Op = require('sequelize').Op

class UserTransactionService {

  /**
   * 交易列表
   * @param {*} ctx 
   */
  async list(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let body = ctx.body || {}
    Log.info(ctx.uuid, 'getUserInfoList().query', body)

    let userModel = UserModel().model()
    let userTransactionModel = UserModel().transactionModel()
    let userInfoModel = UserModel().infoModel()

    userTransactionModel.belongsTo(userModel, {
      targetKey: 'id',
      foreignKey: 'user_id'
    })
    userTransactionModel.belongsTo(userInfoModel, {
      targetKey: 'user_id',
      foreignKey: 'user_id'
    })

    let map = {}

    if (body.user_id) {
      map.user_id = body.user_id
    }
    if (body.type != 0) {
      map.type = body.type
    }
    let offset = body.offset || 0
    let limit = body.limit || 10

    let queryRet = await userTransactionModel.findAndCountAll({
      where: map,
      include: [{
          model: userInfoModel,
          attributes: ['realname']
        },
        {
          model: userModel,
          attributes: ['mobile']
        }
      ],
      offset: offset,
      limit: limit,
      order: [
        ['create_time', 'desc']
      ]
    })

    Log.info(ctx.uuid, 'getUserInfoList().queryRet', queryRet)
    ret.data = queryRet
    ctx.result = ret
    return ret

  }

  /**
   * 交易(充值，提现，转账)
   * ctx
   */
  async transafer(ctx, t = null) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let body = ctx.body || {}
    Log.info(ctx.uuid, 'transafer().body', body)

    let transType = body.type || 3
    let hash = body.hash || ''
    let userId = body.user_id
    let toUserId = body.to_user_id || 0
    let gasUsed = body.gas || 0

    if (transType == 3) {
      toUserId = body.to_user_id
    }

    let transationData = {
      user_id: userId,
      num: body.num || 0,
      type: transType,
      to: toUserId,
      hash: hash,
      gas_used: gasUsed
    }

    let opts = {}
    if (t) {
      opts.transaction = t
    }
    let saveRet = await UserModel().transactionModel().create(transationData, opts)
    if (!saveRet) {
      ret.code = errCode.FAIL.code
      ret.message = '保存用户交易记录失败'

    }

    ctx.result = ret
    return ret

  }




}

module.exports = new UserTransactionService