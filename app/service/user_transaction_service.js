const Log = require('./../../lib/log')('user_service')
const UserModel = require('./../model/user_model')
const UserAssetsModel = require('./../model/user_assets_model')
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
      limit: limit
    })

    Log.info(ctx.uuid, 'getUserInfoList().queryRet', queryRet)
    ret.data = queryRet
    ctx.result = ret
    return ret

  }

  /**
   * 失效接口
   * @param {*} ctx 
   */
  async apply(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let body = ctx.body || {}
    Log.info(ctx.uuid, 'getUserInfoList().body', body)
    let t = await UserModel().getTrans()

    let userTransaction = await UserModel().transactionModel().findOne({
      where: {
        uuid: body.uuid
      }
    })
    if (!userTransaction) {
      ret.code = errCode.SUCCESS.code
      ret.message = '未找到相关条目'

      ctx.result = ret
      return ret
    }

    try {
      // TODO 是否要从接口更新资产

      userTransaction.status = 1
      let saveRet = await userTransaction.save({
        transaction: t
      })
      if (saveRet.id && userTransaction.type == 1) {
        // 用户资产添加
        let userId = userTransaction.user_id
        let num = userTransaction.num_get
        let addAssetsRet = await UserAssetsModel().addFodNum(ctx, userId, num, t)
        if (addAssetsRet.code != 0) {
          ret.code = addAssetsRet.code
          ret.message = addAssetsRet.message

          t.rollback()
          ctx.result = ret
          return ret
        }
      }

      // TODO 减少资产

      t.commit()
      ctx.result = ret
      return ret

    } catch (err) {
      console.log(err)
      Log.info(ctx.uuid, 'getUserInfoList().err', err)
      t.rollback()

      ret.code = errCode.FAIL.code
      ret.message = '操作失败'

      ctx.result = ret
      return ret
    }


  }

  /**
   * 用户资产更新
   * @param {*} ctx 
   */
  async userAssetsUpdate(ctx, userId = null , t = null, self = false) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    try {

      let body = ctx.body || {}
      Log.info(ctx.uuid, 'userAssetsUpdate().body', body)
      userId = userId || body.user_id

      let user = await UserModel().model().findById(userId)
      Log.info(ctx.uuid, 'userAssetsUpdate().user', user)
      if (!user) {
        ret.code = errCode.FAIL.code
        ret.message = '未找到用户'

        throw new Error(ret)

      }

      // TODO 接口获取用户信息
      let fetchUserInfo = {}
      let newFodNum = fetchUserInfo.fod_num || user.fod_num + 1
      // 测试片段

      if (newFodNum == user.fod_num) {

        ctx.result = ret
        if (t && !self) {
          t.commit()
        }
        return ret
      }

      let createRet = await UserModel().userTransactionCreate(userId, newFodNum, 9, 0, '', t)
      Log.info(ctx.uuid, 'userAssetsUpdate().createRet', createRet)
      if (createRet.code != 0) {

        throw new Error(createRet)
      }

      let createUuid = createRet.data.uuid
      let updateRet = await UserModel().userTransUpdateComplete(createUuid, t)
      Log.info(ctx.uuid, 'userAssetsUpdate().createUuid', createUuid)
      if (updateRet.code !== 0) {
        throw new Error(updateRet)
      }
    } catch (e) {
      ret.code = e.code || errCode.FAIL.code || -1
      ret.message = e.message || 'err'


      if (t && !self) {
        t.rollback()
      }
    }

    if (t && !self) {
      t.commit()
    }

    ctx.result = ret
    return ret
  }

  /**
   * 添加转账信息
   * @param {*
   *  body : {
   *    user_id : ,
   *    to_user_id : '',
   *    amount: 0
   * }
   * } ctx 
   */
  async userTransferAdd(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let body = ctx.body || {}
    Log.info(ctx.uuid, 'userTransferAdd().body', body)
    let userId = body.user_id
    let toUserId = body.to_user_id
    let user = await UserModel().model().findById(userId)
    let toUser = await UserModel().model().findById(toUserId)

    Log.info(ctx.uuid, 'userTransferAdd().user', user, 'toUser', toUser)
    if (!user || !toUser) {
      ret.code = errCode.FAIL.code
      ret.message = '未找到用户'

      ctx.result = ret
      return ret
    }

    let amount = body.amount || 0
    // let type = body.type || 1
    // if (type != 3 || type != 4) {
    //   ret.code = errCode.FAIL.code
    //   ret.message = 'type err'

    //   ctx.result = ret
    //   return ret
    // }

    let t = await UserModel().getTrans()

    try {
      let addRet1 = UserModel().userTransactionCreate(userId, amount, 4, toUserId, '', t)
      let addRet2 = UserModel().userTransactionCreate(toUserId, amount, 3, userId, '', t)

      let addRet = await Promise.all(addRet1, addRet2)
      if (addRet[0].code !== 0 || addRet[1].code !== 0) {
        throw new Error(addRet[0].code ? addRet[1] : addRet[0])
      }

      ret.data = {
        uuid: {
          user_id: addRet[0].data.uuid,
          to_user_id: addRet[1].data.uuid
        }
      }

    } catch (err) {

      ret.code = err.code || errCode.FAIL.code || -1
      ret.message = err.message || errCode.FAIL.message || 'err'

      t.rollback()

    }

    t.commit()
    ctx.result = ret
    return ret
  }

  /**
   * 转账成功
   * @param {*
   *  body {
   *    uuids : {
   *      user_id : uuid,
   *      to_user_id : uuid
   *    }
   *  }
   * } ctx 
   */
  async userTransferFinish(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let body = ctx.body || {}
    Log.info(ctx.uuid, 'userTransferFinish().body', body)

    let uuids = body.uuids
    let userIds = Object.keys(uuids)

    let t = await UserModel().getTrans()

    try {
      for (let index = 0; index < userIds.length; index++) {
        const userId = userIds[index]
        let transUuid = uuids[userId]
  
        let user = await UserModel().model().findById(userId)
        Log.info(ctx.uuid, 'userTransferFinish().user', user)
        if (!user) {
          ret.code = errCode.FAIL.code
          ret.message = '未找到用户'
  
          throw new Error(ret)
        }
  
        let retFinish = await this._transactionFinish(ctx, transUuid, userId , t)
        if(retFinish.code !== 0){
          throw new Error(retFinish)
        }
  
      }
    }catch(err){
      t.rollback()

      ret.code = err.code || errCode.FAIL.code || -1
      ret.message = err.message || errCode.FAIL.message || 'error'
    }

    t.commit()
    ctx.result = ret
    return ret
    
    
  }
  /**
   * 充值提现
   * @param {*
   *  body : {
   *    user_id: ''
   *    amount : 0
   *  }
   * } ctx 
   */
  async transAssetsAdd(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let body = ctx.body || {}
    Log.info(ctx.uuid, 'transAssetsAdd().body', body)
    let userId = body.user_id
    let user = await UserModel().model().findById(userId)
    Log.info(ctx.uuid, 'transAssetsAdd().user', user)
    if (!user) {
      ret.code = errCode.FAIL.code
      ret.message = '未找到用户'

      ctx.result = ret
      return ret
    }

    let amount = body.amount || 0
    let type = body.type || 1
    if (type != 1 || type != 2 || type != 5 || type != 6) {
      ret.code = errCode.FAIL.code
      ret.message = 'type err'

      ctx.result = ret
      return ret
    }

    let remark = body.remark || ''
    let createRet = await UserModel().userTransactionCreate(userId, amount, type, 0, remark, null)
    Log.info(ctx.uuid, 'userAssetsUpdate().createRet', createRet)
    if (createRet.code != 0) {
      return createRet
    }

    ret.data = {
      uuid : createRet.data.uuid
    }
    ctx.result = ret
    return ret

  }

  /**
   * 交易更新
   * @param {*} ctx 
   * @param {*} uuid 
   * @param {*} userId 
   * @param {*} t 
   */
  async _transactionFinish(ctx, uuid, userId, t = null) {

    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    // 先通过接口更新一下
    let assetsUpdateRet = await this.userAssetsUpdate(ctx, t, true)
    Log.info(ctx.uuid, '_transactionFinish().assetsUpdateRet', assetsUpdateRet)
    if (assetsUpdateRet.code !== 0) {
      ret.code = assetsUpdateRet.code
      ret.message = '更新用户资产失败:' + assetsUpdateRet.message
      // throw new Error(ret)
      return ret
    }

    // 通过交易记录更新
    let transCompleteRet = await UserModel().userTransUpdateComplete(uuid, userId, t)
    Log.info(ctx.uuid, '_transactionFinish().transCompleteRet', transCompleteRet)
    if (transCompleteRet.code !== 0) {
      ret.code = transCompleteRet.code
      ret.message = '更新用户交易失败:' + transCompleteRet.message
      // throw new Error(ret)
      return ret
    }
  }
  /**
   * 
   * @param {*
   *   body : {
   *      uuid: ''
   *      user_id : '' 
   *   }
   * } ctx 
   */
  async transAssetsFinish(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let body = ctx.body || {}
    Log.info(ctx.uuid, 'transAssetsFinish().body', body)
    let userId = body.user_id
    let user = await UserModel().model().findById(userId)
    Log.info(ctx.uuid, 'transAssetsFinish().user', user)
    if (!user) {
      ret.code = errCode.FAIL.code
      ret.message = '未找到用户'

      ctx.result = ret
      return ret
    }

    let t = await UserModel().getTrans()

    try {
      // let assetsUpdateRet = await this.userAssetsUpdate(ctx, t, true)
      // Log.info(ctx.uuid, 'transAssetsFinish().assetsUpdateRet', assetsUpdateRet)
      // if (assetsUpdateRet.code !== 0) {
      //   ret.code = assetsUpdateRet.code
      //   ret.message = '更新用户资产失败:' + assetsUpdateRet.message
      //   throw new Error(ret)
      // }

      // let transCompleteRet = await UserModel().userTransUpdateComplete(body.uuid, userId, t)
      // Log.info(ctx.uuid, 'transAssetsFinish().transCompleteRet', transCompleteRet)
      // if (transCompleteRet.code !== 0) {
      //   ret.code = transCompleteRet.code
      //   ret.message = '更新用户交易失败:' + transCompleteRet.message
      //   throw new Error(ret)
      // }
      let finishRet = await this._transactionFinish(ctx, body.uuid, userId, t) 
      if (finishRet.code !== 0) {
        throw new Error(finishRet)
      }
      

    } catch (err) {
      t.rollback()

      ret.code = err.code || errCode.FAIL.code || -1
      ret.message = err.message || errCode.FAIL.message || 'error'

    }

    t.commit()
    ctx.result = ret
    return ret

  }
  /**
   * 添加一笔交易
   * @param {*} ctx 
   */
  async add(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let body = ctx.body || {}
    Log.info(ctx.uuid, 'getUserInfoList().body', body)

    let userId = body.user_id
    let user = await UserModel().model().findById(userId)
    if (!user || user.status != 1) {
      ret.code = errCode.FAIL.code
      ret.message = '未找到用户或用户未审核'

      ctx.result = ret
      return ret
    }

    let addData = {
      user_id: userId
    }
    let type = body.type || 1
    let num = body.num

    if (type == 1) {
      addData.type = type
      addData.num_get = num
    }
    Log.info(ctx.uuid, 'getUserInfoList().addData', addData)

    let userTransaction = await UserModel().transactionModel().create(addData)
    Log.info(ctx.uuid, 'getUserInfoList().userTransaction', userTransaction.dataValues)

    ret.data = userTransaction.dataValues

    ctx.result = ret
    return ret
  }


}

module.exports = new UserTransactionService